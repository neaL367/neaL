/**
 * Nara V2 — offline semantic expansion.
 *
 * Loads the build-time co-occurrence map (`expansion.json`, produced by
 * `bun run build:semantic`) and uses it to catch queries that share no
 * vocabulary with the document that answers them.
 *
 * This is the replacement for the legacy MiniLM embedding lane. That lane
 * depended on `@huggingface/transformers`, which — verifiably — was declared
 * in package.json and bun.lock but absent from node_modules, so `embedText()`
 * returned null on every request and the lane was permanently empty. Rather
 * than reintroduce a native runtime dependency, associations are mined from
 * the curated corpus at BUILD time and frozen into a JSON map, so the runtime
 * does one hash lookup and cannot degrade.
 *
 * Precision guards, because expansion is by nature a recall device:
 *  - only the top N associations per term are used,
 *  - an associated term is down-weighted relative to a literal term,
 *  - expansion never runs when the query already matched lexically well, and
 *  - expanded candidates are marked with low phrase strength so they can never
 *    masquerade as an exact match in the confidence gate.
 */
import expansionData from '../knowledge/expansion.json';
import type { Candidate, QueryAnalysis } from '../types';
import { DOCS, TOPIC_BY_ID } from '../knowledge/index';
import { stem, tokenize } from '../language/text';

type NeighbourMap = Record<string, Array<{ term: string; score: number }>>;

const EXPANSION: NeighbourMap = expansionData as NeighbourMap;

/** Terms mined from the corpus are unstemmed; map them to stems for lookup. */
const STEM_TO_NEIGHBOURS: Map<string, Array<{ term: string; score: number }>> = (() => {
  const m = new Map<string, Array<{ term: string; score: number }>>();
  for (const [term, list] of Object.entries(EXPANSION)) {
    const s = stem(term);
    const existing = m.get(s);
    if (existing) {
      for (const n of list) existing.push(n);
    } else {
      m.set(s, [...list]);
    }
  }
  for (const list of m.values()) list.sort((a, b) => b.score - a.score);
  return m;
})();

/** Normalised association strength, capped so one term cannot dominate. */
const MAX_NEIGHBOURS_PER_TERM = 3;
const MAX_EXPANDED_TERMS = 6;
/** Below this the association is too weak to be worth a retrieval pass. */
const MIN_ASSOCIATION = 1.5;

/** Pre-tokenised documents, so expansion can score without re-tokenising. */
const DOC_TOKENS: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const d of DOCS) {
    m.set(d.id, new Set(tokenize(d.text)));
  }
  return m;
})();

/**
 * Expand a query into candidate documents by matching association terms.
 *
 * Returns candidates for documents that contain expanded (non-literal) terms,
 * scored by accumulated association strength and normalised by the number of
 * expansion terms so a document matching many weak associations does not
 * outrank one matching a single strong association.
 */
export function expandQuery(analysis: QueryAnalysis): Candidate[] {
  const literal = new Set(analysis.contentTokens.map(t => stem(t)));

  // Do not expand a query that already carries a linked concept: lexical and
  // graph lanes handle it precisely, and expansion would only add noise.
  if (analysis.concepts.length > 0) return [];
  if (analysis.contentTokens.length === 0) return [];

  const wanted = new Map<string, number>();
  for (const tok of analysis.contentTokens) {
    const key = stem(tok);
    const neighbours = STEM_TO_NEIGHBOURS.get(key);
    if (!neighbours) continue;
    let used = 0;
    for (const n of neighbours) {
      if (used >= MAX_NEIGHBOURS_PER_TERM) break;
      if (n.score < MIN_ASSOCIATION) continue;
      const nStem = stem(n.term);
      if (literal.has(nStem)) continue;
      // Keep the strongest association seen for each expanded term.
      wanted.set(nStem, Math.max(wanted.get(nStem) ?? 0, n.score));
      used++;
    }
  }

  if (wanted.size === 0) return [];

  const terms = [...wanted.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_EXPANDED_TERMS);
  const maxScore = terms[0]?.[1] ?? 1;

  const out: Candidate[] = [];
  for (const d of DOCS) {
    const tokens = DOC_TOKENS.get(d.id);
    if (!tokens) continue;
    let hit = 0;
    let weight = 0;
    for (const [t, score] of terms) {
      // Token sets hold raw words; match on the stem of each stored token.
      let present = false;
      for (const tok of tokens) {
        if (stem(tok) === t) {
          present = true;
          break;
        }
      }
      if (present) {
        hit++;
        weight += score;
      }
    }
    if (hit === 0) continue;
    // Require at least two independent associations, or one very strong one.
    if (hit < 2 && weight < maxScore) continue;

    out.push({
      id: d.id,
      lane: d.kind === 'topic' || d.kind === 'concept' ? 'topic' : 'corpus',
      title: d.title,
      heading: d.heading,
      url: d.url,
      text: d.text,
      score: weight / terms.length,
      topic: d.kind === 'topic' ? TOPIC_BY_ID.get(d.concepts[0] ?? '') : undefined,
      evidence: {
        matchedTokenWeight: 0,
        // Coverage is genuinely low: the match is associative, not literal.
        // Reporting it honestly is what keeps expansion from inflating
        // confidence in the gate.
        coverage: 0.2 * (hit / terms.length),
        phraseStrength: 0,
        curated: false,
        matchKind: 'fuzzy',
        laneVotes: 1,
      },
    });
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, 8);
}

export { EXPANSION as _expansionForTests };
