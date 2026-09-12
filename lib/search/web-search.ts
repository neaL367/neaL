/**
 * Multi-Source Live Web Search & Factual Synthesis Engine
 * Searches across the open web (multi-source index + Wikipedia fallback),
 * extracts cross-domain findings, synthesizes a clean Google AI Overview-style consensus in markdown,
 * and provides verified multi-source citations with domain badges.
 */

export interface WebSourceItem {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface WebSearchResult {
  found: boolean;
  answer: string;
  sourceTitle: string;
  sourceUrl: string;
  sources?: WebSourceItem[];
}

const SEARCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const WIKI_HEADERS = {
  'User-Agent': 'NaraAssistant/1.0 (https://neal367.com; atichatbusiness@gmail.com)',
  Accept: 'application/json',
};

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function cleanSnippet(text: string): string {
  let s = decodeHtmlEntities(text.replace(/<[^>]+>/g, ''));
  // Strip all emojis and pictographs
  s = s.replace(/\p{Extended_Pictographic}/gu, '');
  // Remove Wikipedia citation brackets like [29]
  s = s.replace(/\[(?:\d+|note\s+\d+)\]/gi, '');
  // Remove trailing ellipsis
  s = s.replace(/\s*\.{2,}\s*$/, '');
  // If there is an unclosed parenthesis like "(Experimental ..." at the end, remove it
  if (s.lastIndexOf('(') > s.lastIndexOf(')')) {
    s = s.slice(0, s.lastIndexOf('(')).trim();
  }
  // Remove leading numbers, bullets, or dashes
  s = s.replace(/^[\s•\-\*\d\.\)]+/, '').trim();
  return s;
}

