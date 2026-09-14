/**
 * Nara V2 — core types.
 *
 * Design rules this file encodes:
 *  - Confidence is EVIDENCE-based, never "a concept was mentioned".
 *  - Every answer is traceable to a source record (no free-floating prose).
 *  - All state that arrives from the client is untrusted and typed as such.
 */

// ─── Knowledge layer ─────────────────────────────────────────────────────────

/** A curated, self-contained explanation of one engineering concept. */
export interface Topic {
  id: string;
  title: string;
  keywords: string[];
  phrases?: string[];
  summary: string;
  detail: string;
  level: 'beginner' | 'intermediate' | 'expert';
  relatedConcepts: string[];
  category: string;
  /** Optional real code sample. When present it is rendered as a fenced block. */
  code?: string;
  /** One-line honest description of WHAT the code demonstrates. */
  codeCaption?: string;
  /**
   * ISO date (YYYY-MM-DD) on which this entry's facts were last checked against
   * a source. Required for any entry whose content can go stale — sales totals,
   * release dates, "current" status, personnel. Absent means the content is
   * historical and does not drift.
   */
  verifiedAt?: string;
  /**
   * What specifically is time-sensitive here, so the staleness is visible to a
   * maintainer rather than implicit. Only meaningful alongside `verifiedAt`.
   */
  timeSensitive?: string;
  /** Source URLs the entry's facts were verified against. */
  sources?: string[];
}

/** A short dictionary-style definition used when no full topic exists. */
export interface Concept {
  id: string;
  label: string;
  definition: string;
}

export type ConceptRelation =
  | 'uses'
  | 'built-on'
  | 'relates-to'
  | 'contrasts-with'
  | 'enables';

export interface ConceptNode {
  id: string;
  label: string;
  aliases: string[];
  description: string;
  category: string;
}

export interface ConceptEdge {
  from: string;
  to: string;
  relation: ConceptRelation;
  annotation?: string;
}

/** A subject–predicate–object fact row (Neal's bio, stack, co-op, contact). */
export interface Fact {
  subject: string;
  predicate: string;
  aliases: string[];
  object: string;
  url: string;
  sourceTitle: string;
  contextSentence: string;
  /** ISO date this row's `object` was last verified against a source. */
  verifiedAt?: string;
  /** What goes stale about this row, if anything. */
  timeSensitive?: string;
  /** Source URLs, when the row is not simply quoting this site's own prose. */
  sources?: string[];
}

/** A chunk of real site prose, produced by scripts/build-corpus.ts. */
export interface CorpusSection {
  id: string;
  slug: string;
  url: string;
  pageTitle: string;
  heading: string;
  level: number;
  publishedAt?: string;
  summary: string;
  text: string;
  /** Focused string used for embedding/expansion; falls back to text. */
  embedText?: string;
}

// ─── Query understanding ─────────────────────────────────────────────────────

/**
 * Question SHAPE is decided before topic routing. This is the structural fix
 * for "a greeting outranked a technical question": shape and subject are
 * different decisions and must never compete on one score.
 */
export type AnswerShape =
  | 'definition'   // what is X
  | 'mechanism'    // how does X work
  | 'reason'       // why X
  | 'comparison'   // X vs Y
  | 'enumeration'  // what does X include / list
  | 'fact'         // who/when/where
  | 'opinion'      // what do you think of X
  | 'instance'     // give me an example of X
  | 'social'       // greeting / thanks / bye / small talk
  | 'meta'         // about Nara itself
  | 'safety'       // prompt-injection / jailbreak attempt
  | 'command';     // slash command

export type Intent =
  | 'ask'          // a real information request (shape carries the detail)
  | 'followup'     // continue / deepen the current topic
  | 'correct'      // "no, I mean X"
  | 'reject'       // decline an offer
  | 'affirm'       // accept an offer
  | 'social'
  | 'meta'
  | 'command'
  | 'unknown';

export interface ConceptMatch {
  id: string;
  /** 0..1. Derived from match KIND, not a magic constant. */
  confidence: number;
  kind: 'exact-id' | 'exact-label' | 'alias' | 'phrase' | 'token' | 'fuzzy';
  /** Surface form in the user's text that produced the match. */
  surface: string;
  /** Character span of the match in the normalized query. */
  span: [number, number];
}

export interface NegationSpan {
  /** Concept ids explicitly negated ("not the event loop"). */
  concepts: string[];
  /** True when the whole request is negated ("don't explain closures"). */
  wholeRequest: boolean;
}

