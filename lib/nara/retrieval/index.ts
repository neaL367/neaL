/**
 * Nara V2 — retrieval orchestration.
 *
 * Fuses four lanes and then decides, from measured EVIDENCE, whether the
 * result is good enough to answer with.
 *
 * Lane design (each contributes an independent signal):
 *   fact   — a curated subject-predicate-object row. Exact or near-exact only.
 *   topic  — a curated concept explanation.
 *   corpus — real site prose (the generated corpus.json).
 *   graph  — neighbours of a linked concept, so "what else relates to X" works.
 *
 * Fusion is Reciprocal Rank Fusion (k = 60), kept from the legacy engine: it
 * is rank-based, so lanes with wildly different score scales combine without
 * calibration, and it has a documented, defensible constant.
 *
 * The RRF lane-vote count is itself evidence: a candidate surfaced by several
 * independent lanes is more trustworthy than one surfaced by a single lane,
 * and that is recorded in `Evidence.laneVotes` rather than discarded.
 */
import type {
  Candidate,
  Evidence,
  QueryAnalysis,
  RetrievalResult,
  Topic,
} from '../types';
import { CONCEPT_INDEX, labelFor, neighbors, TOPIC_BY_ID } from '../knowledge/index';import { lookupFact, search } from './lexical';
import { expandQuery } from './expand';

const RRF_K = 60;
const MAX_CANDIDATES = 24;

// ─── RRF ─────────────────────────────────────────────────────────────────────

interface LaneResult {
  lane: Candidate['lane'];
  candidates: Candidate[];
}

/**
 * Fuse lanes by Reciprocal Rank Fusion, then multiply by a NORMALISED
 * lane-local relevance.
 *
 * Pure RRF was the bug behind several wrong answers. It scores only the RANK
 * within a lane, so the lane's best candidate always gets 1/(60+1) regardless
 * of whether it matched the query overwhelmingly or marginally. Measured
 * consequence: for "How does the event loop work?" the generic `javascript`
 * topic (which matches only the word "javascript") outranked the exact
 * `event-loop` topic, because both were rank 1 and 2 in the same lane:
 *
 *     topic:javascript   0.0325   <- generic
 *     topic:event-loop   0.0164   <- correct
 *
 * Multiplying RRF by the candidate's relevance relative to the best score in
 * its own lane preserves RRF's cross-lane calibration (scores stay on the same
 * scale) while restoring the missing discrimination WITHIN a lane.
 */
function rrfFuse(lanes: LaneResult[], analysis: QueryAnalysis): Candidate[] {
  const byId = new Map<string, Candidate>();
  const scores = new Map<string, number>();
  const votes = new Map<string, number>();
  const laneRelevance = new Map<string, number>();

  // The set of concepts the analyzer linked from the user's own words.
  const linked = new Set(analysis.concepts.map(c => c.id));

  for (const { candidates } of lanes) {
    // Best score in this lane, for normalisation.
    let laneMax = 0;
    for (const c of candidates) if (c.score > laneMax) laneMax = c.score;
    const denom = laneMax > 0 ? laneMax : 1;

    candidates.forEach((c, i) => {
      const rrf = 1 / (RRF_K + i + 1);
      const relevance = Math.min(1, Math.max(0, c.score / denom));
      // Blend: rank agreement plus a real relevance signal.
      let contribution = rrf * (0.5 + 0.5 * relevance);

      // A document that IS the linked concept is the answer by construction,
      // so it is lifted explicitly rather than left to compete on term overlap
      // with generic prose that happens to mention the same words.
      const topicId = c.topic?.id ?? c.id.replace(/^(?:topic|concept|corpus|fact):/, '');
      if (linked.has(topicId)) contribution *= 2.2;

      scores.set(c.id, (scores.get(c.id) ?? 0) + contribution);
      laneRelevance.set(c.id, Math.max(laneRelevance.get(c.id) ?? 0, relevance));
      votes.set(c.id, (votes.get(c.id) ?? 0) + 1);
      // First lane to surface a candidate owns its payload; later lanes only
      // add rank evidence. This keeps the richest record (a topic's full
      // detail) from being overwritten by a thinner corpus chunk.
      if (!byId.has(c.id)) byId.set(c.id, c);
    });
  }

  const out: Candidate[] = [];
  for (const [id, c] of byId) {
    const voteCount = votes.get(id) ?? 1;
    out.push({
      ...c,
      score: scores.get(id) ?? 0,
      evidence: { ...c.evidence, laneVotes: voteCount },
    });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, MAX_CANDIDATES);
}

