export interface DetailedTopic {
  id: string;
  keywords: string[];
  /** Paraphrase vocabulary for the semantic embedding input ONLY.
   * Kept separate from `keywords` (which also feed graph aliases + BM25
   * expansion) because broad phrasing like "render" would hijack exact
   * concept matching while being exactly what dense retrieval needs. */
  phrases?: string[];
  title: string;
  summary: string;
  detail: string;
  level: 'beginner' | 'intermediate' | 'expert';
  relatedConcepts: string[];
  /** Display grouping only — nothing branches on this value. */
  category: string;
  /**
   * ISO date (YYYY-MM-DD) this entry was last checked against a source.
   *
   * REQUIRED in practice for anything that can drift — sales totals, release
   * dates, "current status", studio or personnel changes. `check:knowledge`
   * fails once this is older than a year, so the claim gets re-verified instead
   * of silently rotting. Leave unset for purely historical content.
   */
  verifiedAt?: string;
  /** What specifically goes stale here. Required alongside `verifiedAt`. */
  timeSensitive?: string;
  /** Source URLs the facts were verified against. */
  sources?: string[];
}
