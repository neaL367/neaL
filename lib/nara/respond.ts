/**
 * Nara V2 — the single entry point.
 *
 * Flow:
 *   analyze (shape -> subject)  ->  retrieve (4 lanes + expansion)
 *                               ->  gate (evidence-based confidence)
 *                               ->  compose (extractive)
 *                               ->  record dialogue state
 *
 * The legacy route had a 7-handler priority pipeline
 * (`PIPELINE_HANDLERS` + `passesSelfCheck`) where handler ORDER decided the
 * answer. That is why `handleConversational` intercepted "Interstellar vs
 * Arrival" before `handleComparison` ever ran, and why a greeting outranked a
 * technical question. Here there is no handler ordering to get wrong: one
 * analysis decides shape and subject, retrieval is uniform, and a single
 * evidence gate decides whether an answer is warranted.
 */
import type { ComposedAnswer, DialogueState, QueryAnalysis } from './types';
import { analyze } from './language/query';
import { retrieve } from './retrieval/index';
import { compose } from './compose/index';
import { createState, currentTopic, recordTurn, sanitizeState } from './dialogue/state';
import { labelFor } from './knowledge/index';

export interface RespondInput {
  message: string;
  /** Raw, UNTRUSTED client state. Validated inside. */
  state?: unknown;
  /** Deterministic salt for tests; a random one is generated for a session. */
  salt?: number;
}

export interface RespondOutput {
  answer: ComposedAnswer;
  analysis: QueryAnalysis;
  confidence: number;
  state: DialogueState;
}

/** Below this the answer is reported as low-confidence in the trace only. */
export const RESPOND_VERSION = 2;

export function respond(input: RespondInput): RespondOutput {
  const state = input.state === undefined ? createState(input.salt) : sanitizeState(input.state);

  const analysis = analyze(input.message, {
    previousTopic: currentTopic(state),
    previousTitle: state.lastAnswerTitle,
  });

  const result = retrieve(analysis);

  const answer = compose({
    analysis,
    result,
    salt: state.salt,
    alreadyExplained: state.explained,
    expertise: state.expertise,
    state,
  });

  // Concept ids recorded from what was actually ANSWERED, not from what was
  // merely mentioned in the question. The legacy engine pushed concept ids
  // into `topicThread` on the retrieval path only, so an answer produced by
  // the knowledge-graph lane never became the follow-up context.
  const answeredConcept =
    result.best?.topic?.id ??
    (result.best?.lane === 'fact' ? undefined : analysis.concepts[0]?.id);

  const recorded = recordTurn(state, {
    conceptIds: analysis.concepts.map(c => c.id).slice(0, 4),
    answerTitle: answerTitleOf(answer, result.best?.topic?.id, analysis),
    userText: input.message,
    ...(answeredConcept ? { explainedConcept: answeredConcept } : {}),
  });

  return {
    answer,
    analysis,
    confidence: result.confidence,
    state: recorded,
  };
}

function answerTitleOf(
  answer: ComposedAnswer,
  topicId: string | undefined,
  analysis: QueryAnalysis,
): string {
  if (topicId) return labelFor(topicId);
  if (analysis.concepts[0]) return labelFor(analysis.concepts[0].id);
  // For a decline there is no subject to carry forward.
  return answer.kind === 'answer' ? answer.sources[0]?.title ?? '' : '';
}

export { sanitizeState, createState };
export type { ComposedAnswer, DialogueState, QueryAnalysis };
