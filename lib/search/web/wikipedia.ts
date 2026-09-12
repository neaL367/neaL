import type { WebSourceItem } from './types';
import { WIKI_HEADERS } from './fetch';
import { cleanSnippet } from './text';
import { isRelevantResult } from './relevance';

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December';

/** Full calendar dates only ("19 November 2026") — bare years are too noisy. */
const DATE_RE = new RegExp(
  `\\b(?:\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}|(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4})\\b`
);

function isDateSeeking(query: string): boolean {
  return /\b(when|release dates?|launch dates?|come out|release|launch)\b/i.test(query);
}

/**
 * Pull the plaintext article and return release-date sentences
 * ("...scheduled to be released on 19 November 2026...").
 */
async function fetchDateFacts(title: string, timeoutMs: number): Promise<string[]> {
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
    for (const raw of text.split(/(?<=[.!?])\s+/)) {
      const s = raw.trim();
      if (s.length === 0 || s.length > 350) continue;
      if (!/releas|launch|schedul|delay|debut/i.test(s) || !DATE_RE.test(s)) continue;
      const key = s.slice(0, 60).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push(cleanSnippet(s));
      if (facts.length >= 2) break;
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

    // Date-seeking query + summary lacks a date → mine the full article.
    if (isDateSeeking(query) && !DATE_RE.test(candidate.snippet)) {
      const facts = await fetchDateFacts(topItem.title, timeoutMs);
      if (facts.length > 0) {
        candidate.snippet = `${facts.join(' ')}\n\n${candidate.snippet}`;
      }
    }
    return candidate;
  } catch {
    return null;
  }
}
