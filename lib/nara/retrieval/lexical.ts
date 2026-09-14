/**
 * Nara V2 — lexical index (IDF, BM25F, phrase matching) + the EVIDENCE model.
 *
 * The central design change from the legacy engine lives here.
 *
 * Legacy: `hasStrongLocalConcept = topicHits.length > 0` decided whether an
 * answer was "confident". Because the fuzzy concept matcher turned
 * "is my cache stale" into the `usestate` topic and "react vs angular" into
 * `angular`, that single boolean promoted pure noise to full-confidence
 * answers. Measured: both returned `technical / <wrong topic> conf=0.9`.
 *
 * V2 never asks "did a concept match?". It measures the MATCH:
 *   - matchedTokenWeight — sum of IDF of distinct query content tokens present
 *   - coverage           — matched weight / total query weight
 *   - phraseStrength     — 1.0 for an exact phrase/alias hit, else 0
 *   - curated            — the hit came from a curated record, not a guess
 *
 * A single incidental token now yields low coverage and stays unconfident, so
 * it becomes a clarifying question or an honest decline instead of an answer.
 */
import type { Candidate, Evidence, Fact } from '../types';
import { DOCS, FACTS, TOPIC_BY_ID, type IndexedDoc } from '../knowledge/index';
import { indexVariants, stem, tokenize } from '../language/text';

// ─── Document preparation ────────────────────────────────────────────────────

interface PreparedDoc {
  doc: IndexedDoc;
  /** Stem -> term frequency in the body. */
  bodyTf: Map<string, number>;
  /** Stem -> term frequency in the title/heading. */
  headTf: Map<string, number>;
  /** Lowercased full text, for phrase matching. */
  lowerText: string;
  lowerHead: string;
  /** Content stems present, for fast coverage tests. */
  stems: Set<string>;
  bodyLength: number;
}

function countTf(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) {
    // Every surface variant maps to the same canonical stem, which is what
    // makes retrieval symmetric where the stemmer is only approximately so.
    for (const v of indexVariants(t)) {
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    const s = stem(t);
    m.set(s, (m.get(s) ?? 0) + 1);
  }
  return m;
}

const PREPARED: PreparedDoc[] = DOCS.map(doc => {
  const bodyTokens = tokenize(doc.text);
  const headTokens = tokenize(`${doc.title} ${doc.heading}`);
  const stems = new Set<string>();
  for (const t of bodyTokens) for (const v of indexVariants(t)) stems.add(v);
  return {
    doc,
    bodyTf: countTf(bodyTokens),
    headTf: countTf(headTokens),
    lowerText: doc.text.toLowerCase(),
    lowerHead: `${doc.title} ${doc.heading}`.toLowerCase(),
    stems,
    bodyLength: Math.max(1, bodyTokens.length),
  };
});

// ─── IDF ─────────────────────────────────────────────────────────────────────

const N_DOCS = Math.max(1, PREPARED.length);
const AVG_BODY_LENGTH =
  PREPARED.reduce((n, p) => n + p.bodyLength, 0) / Math.max(1, PREPARED.length);

