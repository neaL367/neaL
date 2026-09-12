import type { WebSourceItem } from './types';
import { SEARCH_HEADERS } from './fetch';
import { cleanSnippet, decodeHtmlEntities, extractActualUrl, extractDomain } from './text';
import { isRelevantResult } from './relevance';

/**
 * Parse DDG html into sources. Each snippet is located positionally WITHIN
 * its own title's block (up to the next title) — never zipped by array
 * index. A missing snippet (ad block, "people also ask" row) yields no
 * snippet for that result instead of shifting every later pairing off by one.
 * Exported pure for unit tests.
 */
export function parseDuckResults(html: string, query: string): WebSourceItem[] {
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
    const titleEnd = (rawTitles[i].index ?? 0) + rawTitles[i][0].length;
    const nextTitleStart = i + 1 < rawTitles.length ? (rawTitles[i + 1].index ?? Infinity) : Infinity;
    const ownSnippet = rawSnippets.find(s => {
      const at = s.index ?? -1;
      return at >= titleEnd && at < nextTitleStart;
    });
    const snippet = ownSnippet ? cleanSnippet(ownSnippet[1]) : '';
    const domain = extractDomain(actualUrl);

    if (!title || !snippet || snippet.length < 20) continue;
    if (domain === 'duckduckgo.com' || seenDomains.has(domain)) continue;
    if (!isRelevantResult(query, title, snippet)) continue;

    seenDomains.add(domain);
    sources.push({ title, url: actualUrl, snippet, domain });
    if (sources.length >= 4) break;
  }

  return sources;
}

/**
 * Searches the live web via DuckDuckGo open search index with robust AbortSignal timeout.
 */
export async function searchOpenWeb(
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

    return parseDuckResults(await res.text(), query);
  } catch {
    return [];
  }
}
