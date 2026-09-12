import type { WebSourceItem } from './types';
import { WIKI_HEADERS } from './fetch';
import { cleanSnippet } from './text';
import { isRelevantResult, significantQueryTokens } from './relevance';

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December';

/** Full calendar dates only ("19 November 2026") — bare years are too noisy. */
const DATE_RE = new RegExp(
  `\\b(?:\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}|(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4})\\b`
);

function isDateSeeking(query: string): boolean {
  return /\b(when|release dates?|launch dates?|come out|release|launch)\b/i.test(query);
}

interface AnswerMiner {
  name: string;
  queryRe: RegExp;
  cues: RegExp[];
  needsName?: boolean;
  needsNumber?: boolean;
}

// Deterministic answer-type miners: question shape → sentence cues.
// Every miner also requires a significant query token in the sentence so
// generic matches ("born in 1960" for the wrong person) stay out.
const ANSWER_MINERS: AnswerMiner[] = [
  {
    name: 'who',
    queryRe: /\bwho\b/i,
    cues: [/directed by/i, /created by/i, /founded by/i, /played by/i, /portrayed by/i, /written by/i, /\bborn\b/i, /stars? /i, /starring/i],
    needsName: true,
  },
  {
    name: 'where',
    queryRe: /\bwhere\b/i,
    cues: [/located/i, /headquartered/i, /based in/i, /takes place/i, /\bset in\b/i, /filmed in/i, /born in/i],
  },
  {
    name: 'how-many',
    queryRe: /\bhow (many|much|long|old)\b/i,
    cues: [],
    needsNumber: true,
  },
];

const FULL_NAME_RE = /[A-Z][a-z]+ [A-Z][A-Za-z]+/;
// Bare years ("1997") must not satisfy a how-many query — strip them first.
// Number words included: articles write "eleven Academy Awards", not "11".
const YEAR_RE = /\b(19|20)\d{2}\b/g;
const NUMBER_RE = /\d[\d,]*/;
const NUMBER_WORD_RE =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|hundred|thousand|million|billion|dozen)\b/i;

function hasRealNumber(s: string): boolean {
  const deyear = s.replace(YEAR_RE, '');
  return NUMBER_RE.test(deyear) || NUMBER_WORD_RE.test(s);
}

function mineGenericFacts(fullText: string, query: string, keys: string[]): string[] {
  const miners = ANSWER_MINERS.filter(m => m.queryRe.test(query));
  if (miners.length === 0 || keys.length === 0) return [];
  const scored: Array<{ s: string; keyHits: number; seenKey: string }> = [];
  for (const raw of fullText.split(/(?<=[.!?])\s+/)) {
    const s = raw.trim();
    if (s.length === 0 || s.length > 350) continue;
    const slow = s.toLowerCase();
    const keyHits = keys.filter(k => slow.includes(k)).length;
    if (keyHits === 0) continue;
    const hit = miners.some(
      m =>
        (m.cues.length === 0 || m.cues.some(c => c.test(s))) &&
        (!m.needsName || FULL_NAME_RE.test(s)) &&
        (!m.needsNumber || hasRealNumber(s))
    );
    if (!hit) continue;
    scored.push({ s, keyHits, seenKey: s.slice(0, 60).toLowerCase() });
  }
  // Most query overlap first: "won 11 Academy Awards" beats production trivia.
  scored.sort((a, b) => b.keyHits - a.keyHits);
  const seen = new Set<string>();
  const facts: string[] = [];
  for (const c of scored) {
    if (seen.has(c.seenKey)) continue;
    seen.add(c.seenKey);
    facts.push(cleanSnippet(c.s));
    if (facts.length >= 2) break;
  }
  return facts;
}

/**
 * Full-article mining, one fetch: release-date sentences first, then
 * who/where/how-many answer sentences. Caps at 2 so replies stay tight.
 */
async function fetchMinedFacts(
  title: string,
  query: string,
  keys: string[],
  timeoutMs: number
): Promise<string[]> {
  try {
    // Full plaintext (exchars truncates mid-lead on this endpoint and cuts the date).
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(
      title
    )}&format=json&utf8=&origin=*`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: WIKI_HEADERS,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) as Array<{ extract?: string }> : [];
    const text = pages[0]?.extract || '';
    if (!text) return [];

    const seen = new Set<string>();
    const facts: string[] = [];
    const take = (s: string): boolean => {
      const key = s.slice(0, 60).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      facts.push(cleanSnippet(s));
      return facts.length >= 2;
    };
    // Pass 1: release-date sentences ("...released on 19 November 2026...").
    // (Caller already verified the summary lacks a date.)
    if (isDateSeeking(query)) {
      for (const raw of text.split(/(?<=[.!?])\s+/)) {
        const s = raw.trim();
        if (s.length === 0 || s.length > 350) continue;
        if (!/releas|launch|schedul|delay|debut/i.test(s) || !DATE_RE.test(s)) continue;
        if (take(s)) return facts;
      }
    }
    // Pass 2: who/where/how-many miners (query-token anchored).
    for (const f of mineGenericFacts(text, query, keys)) {
      if (take(f)) break;
    }
    return facts;
  } catch {
    return [];
  }
}

/**
 * Fallback to Wikipedia REST summary when needed.
 * Date-seeking queries ("when ... release?") also mine the full article for
 * release-date sentences — the short summary extract usually lacks the date.
 */
export async function searchWikipediaFallback(
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

    const candidate = {
      title: summaryData.title || topItem.title,
      url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topItem.title)}`,
      snippet: cleanSnippet(summaryData.extract),
      domain: 'wikipedia.org',
    };
    // Reject off-topic top hits so the caller can retry a sharper query variant.
    if (!isRelevantResult(query, candidate.title, candidate.snippet)) return null;

    // Answer-seeking query whose summary lacks the goods → mine the article:
    // release dates first, then who/where/how-many miners. Summary stays.
    const keys = significantQueryTokens(query);
    if (!DATE_RE.test(candidate.snippet) || minersApply(query)) {
      const facts = await fetchMinedFacts(topItem.title, query, keys, timeoutMs);
      if (facts.length > 0) {
        candidate.snippet = `${facts.join(' ')}\n\n${candidate.snippet}`;
      }
    }
    return candidate;
  } catch {
    return null;
  }
}

function minersApply(query: string): boolean {
  return ANSWER_MINERS.some(m => m.queryRe.test(query));
}