/** Document frequency per stem, computed once over every indexed doc. */
const DF = (() => {
  const df = new Map<string, number>();
  for (const p of PREPARED) {
    const seen = new Set<string>();
    for (const t of p.bodyTf.keys()) seen.add(t);
    for (const t of p.headTf.keys()) seen.add(t);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return df;
})();

/** Lucene-style BM25 IDF, floored so a term in every doc still contributes. */
export function idf(term: string): number {
  const df = DF.get(term) ?? 0;
  const raw = Math.log(1 + (N_DOCS - df + 0.5) / (df + 0.5));
  return Math.max(0.1, raw);
}

/** Total IDF mass of a query, used as the coverage denominator. */
export function queryWeight(queryTokens: string[]): number {
  let total = 0;
  const seen = new Set<string>();
  for (const t of queryTokens) {
    const s = stem(t);
    if (seen.has(s)) continue;
    seen.add(s);
    total += idf(s);
  }
  return Math.max(0.0001, total);
}

// ─── BM25F ───────────────────────────────────────────────────────────────────

const K1 = 1.2;
const B_BODY = 0.75;
/** Title/heading are short and dense, so they are scored with a low B. */
const B_HEAD = 0.3;
const HEAD_WEIGHT = 3.0;

function bm25Term(tf: number, len: number, avgLen: number, b: number, termIdf: number): number {
  const norm = tf / (1 - b + (b * len) / Math.max(1, avgLen));
  return termIdf * ((norm * (K1 + 1)) / (norm + K1));
}

// ─── Phrase matching ─────────────────────────────────────────────────────────

/**
 * Longest run of consecutive query tokens present verbatim in the text.
 * Returns the normalised strength (0..1) and the matched surface string.
 *
 * Heading hits are only credited for phrases of two or more words when the
 * match is at a WORD boundary. Without that rule the "event loop" query scored
 * a heading hit inside the `javascript` topic, whose title is "JavaScript
 * Event Loop & Concurrency" — a substring of another topic's name was being
 * treated as this document's own phrase match.
 */
function phraseMatch(query: string, lowerText: string, lowerHead: string): { strength: number; surface: string } {
  const q = query.toLowerCase().replace(/\s+/g, ' ').trim();
  if (q.length < 4) return { strength: 0, surface: '' };

  // Multi-word query: try progressively shorter windows so a partial phrase
  // still scores above a bag-of-words match.
  const words = q.split(' ');
  for (let n = Math.min(words.length, 6); n >= 2; n--) {
    for (let i = 0; i + n <= words.length; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      if (phrase.length < 5) continue;
      if (containsPhrase(lowerHead, phrase)) {
        return { strength: Math.min(1, 0.55 + n * 0.15), surface: phrase };
      }
      if (containsPhrase(lowerText, phrase)) {
        return { strength: Math.min(1, 0.4 + n * 0.12), surface: phrase };
      }
    }
  }
  // Single distinctive token appearing verbatim in the heading, at a boundary.
  const longest = words.filter(w => w.length >= 6).sort((a, b) => b.length - a.length)[0];
  if (longest && containsPhrase(lowerHead, longest)) return { strength: 0.35, surface: longest };
  return { strength: 0, surface: '' };
}

/** Substring test at word boundaries, so "loop" does not match inside "loops". */
function containsPhrase(haystack: string, needle: string): boolean {
  const re = new RegExp(`(?<![a-z0-9])${escapeRe(needle)}(?![a-z0-9])`);
  return re.test(haystack);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface LexicalHit {
  doc: IndexedDoc;
  score: number;
  evidence: Evidence;
}

/**
 * Score every document against the query and return hits ordered by a
 * composite of BM25F and evidence quality.
 */
export function search(query: string, queryTokens: string[]): LexicalHit[] {
  const qStems: string[] = [];
  const seen = new Set<string>();
  for (const t of queryTokens) {
    const s = stem(t);
    if (seen.has(s)) continue;
    seen.add(s);
    qStems.push(s);
  }
  const qLower = query.toLowerCase().trim();

  const hits: LexicalHit[] = [];

  for (const p of PREPARED) {
    let bm25 = 0;
    let matchedWeight = 0;

    for (const s of qStems) {
      const termIdf = idf(s);
      const bodyTf = p.bodyTf.get(s) ?? 0;
      const headTf = p.headTf.get(s) ?? 0;
      if (bodyTf === 0 && headTf === 0) continue;
      matchedWeight += termIdf;
      if (bodyTf > 0) bm25 += bm25Term(bodyTf, p.bodyLength, AVG_BODY_LENGTH, B_BODY, termIdf);
      if (headTf > 0) {
        bm25 += HEAD_WEIGHT * bm25Term(headTf, 2, 2, B_HEAD, termIdf);
      }
    }

    if (matchedWeight === 0) continue;

    const phrase = phraseMatch(qLower, p.lowerText, p.lowerHead);
    // Coverage is the fraction of the query's DISTINCT content tokens this
    // document contains, NOT an IDF-weighted ratio.
    //
    // The weighted form looked more principled but behaves badly on short
    // queries: for "hey, can you explain the event loop" the noisy tokens
    // contribute little IDF each but still inflate the denominator, so a
    // document matching every meaningful token reported coverage 0.51. Token
    // counting asks the question that matters — "did you find the words I
    // actually used?" — and is stable as the corpus grows.
    const matchedTokens = qStems.filter(s => p.bodyTf.has(s) || p.headTf.has(s)).length;
    const coverage = qStems.length > 0 ? matchedTokens / qStems.length : 0;

    // Composite score: lexical strength weighted by how much of the query the
    // document actually accounts for. Multiplying (rather than adding) means a
    // document matching one rare token cannot outrank one matching the whole
    // query, which is the failure mode that produced confident wrong answers.
    const score = bm25 * (0.35 + 0.65 * coverage) + phrase.strength * 12;

    hits.push({
      doc: p.doc,
      score,
      evidence: {
        matchedTokenWeight: matchedWeight,
        coverage,
        phraseStrength: phrase.strength,
        curated: p.doc.kind !== 'corpus',
        laneVotes: 1,
      },
    });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits;
}

// ─── Fact lookup (exact/near-exact only) ─────────────────────────────────────

interface PreparedFactIndex {
  /** Normalised alias -> fact, for O(1) exact hits. */
  exact: Map<string, Fact>;
  aliases: Array<{ norm: string; tokens: string[] }>;
}

/**
 * Normalise a fact alias or query into an exact-match key.
 *
 * Tokens are stemmed, so the key is insensitive to singular/plural. Without
 * this, "neal projects" and "neal project" were different keys, and because a
 * one-word alias is deliberately skipped by the fuzzy pass
 * (`aMeaningful.length < 2`), the plural/singular mismatch had no fallback:
 * "Tell me about Neal's projects" matched nothing at all and the engine
 * declined a question the site answers.
 *
 * Function words survive stemming intact ("does", "has", "what"), so the
 * `LOW_INFO` filter downstream still sees the forms it lists.
 */
function normFactKey(s: string): string {
  const cleaned = s
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned
    .split(' ')
    .map(t => (/^\d+$/.test(t) ? t : stem(t)))
    .join(' ');
}

/** The canonical referent that pronoun folding produces. */
const REFERENT = 'neal';

/**
 * Fold pronouns to a single canonical referent.
 *
 * Facts are written in the second person ("what is your stack") while users
 * ask in the third ("what is his stack"). Both must reach the same row, so the
 * alias index and the query are passed through this SAME transform — folding
 * only one side is a silent no-op, which is precisely the bug this fixes.
 */
function canonicalizeFactTokens(s: string): string {
  return s
    .replace(/\b(?:your|yours|his|her|their|my)\b/g, REFERENT)
    .replace(/\b(?:you|he|she|they|i)\b/g, REFERENT)
    .replace(/\s+/g, ' ')
    .trim();
}

const FACT_INDEX: PreparedFactIndex = (() => {
  const exact = new Map<string, Fact>();
  const aliases: Array<{ norm: string; tokens: string[] }> = [];
  for (const f of FACTS) {
    for (const a of f.aliases) {
      const norm = canonicalizeFactTokens(normFactKey(a));
      if (!norm) continue;
      // Keep the FIRST fact to claim a canonical alias. This is the fix for
      // the legacy duplicate-alias bug, where "what is vibe coding" resolved
      // to `ai_philosophy` and never to `vibe_coding_definition` because the
      // later duplicate silently shadowed the earlier, more specific row.
      if (!exact.has(norm)) exact.set(norm, f);
      aliases.push({ norm, tokens: norm.split(' ').filter(t => t.length >= 2) });
    }
  }
  return { exact, aliases };
})();

/**
 * Low-information tokens. These are excluded from fact-alias scoring.
 *
 * Without this exclusion the phrase "what does this function do" matched the
 * volunteer fact, because the alias "what does neal do" shares THREE of its
 * four tokens — "what", "does", "do" — which are function words that appear in
 * half the aliases. Only "neal" and "do" carry information, and "do" is not
 * enough. Coverage must be measured on CONTENT tokens.
 */
const LOW_INFO = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'am',
  'do', 'does', 'did', 'doing', 'have', 'has', 'had',
  'what', 'who', 'when', 'where', 'why', 'how', 'which',
  'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
  'their', 'it', 'its', 'i', 'me', 'my', 'we', 'us', 'our',
  'can', 'could', 'will', 'would', 'should', 'shall', 'may', 'might',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'from',
  'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this', 'these', 'those',
  'please', 'tell', 'give', 'get', 'got', 'know', 'want', 'like',
  // The canonical referent is low-information for FACT SELECTION: it appears in
  // most fact aliases, so alone it cannot distinguish one row from another.
  REFERENT, 'neal367', 'atichat', 'real',
]);

function isMeaningful(t: string): boolean {
  return t.length >= 2 && !LOW_INFO.has(t);
}

/**
 * Facts are gated hard: an exact alias, or strong CONTENT-token overlap.
 *
 * The overlap test is on ALIAS coverage — how much of the alias's meaningful
 * content the query accounts for — not query coverage. This distinction is the
 * whole ballgame: testing the other direction scored "what is a closure"
 * highly against the alias "what are you" and answered a Closure question with
 * Neal's biography. An earlier version of this function did exactly that.
 */
const MIN_ALIAS_COVERAGE = 0.6;

export function lookupFact(query: string): { fact: Fact; confidence: number; exact: boolean } | null {
  // Canonicalize the QUERY the same way the alias index was built, or the fold
  // is one-sided: "what is his stack" would never equal the stored form
  // "what is neal stack", even though "his" and "neal" are the same referent.
  const q = canonicalizeFactTokens(normFactKey(query));
  if (!q) return null;

  const exact = FACT_INDEX.exact.get(q);
  if (exact) return { fact: exact, confidence: 1, exact: true };

  const qAll = q.split(' ').filter(t => t.length >= 2);
  if (qAll.length === 0) return null;
  const qSet = new Set(qAll);
  const qMeaningful = qAll.filter(isMeaningful);

  // A query with no content word of its own can never select a fact row.
  //
  // This guard is load-bearing. "he", "you", "his", "your" are canonicalized
  // to "neal", so a question like "does he know angular" reduced to the
  // content set {neal, angular}. Because "neal" appears in most fact aliases,
  // a length-2 alias could reach full coverage and answer an Angular question
  // with Neal's contact details. Requiring at least two DISTINCTIVE content
  // words — where a pronoun folded to "neal" does not count — keeps fact
  // matching to questions that actually describe a fact.
  const distinctive = qMeaningful.filter(t => t !== REFERENT);
  if (distinctive.length === 0) return null;

  let best: Fact | null = null;
  let bestScore = 0;

  for (const a of FACT_INDEX.aliases) {
    const aMeaningful = a.tokens.filter(isMeaningful);
    // Require the alias itself to carry at least two content tokens, so a
    // vague one-word alias can never select a fact row.
    if (aMeaningful.length < 2) continue;

    let aliasCovered = 0;
    for (const t of aMeaningful) if (qSet.has(t)) aliasCovered++;
    const coverage = aliasCovered / aMeaningful.length;
    if (coverage < MIN_ALIAS_COVERAGE) continue;
    if (aliasCovered < 2) continue;

    // Coverage must come from the query's OWN content, not merely from the
    // pronoun that folded into the referent.
    const fromDistinctive = aMeaningful.filter(t => t !== REFERENT && qSet.has(t)).length;
    if (fromDistinctive < 1) continue;
    if (distinctive.length === 1 && fromDistinctive < 1) continue;

    // Prefer the alias the query covers most tightly (fewest leftover words).
    let qCovered = 0;
    for (const t of qMeaningful) if (aMeaningful.includes(t)) qCovered++;
    const queryCovered = qCovered / qMeaningful.length;
    const score = coverage * 0.7 + queryCovered * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = FACT_INDEX.exact.get(a.norm) ?? null;
    }
  }

  if (!best) return null;
  return { fact: best, confidence: 0.75 + 0.25 * Math.min(1, bestScore), exact: false };
}

// ─── Candidate construction ──────────────────────────────────────────────────

export function toCandidate(hit: LexicalHit): Candidate {
  const d = hit.doc;
  const isTopic = d.kind === 'topic';
  const isFact = d.kind === 'fact';
  return {
    id: d.id,
    lane: isFact ? 'fact' : isTopic ? 'topic' : 'corpus',
    title: d.title,
    heading: d.heading,
    url: d.url,
    text: d.text,
    score: hit.score,
    evidence: hit.evidence,
    topic: isTopic ? TOPIC_BY_ID.get(d.concepts[0] ?? '') : undefined,
  };
}

export { PREPARED as _preparedForTests };
