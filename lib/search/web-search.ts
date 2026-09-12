/**
 * Multi-Source Live Web Search & Factual Synthesis Engine
 * Searches across the open web (multi-source index + Wikipedia fallback),
 * extracts cross-domain findings, synthesizes a clean Google AI Overview-style consensus in markdown,
 * and provides verified multi-source citations with domain badges.
 *
 * Barrel: preserves the `@/lib/search/web-search` import path.
 * Logic lives in ./web/* modules, each under 400 lines.
 */
import type { WebSearchResult } from './web/types';
import { searchOpenWeb } from './web/duckduckgo';
import { searchWikipediaFallback } from './web/wikipedia';
import { formatSearchTitle } from './web/text';
import { synthesizeTruthOverview } from './web/synthesize';

export type { WebSourceItem, WebSearchResult } from './web/types';
export { formatSearchTitle } from './web/text';

interface WebCacheEntry {
  result: WebSearchResult | null;
  expiresAt: number;
}

const WEB_CACHE = new Map<string, WebCacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const MAX_CACHE_ENTRIES = 100;

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
