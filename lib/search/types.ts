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
}

export interface KnowledgeTriple {
  subject: string;
  predicate: string; // e.g. "studies_at", "uses_framework", "worked_at", "dream"
  aliases: string[]; // Variations of the predicate or subject question
  object: string; // Direct factual answer
  url: string;
  sourceTitle: string;
  contextSentence: string;
}

export type QuestionIntentType =
  | 'wh_who'
  | 'wh_what'
  | 'wh_when'
  | 'wh_where'
  | 'wh_why'
  | 'wh_how'
  | 'boolean'
  | 'list'
  | 'factoid'
  | 'general'
  | 'quiz'
  | 'quiz_eval'
  | 'teaching'
  | 'correctness'
  | 'talking'
  | 'opinion';

export interface ParsedQuery {
  raw: string;
  normalized: string;
  correctedNormalized: string;
  intent: QuestionIntentType;
  primaryTokens: string[];
  stemmedTokens: string[];
  expandedTerms: string[];
  expectedAnswerType: 'person' | 'date' | 'location' | 'tool_list' | 'explanation' | 'any';
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

export interface ExtractedAnswer {
  found: boolean;
  directAnswer: string;
  confidence: number; // 0.0 to 1.0
  intent: QuestionIntentType;
  matchedKeywords: string[];
  bestSentence: string;
  sources: Array<{
    title: string;
    heading: string;
    url: string;
    excerpt: string;
  }>;
  relatedSuggestions?: string[];
  explanation?: string;
}
