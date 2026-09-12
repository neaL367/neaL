import type { ConversationState, PendingOffer } from '@/lib/chat/types';
import type { IntentClassification, ExtractedEntities } from '@/lib/chat/nlp';
import type { UnifiedRetrievalResult } from '@/lib/chat/retrieval';

export interface BuiltResponse {
  text: string;
  sources: Array<{ title: string; heading?: string; url?: string; excerpt: string }>;
  suggestions: string[];
  updatedState: ConversationState;
}

export interface HandlerContext {
  userMessage: string;
  state: ConversationState;
  intentResult: IntentClassification;
  entities: ExtractedEntities;
  retrievalResult: UnifiedRetrievalResult;
  turnCount: number;
}

export interface HandlerResult {
  handled: boolean;
  response?: BuiltResponse;
}

export type ResponseHandler = (ctx: HandlerContext) => HandlerResult;

export function finishResponse(
  replyText: string,
  sources: Array<{ title: string; heading?: string; url?: string; excerpt: string }>,
  suggestions: string[],
  userMessage: string,
  state: ConversationState,
  pendingOffer?: PendingOffer | null
): BuiltResponse {
  const updatedTurns = [
    ...(state.turns || []),
    { role: 'user' as const, text: userMessage, timestamp: Date.now() },
    { role: 'assistant' as const, text: replyText, timestamp: Date.now() },
  ];

  return {
    text: replyText,
    sources,
    suggestions,
    updatedState: {
      ...state,
      turns: updatedTurns.slice(-20), // Keep last 20 turns for bounded memory
      pendingOffer: pendingOffer !== undefined ? pendingOffer : state.pendingOffer,
    },
  };
}
