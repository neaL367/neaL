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
  category: 'javascript' | 'typescript' | 'react' | 'css' | 'web' | 'architecture' | 'tools';
}