// ─── Lanes ───────────────────────────────────────────────────────────────────

function factLane(analysis: QueryAnalysis): LaneResult {
  const hit = lookupFact(analysis.normalized);
  if (!hit) return { lane: 'fact', candidates: [] };
  return {
    lane: 'fact',
    candidates: [
      {
        id: `fact:${hit.fact.predicate}`,
        lane: 'fact',
        title: hit.fact.object,
        heading: hit.fact.subject,
        url: hit.fact.url,
        text: hit.fact.contextSentence,
        score: hit.confidence,
        fact: hit.fact,
        evidence: {
          matchedTokenWeight: 1,
          coverage: hit.confidence,
          phraseStrength: hit.exact ? 1 : 0.5,
          curated: true,
          matchKind: hit.exact ? 'exact-id' : 'exact-label',
          laneVotes: 1,
        },
      },
    ],
  };
}

function lexicalLanes(analysis: QueryAnalysis): LaneResult[] {
  const hits = search(analysis.normalized, analysis.contentTokens);
  const topics: Candidate[] = [];
  const corpus: Candidate[] = [];

  for (const h of hits) {
    const d = h.doc;
    const base: Candidate = {
      id: d.id,
      lane: d.kind === 'topic' ? 'topic' : d.kind === 'fact' ? 'fact' : 'corpus',
      title: d.title,
      heading: d.heading,
      url: d.url,
      text: d.text,
      score: h.score,
      evidence: h.evidence,
      topic: d.kind === 'topic' ? TOPIC_BY_ID.get(d.concepts[0] ?? '') : undefined,
    };
    if (d.kind === 'topic' || d.kind === 'concept') topics.push(base);
    else corpus.push(base);
  }

  return [
    { lane: 'topic', candidates: topics },
    { lane: 'corpus', candidates: corpus },
  ];
}

/**
 * Graph lane: the neighbours of each LINKED concept, plus the concept itself.
 *
 * This only ever uses concepts the analyzer actually linked from the user's
 * own words, so it cannot invent a subject. When the analyzer linked nothing
 * (e.g. "is my cache stale"), this lane is empty by construction.
 */
function graphLane(analysis: QueryAnalysis): LaneResult {
  const out: Candidate[] = [];
  const seen = new Set<string>();

  for (const c of analysis.concepts.slice(0, 3)) {
    if (analysis.negation.concepts.includes(c.id)) continue;
    const related = neighbors(c.id, 1);
    related.forEach((id, i) => {
      if (seen.has(id)) return;
      seen.add(id);
      const topic: Topic | undefined = TOPIC_BY_ID.get(id);
      const entry = CONCEPT_INDEX.get(id);
      if (!topic && !entry) return;
      out.push({
        id: `topic:${id}`,
        lane: 'graph',
        title: topic?.title ?? entry?.label ?? labelFor(id),
        heading: topic?.title ?? entry?.label ?? labelFor(id),
        url: '/',
        text: topic ? `${topic.summary}\n\n${topic.detail}` : (entry?.description ?? ''),
        // Rank-based within the lane, degraded by hop distance.
        score: 1 - i * 0.1,
        topic,
        evidence: {
          matchedTokenWeight: 0,
          coverage: 0,
          phraseStrength: 0,
          curated: true,
          matchKind: c.kind,
          laneVotes: 1,
        },
      });
    });
  }
  return { lane: 'graph', candidates: out };
}

// ─── Confidence gate ─────────────────────────────────────────────────────────

/**
 * Confidence thresholds. Named rather than inline so the policy is auditable.
 */
const envNum = (key: string, fallback: number): number => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : fallback;
};

// Env-overridable ONLY so `eval/sweep.ts` can grid-search the operating point;
// production always uses the pinned defaults below. Sweep 2026-09-14: answer in
// [0.40, 0.50] scores 138/138; 0.55 drops adv.ping-pong (0.513) and 0.60 drops
// deep.agent (0.570) — so 0.50 is kept as the top of the plateau, the highest
// gate that still answers every covered subject. New adversarial cases should
// aim near the gate to keep the sweep discriminating.
const ANSWER_CONFIDENCE = envNum('NARA_ANSWER_CONF', 0.5);
const CLARIFY_CONFIDENCE = envNum('NARA_CLARIFY_CONF', 0.22);

