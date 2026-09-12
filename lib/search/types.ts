export type FieldType = 'title' | 'heading' | 'summary' | 'body';

export interface DocumentSection {
  id: string; // e.g. "stack#frameworks"
  slug: string; // e.g. "stack" or "home"
  url: string; // e.g. "/writing/stack#frameworks"
  pageTitle: string; // e.g. "My Stack"
  heading: string; // e.g. "Frameworks"
  level: number; // 2 for H2, 3 for H3, etc.
  summary?: string;
  publishedAt?: string;
  text: string;
  sentences: string[];
  fieldTokens: Record<FieldType, string[]>;
  fieldLengths: Record<FieldType, number>;
}

export interface InvertedIndexPosting {
  sectionId: string;
  field: FieldType;
  tf: number;
  positions: number[];
}

export interface TermEntry {
  df: number; // Document (section) frequency
  idf: number; // Inverse document frequency
  postings: InvertedIndexPosting[];
  sectionPostings?: Map<string, InvertedIndexPosting[]>;
}

export interface ScoredSection {
  section: DocumentSection;
  bm25Score: number;
  coverageRatio: number;
  matchedTokens: string[];
  proximityBonus: number;
  phraseBonus: number;
  totalScore: number;
}
