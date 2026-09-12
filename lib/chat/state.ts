import type { ConversationState } from './types';

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
  };
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
  };
}