export interface QueryAnalysis {
  raw: string;
  normalized: string;
  tokens: string[];
  contentTokens: string[];
  shape: AnswerShape;
  intent: Intent;
  /** Ordered, best-first. Multiple entries = genuinely multi-topic query. */
  concepts: ConceptMatch[];
  negation: NegationSpan;
  /** Resolved referent for pronouns / ellipsis, if any. */
  resolvedReferent?: string;
  /** True when the query carries no content words (e.g. "and?"). */
  isBare: boolean;
  /** Second, independent request found in one message ("X and also Y"). */
  secondary?: string;
  isNonEnglish: boolean;
  /**
   * The message was ONLY greeting/thanks/farewell words. Decided before concept
   * linking, because otherwise small talk attaches a subject and gets answered
   * as a fact ("how are you?" -> an email address).
   */
  isPureSocial: boolean;
  /** A question about Nara itself rather than about the site's content. */
  meta: boolean;
  /** A prompt-injection / jailbreak attempt. */
  injection: boolean;
  /** A request for harmful capability, refused rather than answered. */
  malicious: boolean;
  /** An out-of-scope request for entertainment. */
  joke: boolean;
  /** Which small-talk flavour was detected: greeting | thanks | bye | how_are_you. */
  subKind?: string;
  /** Slash command name, when shape is `command`. */
  command?: string;
  /** Slash command argument ("topics react" -> "react"). */
  commandArg?: string;
  /** A bare arithmetic expression, evaluated instead of retrieved. */
  arithmetic?: string;
  /**
   * The referent was resolved from a PRONOUN ("how does IT handle errors")
   * rather than from a bare follow-up. Such answers are grounded in the
   * previous topic but are not exact hits, so they earn moderate confidence.
   */
  pronounSubject: boolean;
  /** Safe typo corrections that were applied during normalization. */
  corrections: Array<{ from: string; to: string }>;
}

// ─── Retrieval ───────────────────────────────────────────────────────────────

export type Lane = 'topic' | 'fact' | 'corpus' | 'graph';

export interface Candidate {
  id: string;
  lane: Lane;
  title: string;
  heading?: string;
  url?: string;
  /** Full source text available for sentence extraction. */
  text: string;
  /** Lane-local rank-based score from RRF. */
  score: number;
  /** Evidence about WHY this matched — drives the confidence gate. */
  evidence: Evidence;
  /** Present for topic/fact lanes: the structured record behind the hit. */
  topic?: Topic;
  fact?: Fact;
}

/**
 * The replacement for the old `hasStrongLocalConcept = topicHits.length > 0`.
 * Every field is a measured property of the match, so an incidental single
 * token can never masquerade as a confident answer.
 */
export interface Evidence {
  /** Sum of idf weights of distinct query content tokens found in the text. */
  matchedTokenWeight: number;
  /** matchedTokenWeight / total query content token weight. 0..1 */
  coverage: number;
  /** 1.0 for an exact phrase/alias hit, 0 when only bag-of-words matched. */
  phraseStrength: number;
  /** True when the match came from a curated record, not fuzzy guessing. */
  curated: boolean;
  /** How the concept was linked, when a concept is involved. */
  matchKind?: ConceptMatch['kind'];
  /** Number of distinct retrieval lanes that surfaced this candidate. */
  laneVotes: number;
}

export interface RetrievalResult {
  candidates: Candidate[];
  /** Best candidate, exposed ONLY when `confidence` clears the answer gate. */
  best: Candidate | null;
  /** 0..1 composite confidence in `best`. */
  confidence: number;
  /** Populated when confidence is mid-band: ask instead of guessing. */
  ambiguity?: [Candidate, Candidate];
}

// ─── Composition ─────────────────────────────────────────────────────────────

export type AnswerKind = 'answer' | 'clarify' | 'decline' | 'command' | 'smalltalk';

export interface Source {
  title: string;
  heading?: string;
  url?: string;
  /**
   * Short verbatim snippet from the cited record, used for the hover tooltip.
   *
   * This is optional and the UI must treat it as such. The client declared it
   * as REQUIRED while the engine never produced it, so `src.excerpt.replace()`
   * threw `Cannot read properties of undefined` and took out the whole
   * transcript. A citation is still useful without a snippet, so absence is
   * not an error — only unguarded access to it is.
   */
  excerpt?: string;
}

export interface ComposedAnswer {
  kind: AnswerKind;
  text: string;
  sources: Source[];
  suggestions: string[];
  /** Non-fatal diagnostics for the debug view. */
  trace: string[];
}

// ─── Dialogue state (UNTRUSTED when it arrives from the client) ──────────────

export interface TopicMention {
  id: string;
  /** Turn index at which it was last mentioned. */
  turn: number;
  /** How many times the concept has been explained this session. */
  explained: number;
}

export interface OpenQuestion {
  /** The clarification options presented to the user. */
  options: Array<{ label: string; conceptId?: string; kind: AnswerShape; intent: Intent }>;
  askedAtTurn: number;
}

export interface PendingOffer {
  conceptId: string;
  title: string;
  /** What kind of follow-up is on offer. */
  kind: 'code' | 'deepen';
  offeredAtTurn: number;
}

export interface DialogueState {
  version: 2;
  turn: number;
  /** Concept ids only — never display titles (the old mixed-array bug). */
  topicStack: string[];
  mentions: TopicMention[];
  /** Ids already explained, to force substantive variation on revisit. */
  explained: string[];
  offer: PendingOffer | null;
  openQuestion: OpenQuestion | null;
  expertise: 'beginner' | 'intermediate' | 'expert';
  /** Deterministic variety salt; changes per session. */
  salt: number;
  /** Last user/assistant exchange for pronoun resolution. */
  lastUserText: string;
  lastAnswerTitle: string;
}

// ─── Streaming events ────────────────────────────────────────────────────────

export type NaraEvent =
  | { type: 'text'; payload: string }
  | { type: 'sources'; payload: Source[] }
  | { type: 'suggestions'; payload: string[] }
  | { type: 'state'; payload: DialogueState }
  | { type: 'error'; payload: { code: string; message: string } }
  | { type: 'done' };
