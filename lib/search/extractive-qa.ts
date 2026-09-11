import { BM25FEngine } from './bm25f';
import { SITE_SECTIONS } from './site-index-data';
import type { ScoredSection } from './types';

export interface SiteSearchResult {
  directAnswer: string | null;
  sources: Array<{ title: string; heading: string; url: string; excerpt: string }>;
}

const STOPWORDS = new Set([
  'a','about','an','and','are','as','at','be','by','can','did','do','does',
  'for','from','had','has','have','he','her','him','his','how','i','in','is',
  'it','its','me','my','of','on','or','our','she','so','some','than','that',
  'the','their','them','then','there','these','they','this','to','was','we',
  'were','what','when','where','which','who','why','will','with','would','you','your',
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/).filter((w) => w.length >= 2);
}

class SiteSearch {
  private bm25: BM25FEngine;

  constructor() {
    this.bm25 = new BM25FEngine(SITE_SECTIONS);
  }

  search(query: string): SiteSearchResult {
    const words = tokenize(query);
    const primaryTokens = words.filter((w) => !STOPWORDS.has(w) && w.length >= 2);
    if (primaryTokens.length === 0) return { directAnswer: null, sources: [] };

    const scored: ScoredSection[] = this.bm25.search(primaryTokens, primaryTokens, query.toLowerCase());
    const top = scored[0];
    if (!top) return { directAnswer: null, sources: [] };

    const numPrimary = Math.max(1, primaryTokens.length);
    let isGrounded = false;
    if (numPrimary === 1) isGrounded = top.totalScore >= 2.0;
    else if (numPrimary === 2) isGrounded = top.coverageRatio >= 0.5 && top.totalScore >= 2.5;
    else isGrounded = (top.coverageRatio >= 0.4 && top.totalScore >= 3.0) || top.totalScore >= 6.0;

    if (!isGrounded) return { directAnswer: null, sources: [] };

    const sentences = top.section.sentences
      .map((s) => s.trim())
      .filter((s) => !/^(hi\b|read my writing|export const|in this writing)/i.test(s) && s.length >= 15)
      .map((s) => ({ s, sc: primaryTokens.filter((t) => s.toLowerCase().includes(t)).length }))
      .sort((a, b) => b.sc - a.sc);

    const best = sentences[0]?.s ?? top.section.text.slice(0, 250);

    return {
      directAnswer: best,
      sources: [{ title: top.section.pageTitle, heading: top.section.heading, url: top.section.url, excerpt: best }],
    };
  }
}

const _siteSearch = new SiteSearch();

export function searchSite(query: string): SiteSearchResult {
  return _siteSearch.search(query);
}
