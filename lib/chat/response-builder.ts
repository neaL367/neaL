import type { ConversationState } from '@/lib/chat/types';
import type { IntentClassification, ExtractedEntities } from '@/lib/chat/nlp';
import type { UnifiedRetrievalResult } from '@/lib/chat/retrieval';
import type { BuiltResponse, HandlerContext, ResponseHandler } from './handlers/types';
import { handleQuizAndCommands } from './handlers/quiz-handler';
import { handleConversational } from './handlers/conversational-handler';
import { handleOpinions } from './handlers/opinion-handler';
import { handleKnowledge } from './handlers/knowledge-handler';
import { handleRetrieval, handleFallback } from './handlers/retrieval-handler';

export type { BuiltResponse } from './handlers/types';

const PIPELINE_HANDLERS: ResponseHandler[] = [
  handleQuizAndCommands,
  handleConversational,
  handleOpinions,
  handleKnowledge,
  handleRetrieval,
];

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
  const ctx: HandlerContext = {
    userMessage,
    state,
    intentResult,
    entities,
    retrievalResult,
    turnCount: state.turns.length,
  };

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
      return result.response;
    }
  }

  return handleFallback(ctx);
}
