import type { ConversationState, IntentType, PendingClarification } from './types';

const MAX_TURNS = 20;
const MAX_THREAD = 10;
const MAX_HITS = 10;
const MAX_COVERED = 20;

/** Single source for a fresh session — route, client, and reset all use this. */
export function createInitialConversationState(): ConversationState {
  return {
    turns: [],
    topicThread: [],
    activeQuiz: null,
    expertiseLevel: 'intermediate',
    roundRobinCursors: {},
    lastRetrievalHits: [],
    pendingOffer: null,
    coveredConcepts: [],
    pendingClarification: null,
  };
}

function sanitizeClarification(raw: unknown): ConversationState['pendingClarification'] {
  if (!raw || typeof raw !== 'object') return null;
  const options = (raw as { options?: unknown }).options;
  if (!Array.isArray(options)) return null;
  const clean = options
    .filter(
      (o): o is { label: string; intent: string; conceptId?: string; matchTerms: string[] } =>
        !!o &&
        typeof o === 'object' &&
        typeof (o as { label?: unknown }).label === 'string' &&
        typeof (o as { intent?: unknown }).intent === 'string' &&
        Array.isArray((o as { matchTerms?: unknown }).matchTerms)
    )
    .slice(0, 3)
    .map(
      (o): PendingClarification['options'][number] => ({
        label: o.label,
        intent: o.intent as IntentType,
        conceptId: typeof o.conceptId === 'string' ? o.conceptId : undefined,
        matchTerms: o.matchTerms.filter((t): t is string => typeof t === 'string').slice(0, 8),
        subjectId:
          typeof (o as unknown as { subjectId?: unknown }).subjectId === 'string'
            ? (o as unknown as { subjectId: string }).subjectId
            : undefined,
      })
    );
  return clean.length > 0 ? { options: clean } : null;
}

/** Bound untrusted incoming client state to prevent memory abuse. */
export function sanitizeConversationState(raw: Partial<ConversationState> | undefined | null): ConversationState {
  const incoming: Partial<ConversationState> = raw || {};
  return {
    turns: Array.isArray(incoming.turns) ? incoming.turns.slice(-MAX_TURNS) : [],
    topicThread: Array.isArray(incoming.topicThread) ? incoming.topicThread.slice(-MAX_THREAD) : [],
    activeQuiz: incoming.activeQuiz || null,
    expertiseLevel: incoming.expertiseLevel || 'intermediate',
    roundRobinCursors: incoming.roundRobinCursors || {},
    lastRetrievalHits: Array.isArray(incoming.lastRetrievalHits)
      ? incoming.lastRetrievalHits.slice(-MAX_HITS)
      : [],
    pendingOffer: incoming.pendingOffer || null,
    coveredConcepts: Array.isArray(incoming.coveredConcepts)
      ? incoming.coveredConcepts.slice(-MAX_COVERED)
      : [],
    pendingClarification: sanitizeClarification(incoming.pendingClarification),
  };
}