/**
 * Compute confidence from EVIDENCE, never from "a concept was mentioned".
 *
 * The composite deliberately multiplies coverage by lexical/curated strength
 * rather than adding independent bonuses, so no single weak signal can carry
 * an answer over the line on its own. The legacy gate's fatal property was
 * that `topicHits.length > 0` was sufficient; here an incidental single-token
 * overlap yields coverage well under 0.4 and cannot reach the answer band.
 */
export function computeConfidence(analysis: QueryAnalysis, best: Candidate): number {
  const ev: Evidence = best.evidence;

  // A curated fact hit is exact by construction (lookupFact only returns
  // ≥60% alias-content coverage), and facts are short, verified rows.
  //
  // But a fact must NOT outrank a concept the user actually named. Measured:
  // "Does Neal know Angular?" linked `angular` strongly (phrase 0.35) yet the
  // generic `all_tools` fact row won on fact-lane bonus alone and answered
  // with the whole tech stack. When a concept is linked with a real phrase
  // match, that concept is the answer and the fact lane is only relevant if
  // the question explicitly asked for a site fact.
  if (best.lane === 'fact' && best.fact) {
    // Demote ONLY when the concept the user actually named is itself a curated
    // topic. "Does Neal know Angular?" names Angular (a topic), so the Angular
    // explanation is the answer. "Where does Neal study?" also links a
    // `study` concept, but it is not a topic — there is no explanation to give,
    // so the curated fact row is correct and must stay authoritative.
    //
    // An EXACT fact-alias hit is never demoted. `exact-id` means the user's
    // question matched a curated fact alias word for word, which is the
    // strongest possible statement of intent — "When did Neal do his co-op?"
    // is literally the alias "when did neal do his co-op". Incidental concept
    // overlap must not override that.
    const namedTopic = analysis.concepts.find(
      c => c.confidence >= 0.8 && TOPIC_BY_ID.has(c.id),
    );
    const factConfidence = Math.min(1, 0.85 * ev.coverage + 0.15);
    const exactAlias = ev.matchKind === 'exact-id';
    return namedTopic && !exactAlias ? Math.min(factConfidence, 0.42) : factConfidence;
  }

  // A resolved referent: the user said "why?" / "and?" and the analyzer
  // resolved it to the topic of the PREVIOUS turn. There is no lexical
  // evidence to measure, because the user's message genuinely contains none —
  // the evidence is the conversation. Treating this as low confidence (the
  // first behaviour tried) made every follow-up decline.
  if (best.evidence.matchKind === 'exact-id' && analysis.resolvedReferent && best.topic?.id === analysis.resolvedReferent) {
    return 0.8;
  }

  // Strongest single signal: an exact phrase or curated name matched.
  const phrase = Math.max(ev.phraseStrength, best.lane === 'graph' ? 0.5 : 0);
  const coverage = ev.coverage;
  const curated = ev.curated ? 1 : 0;
  const conceptLinked = analysis.concepts.length > 0 ? 1 : 0;
  // Diminishing returns on lane agreement.
  const agreement = Math.min(1, (ev.laneVotes - 1) / 2);

  // The strongest possible positive signal: this candidate IS the concept the
  // user named. A doc that is literally the subject of the question must not
  // lose to generic prose that happens to contain the same term — that is how
  // "How does the event loop work?" was answered with the JavaScript topic.
  const primaryLinked = analysis.concepts[0]?.id;
  const candidateTopicId = best.topic?.id ?? best.id.replace(/^(?:topic|concept|corpus|fact):/, '');
  const isPrimary = primaryLinked !== undefined && candidateTopicId === primaryLinked ? 1 : 0;

  let score =
    0.34 * coverage +
    0.20 * phrase +
    0.22 * isPrimary +
    0.10 * conceptLinked +
    0.08 * curated +
    0.06 * agreement;

  // A subject the analyzer did not link is a strong negative signal: it means
  // the request was routed by generic word overlap. Cap such answers below
  // the answer band so they become clarifications instead.
  if (conceptLinked === 0) score = Math.min(score, 0.48);

  // An explicitly negated subject must never be the answer.
  if (best.topic && analysis.negation.concepts.includes(best.topic.id)) {
    score = Math.min(score, 0.2);
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Retrieve and gate.
 *
 * Returns `best: null` when confidence is too low to answer, which is the
 * ONLY way the engine declines — there is no path that answers a question it
 * did not understand.
 */
export function retrieve(analysis: QueryAnalysis): RetrievalResult {
  const lanes: LaneResult[] = [
    factLane(analysis),
    ...lexicalLanes(analysis),
    graphLane(analysis),
  ];

  // Semantic expansion adds a second lexical pass over the top concepts'
  // associated terms. It runs as its own lane so its lower precision cannot
  // dilute the exact lexical signal.
  const expanded = expandQuery(analysis);
  if (expanded.length > 0) lanes.push({ lane: 'corpus', candidates: expanded });

  // ── Referent resolution, actually consumed ───────────────────────────────
  // A follow-up such as "why?" after a closures answer carries no subject of
  // its own. The analyzer resolves the referent to a concept id; here that id
  // seeds the graph lane and synthesises a topic candidate so the follow-up is
  // answered from the SAME record. (The legacy engine computed an equivalent
  // `resolvedSubject` and then never read it, so "why?" fell through to
  // generic retrieval and declined.)
  if (analysis.resolvedReferent) {
    const referent = TOPIC_BY_ID.get(analysis.resolvedReferent);
    const entry = CONCEPT_INDEX.get(analysis.resolvedReferent);
    if (referent || entry) {
      // A pronoun subject ("how does it handle errors") is a real question
      // grounded in the previous topic. Its lexical overlap with that topic is
      // genuinely low, because the user's words describe the NEW aspect, not
      // the topic name — so modest evidence is expected and sufficient.
      const pronoun = analysis.pronounSubject;
      lanes.push({
        lane: 'graph',
        candidates: [
          {
            id: `topic:${analysis.resolvedReferent}`,
            lane: 'graph',
            title: referent?.title ?? entry?.label ?? labelFor(analysis.resolvedReferent),
            heading: referent?.title ?? entry?.label ?? '',
            url: '/',
            text: referent ? `${referent.summary}\n\n${referent.detail}` : (entry?.description ?? ''),
            score: 2,
            topic: referent,
            evidence: {
              matchedTokenWeight: 0,
              coverage: pronoun ? 0.55 : 0.45,
              phraseStrength: pronoun ? 0.5 : 0.3,
              curated: true,
              matchKind: 'exact-id',
              laneVotes: 1,
            },
          },
        ],
      });
    }
  }

  const scoreAll = (candidates: Candidate[]) =>
    candidates
      .map(c => ({ c, confidence: computeConfidence(analysis, c) }))
      .sort((a, b) => b.confidence - a.confidence || b.c.score - a.c.score);

  let candidates = rrfFuse(lanes, analysis);
  if (candidates.length === 0) {
    return { candidates: [], best: null, confidence: 0 };
  }

  let scored = scoreAll(candidates);

  // Second pass: the first fusion linked something but not confidently enough
  // to answer (clarify band or below). The initial expansion was skipped
  // because a concept was linked — possibly the WRONG concept, which is
  // precisely when associative evidence helps. Re-fuse with expansion as a
  // fallback lane; its honesty marking (low coverage, zero phrase strength)
  // means it can only rescue genuinely associated documents, not invent
  // confidence. Single extra pass only — no loop.
  if (
    scored[0].confidence < ANSWER_CONFIDENCE &&
    analysis.concepts.length > 0 &&
    expanded.length === 0
  ) {
    const fallback = expandQuery(analysis, { fallback: true });
    if (fallback.length > 0) {
      lanes.push({ lane: 'corpus', candidates: fallback });
      candidates = rrfFuse(lanes, analysis);
      scored = scoreAll(candidates);
    }
  }

  const top = scored[0];
  const runnerUp = scored[1];

  // Mid-band: two plausible, closely-matched subjects -> ask instead of guess.
  //
  // This only applies when the analyzer actually LINKED a concept. If it linked
  // nothing, the two "candidates" are unrelated documents that merely scored
  // similarly, and offering "did you mean useCallback or Memoization?" for
  // "is my cache stale" is noise dressed up as a helpful question. In that case
  // no ambiguity is reported and the composer declines honestly.
  let ambiguity: [Candidate, Candidate] | undefined;
  if (
    analysis.concepts.length > 0 &&
    top.confidence >= CLARIFY_CONFIDENCE &&
    top.confidence < ANSWER_CONFIDENCE &&
    runnerUp &&
    runnerUp.confidence >= top.confidence - 0.12 &&
    runnerUp.c.id !== top.c.id
  ) {
    ambiguity = [top.c, runnerUp.c];
  }

  return {
    candidates: scored.map(s => s.c),
    best: top.confidence >= ANSWER_CONFIDENCE ? top.c : null,
    confidence: top.confidence,
    ...(ambiguity ? { ambiguity } : {}),
  };
}

export { ANSWER_CONFIDENCE, CLARIFY_CONFIDENCE };
