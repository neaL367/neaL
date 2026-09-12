import type { ConversationState } from '@/lib/chat/types';
import type { IntentClassification, ExtractedEntities } from '@/lib/chat/nlp';
import type { UnifiedRetrievalResult } from '@/lib/chat/retrieval';
import type { BuiltResponse, HandlerContext, ResponseHandler } from './handlers/types';
import { finishResponse } from './handlers/types';
import { TOPICS, CONCEPTS } from '@/lib/chat/knowledge/topics';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';
import {
  findClarification,
  buildClarification,
  resolveClarification,
  formatClarificationQuestion,
} from './clarify';
import { handleQuizAndCommands } from './handlers/quiz-handler';
import { handleConversational } from './handlers/conversational-handler';
import { handleOpinions } from './handlers/opinion-handler';
import { handleComparison } from './handlers/comparison-handler';
import { handleKnowledge } from './handlers/knowledge-handler';
import { handleRetrieval, handleFallback } from './handlers/retrieval-handler';

export type { BuiltResponse } from './handlers/types';

const PIPELINE_HANDLERS: ResponseHandler[] = [
  handleQuizAndCommands,
  handleConversational,
  handleOpinions,
  handleComparison,
  handleKnowledge,
  handleRetrieval,
];

function surfaceTokens(value: string | undefined, into: Set<string>): void {
  if (!value) return;
  for (const w of value.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length >= 4) into.add(w);
  }
}

/**
 * Last-line defense against wrong-lane leaks: a technical/personal answer
 * must name its subject (handlers always interpolate the title). Mismatch →
 * honest fallback instead of a confident wrong answer. Exported for tests.
 */
export function passesSelfCheck(
  text: string,
  intentResult: IntentClassification,
  entities: ExtractedEntities,
  retrievalResult: UnifiedRetrievalResult
): boolean {
  const { intent, conceptId } = intentResult;
  if (intent !== 'technical' && intent !== 'personal' && intent !== 'continuation') return true;
  if (!conceptId) return true;
  if (retrievalResult.bestHit?.lane === 'web') return true;

  const expected = new Set<string>();
  const topic = TOPICS.find(t => t.id === conceptId);
  if (topic) surfaceTokens(topic.title, expected);
  const def = CONCEPTS[conceptId];
  if (def) surfaceTokens(def.label, expected);
  surfaceTokens(conceptGraph.getNode(conceptId)?.label, expected);
  surfaceTokens(conceptId, expected);
  for (const id of entities.concepts.slice(0, 2)) {
    surfaceTokens(conceptGraph.getNode(id)?.label, expected);
  }
  const best = retrievalResult.bestHit;
  if (best && best.lane !== 'topic') {
    surfaceTokens(best.title, expected);
    surfaceTokens(best.heading, expected);
  }
  if (expected.size === 0) return true;
  const t = text.toLowerCase();
  for (const tok of expected) {
    if (t.includes(tok)) return true;
  }
  return false;
}

/**
 * Senior architectural pipeline runner for Nara's conversational engine.
 * Dispatches cleanly across modular strategy handlers with strict separation of concerns.
 */
export function buildResponse(
  userMessage: string,
  state: ConversationState,
  intentResult: IntentClassification,
  entities: ExtractedEntities,
  retrievalResult: UnifiedRetrievalResult
): BuiltResponse {
  // 0. One-shot clarification resolution: a pending question is answered,
  // matched, or dropped exactly once — never re-asked.
  const hadPending = !!state.pendingClarification;
  if (state.pendingClarification) {
    const resolved = resolveClarification(userMessage, state.pendingClarification);
    state = { ...state, pendingClarification: null };
    if (resolved) {
      intentResult = { intent: resolved.intent, conceptId: resolved.conceptId, confidence: 1.0 };
      // A resolved quiz without its own topic inherits the discussed concept.
      if (resolved.subjectId && entities.concepts.length === 0) {
        entities = { ...entities, concepts: [resolved.subjectId] };
      }
    }
  }

  const ctx: HandlerContext = {
    userMessage,
    state,
    intentResult,
    entities,
    retrievalResult,
    turnCount: state.turns.length,
  };

  // 0b. Ask on genuine near-ties (options beat rephrase-requests).
  if (!hadPending) {
    const tie = findClarification(intentResult);
    if (tie) {
      const pending = buildClarification(tie.a, tie.b);
      const q = formatClarificationQuestion(pending);
      return finishResponse(q.text, [], q.suggestions, userMessage, {
        ...state,
        pendingClarification: pending,
      });
    }
  }

  // Explicit Web Search priority: if web search was performed and found live findings, prioritize it
  if (retrievalResult.bestHit?.lane === 'web') {
    const webRes = handleRetrieval(ctx);
    if (webRes.handled && webRes.response) {
      return webRes.response;
    }
  }

  for (const handler of PIPELINE_HANDLERS) {
    const result = handler(ctx);
    if (result.handled && result.response) {
      // The clarification question itself carries no subject — exempt it.
      if (result.response.updatedState.pendingClarification) {
        return result.response;
      }
      if (passesSelfCheck(result.response.text, intentResult, entities, retrievalResult)) {
        return result.response;
      }
      return handleFallback({
        ...ctx,
        state: { ...ctx.state, pendingOffer: null },
      });
    }
  }

  return handleFallback(ctx);
}
