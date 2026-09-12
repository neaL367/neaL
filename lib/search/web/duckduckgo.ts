import type { WebSourceItem } from './types';
import { SEARCH_HEADERS } from './fetch';
import { cleanSnippet, decodeHtmlEntities, extractActualUrl, extractDomain } from './text';
import { isRelevantResult } from './relevance';

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
      if (!isRelevantResult(query, title, snippet)) continue;

      seenDomains.add(domain);
      sources.push({ title, url: actualUrl, snippet, domain });
      if (sources.length >= 4) break;
    }

    return sources;
  } catch {
    return [];
  }
}