export function formatSearchTitle(raw: string): string {
  const cleaned = raw
    .replace(/^(who is the|who was the|who are the|who is|who was|who are|who's|what are the|what is the|what were the|what are|what is|what was|tell me about the|tell me about|how does|how do|why is|why are|explain the|explain|the latest features in|latest features in|features in|features of|news about|overview of)\s+/i, '')
    .replace(/[?.,!]/g, '')
    .trim();
  if (!cleaned) return raw;
  return cleaned
    .split(/\s+/)
    .map(w => {
      const upper = w.toUpperCase();
      if (['GTA', 'API', 'HTML', 'CSS', 'UI', 'JS', 'TS', 'RSC', 'URL', 'SEO', 'US', 'USA', 'AI'].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

function extractActualUrl(rawUrl: string): string {
  try {
    if (rawUrl.includes('uddg=')) {
      const param = rawUrl.split('uddg=')[1]?.split('&')[0];
      if (param) return decodeURIComponent(param);
    }
    if (rawUrl.startsWith('//')) return 'https:' + rawUrl;
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function extractDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

// Splits sentences while preserving common abbreviations like U.S., Dr., etc.
function splitSentences(text: string): string[] {
  const protectedText = text
    .replace(/\bU\.S\./g, 'U_S_DOT')
    .replace(/\bDr\./g, 'Dr_DOT')
    .replace(/\bMr\./g, 'Mr_DOT')
    .replace(/\bMrs\./g, 'Mrs_DOT')
    .replace(/\be\.g\./g, 'e_g_DOT')
    .replace(/\bi\.e\./g, 'i_e_DOT');

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map(s =>
      s
        .replace(/U_S_DOT/g, 'U.S.')
        .replace(/Dr_DOT/g, 'Dr.')
        .replace(/Mr_DOT/g, 'Mr.')
        .replace(/Mrs_DOT/g, 'Mrs.')
        .replace(/e_g_DOT/g, 'e.g.')
        .replace(/i_e_DOT/g, 'i.e.')
    );
}

function extractKeywords(s: string): Set<string> {
  const words = s.toLowerCase().match(/\b[a-z0-9]{4,}\b/g) || [];
  return new Set(words);
}

function hasHighOverlap(newWords: Set<string>, existingWordSets: Set<string>[]): boolean {
  if (newWords.size === 0) return true;
  for (const existing of existingWordSets) {
    let intersection = 0;
    for (const w of newWords) {
      if (existing.has(w)) intersection++;
    }
    const overlapRatio = intersection / Math.min(newWords.size, existing.size);
    if (overlapRatio >= 0.55) return true;
  }
  return false;
}

const META_SENTENCE_REGEX = /^(in our|in this (post|blog|article|guide|overview|release)|what's new|how to upgrade|for a list of|read more|click here|discover enterprise|we shared step-by-step|all rights reserved|sign up|subscribe|let's dive in|check out|take a look|learn more|explore how)/i;
const HYPE_SENTENCE_REGEX = /(is here|is packed with|is full of|one of the most|in this blog|stay tuned|follow us on|don't miss out)/i;
const TRUNCATED_TAIL_REGEX = /\b(the|a|an|and|or|of|to|in|for|with|on|at|from|by|is|was|are|were|u\.s\.?)$/i;

/**
 * Synthesizes a clean, factual markdown overview from multiple web sources.
 */
function synthesizeTruthOverview(query: string, sources: WebSourceItem[]): string {
  if (sources.length === 0) return '';

  const displayTitle = formatSearchTitle(query);
  const collectedSentences: string[] = [];
  const existingWordSets: Set<string>[] = [];

  for (const src of sources) {
    const rawSentences = splitSentences(src.snippet);
    for (const raw of rawSentences) {
      let s = cleanSnippet(raw);
      if (s.length < 25 || s.length > 280) continue;
      if (META_SENTENCE_REGEX.test(s) || HYPE_SENTENCE_REGEX.test(s)) continue;
      if (/cookies|privacy policy|terms of use|subscribe|all rights reserved|click here|sign up/i.test(s)) continue;

      const bareText = s.replace(/[.!?]+$/, '').trim();
      if (TRUNCATED_TAIL_REGEX.test(bareText)) continue;

      if (!/[.!?]$/.test(s)) {
        s += '.';
      }

      const words = extractKeywords(s);
      if (!hasHighOverlap(words, existingWordSets)) {
        existingWordSets.push(words);
        collectedSentences.push(s);
        if (collectedSentences.length >= 4) break;
      }
    }
    if (collectedSentences.length >= 4) break;
  }

  if (collectedSentences.length === 0) {
    return cleanSnippet(sources[0]?.snippet || '');
  }

  // Lead paragraph (up to 2 cohesive introductory sentences)
  const leadParagraph = collectedSentences.slice(0, 2).join(' ');
  const bulletPoints = collectedSentences.slice(2);

  let formatted = `### ${displayTitle}\n\n${leadParagraph}`;

  if (bulletPoints.length > 0) {
    formatted += '\n\n' + bulletPoints.map(p => {
      if (p.includes(':') && p.indexOf(':') < 40) {
        const [heading, ...rest] = p.split(':');
        return `- **${heading.trim()}**: ${rest.join(':').trim()}`;
      }
      return `- ${p}`;
    }).join('\n');
  }

  return formatted;
}

interface WebCacheEntry {
  result: WebSearchResult | null;
  expiresAt: number;
}

const WEB_CACHE = new Map<string, WebCacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const MAX_CACHE_ENTRIES = 100;

/**
 * Searches the live web via DuckDuckGo open search index with robust AbortSignal timeout.
 */
async function searchOpenWeb(
  query: string,
  timeoutMs: number = 4000
): Promise<WebSourceItem[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: SEARCH_HEADERS,
    });

    if (!res.ok) return [];

    const html = await res.text();
    const titleRegex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

    const rawTitles = [...html.matchAll(titleRegex)];
    const rawSnippets = [...html.matchAll(snippetRegex)];

    const sources: WebSourceItem[] = [];
    const seenDomains = new Set<string>();

    for (let i = 0; i < rawTitles.length; i++) {
      const rawUrl = rawTitles[i][1];
      const actualUrl = extractActualUrl(rawUrl);
      const title = decodeHtmlEntities(rawTitles[i][2].replace(/<[^>]+>/g, ''));
      const snippet = rawSnippets[i] ? cleanSnippet(rawSnippets[i][1]) : '';
      const domain = extractDomain(actualUrl);

      if (!title || !snippet || snippet.length < 20) continue;
      if (domain === 'duckduckgo.com' || seenDomains.has(domain)) continue;

      seenDomains.add(domain);
      sources.push({ title, url: actualUrl, snippet, domain });
      if (sources.length >= 4) break;
    }

    return sources;
  } catch {
    return [];
  }
}

/**
 * Fallback to Wikipedia REST summary when needed.
 */
async function searchWikipediaFallback(
  query: string,
  timeoutMs: number = 3000
): Promise<WebSourceItem | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&utf8=&origin=*`;

    const searchRes = await fetch(searchUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: WIKI_HEADERS,
    });

    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const topItem = searchData?.query?.search?.[0];
    if (!topItem?.title) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      topItem.title.replace(/\s+/g, '_')
    )}`;

    const summaryRes = await fetch(summaryUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: WIKI_HEADERS,
    });

    if (!summaryRes.ok) return null;

    const summaryData = await summaryRes.json();
    if (summaryData.type === 'disambiguation' || !summaryData.extract) return null;

    return {
      title: summaryData.title || topItem.title,
      url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topItem.title)}`,
      snippet: cleanSnippet(summaryData.extract),
      domain: 'wikipedia.org',
    };
  } catch {
    return null;
  }
}

/**
 * Main Web Search & Synthesis entrypoint with TTL caching.
 */
export async function fetchWebAnswer(
  query: string,
  timeoutMs: number = 4500
): Promise<WebSearchResult | null> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return null;

  const cacheKey = clean.toLowerCase();
  const cached = WEB_CACHE.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  let result: WebSearchResult | null = null;

  // 1. Live Multi-Source Web Search
  const webSources = await searchOpenWeb(clean, timeoutMs);

  if (webSources.length > 0) {
    const answer = synthesizeTruthOverview(clean, webSources);
    result = {
      found: true,
      answer,
      sourceTitle: webSources[0].title,
      sourceUrl: webSources[0].url,
      sources: webSources,
    };
  } else {
    // 2. Wikipedia Fallback
    const wikiSource = await searchWikipediaFallback(clean, 3000);
    if (wikiSource) {
      const displayTitle = formatSearchTitle(clean);
      const answer = `### ${displayTitle}\n\n${wikiSource.snippet}`;
      result = {
        found: true,
        answer,
        sourceTitle: wikiSource.title,
        sourceUrl: wikiSource.url,
        sources: [wikiSource],
      };
    }
  }

  // Update in-memory TTL cache
  if (WEB_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = WEB_CACHE.keys().next().value;
    if (oldestKey) WEB_CACHE.delete(oldestKey);
  }
  WEB_CACHE.set(cacheKey, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return result;
}
