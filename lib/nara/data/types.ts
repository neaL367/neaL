/**
 * Types for the curated knowledge data.
 *
 * These describe the SHAPE of the authored content only — the topic files, the
 * concept graph and the knowledge triples. They were previously declared in
 * `lib/chat/types.ts`, a module that also carried a great deal of legacy engine
 * state (pending offers, retrieval lanes, conversation turns). V2 needs the
 * data shapes and nothing else, so they live here and the legacy module can be
 * deleted without taking the curated content with it.
 */

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export interface Topic {
  id: string;
  title: string;
  keywords?: string[];
  phrases?: string[];
  summary: string;
  detail: string;
  level?: string;
  relatedConcepts?: string[];
  category?: string;
}

export interface Concept {
  id: string;
  label: string;
  definition: string;
  category?: string;
}

export interface KnowledgeTriple {
  subject: string;
  predicate: string;
  aliases: string[];
  object: string;
  url: string;
  sourceTitle: string;
  contextSentence: string;
}

/**
 * Edge relations, taken from the data itself.
 *
 * The legacy declaration listed `prerequisite | related | contrast | used-by |
 * part-of`, none of which appear anywhere in `concept-graph-data.ts` — the real
 * vocabulary is the five values below. The mismatch was invisible because the
 * file that consumed it had its own untyped copy of the same strings.
 */
export type ConceptRelation =
  | 'built-on'
  | 'uses'
  | 'enables'
  | 'relates-to'
  | 'contrasts-with';

export interface ConceptNode {
  id: string;
  label: string;
  aliases: string[];
  description: string;
  /**
   * Display grouping only — nothing branches on this value, so it is a plain
   * string rather than a union. A union here meant every new subject area
   * needed a type edit before it could be added, and the previous union still
   * listed `languages`/`frameworks` long after those concepts were removed.
   */
  category: string;
}

export interface ConceptEdge {
  from: string;
  to: string;
  relation: ConceptRelation;
  annotation?: string;
}
