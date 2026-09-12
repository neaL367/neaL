import type { ExpertiseLevel } from '@/lib/chat/types';

const EXPERT_KEYWORDS = [
  'reconciliation', 'fiber', 'concurrency', 'profiling', 'memory leak',
  'tree shaking', 'bundle size', 'ast', 'monad', 'satisfies', 'covariance',
  'idempotency', 'microtask', 'mutex', 'sharding', 'event-driven architecture',
];

const BEGINNER_KEYWORDS = [
  'what is', 'how do i', 'what does', 'explain like i am 5', 'eli5',
  'difference between', 'why do we use', 'beginner', 'new to', 'started learning',
];

function expertiseSignalFor(msg: string): ExpertiseLevel | null {
  const clean = msg.toLowerCase();
  // Expert wins ties (e.g. "what is reconciliation?" is advanced despite "what is").
  if (EXPERT_KEYWORDS.some(kw => clean.includes(kw))) return 'expert';
  if (BEGINNER_KEYWORDS.some(kw => clean.includes(kw))) return 'beginner';
  return null;
}

export function detectExpertise(
  message: string,
  currentLevel: ExpertiseLevel = 'intermediate',
  recentUserMessages: string[] = []
): ExpertiseLevel {
  // Most recent explicit signal wins outright — level moves both directions.
  const current = expertiseSignalFor(message);
  if (current) return current;

  // Rolling window of last 2 prior user messages + current (neutral).
  // Persists tone briefly, then decays to intermediate instead of locking forever.
  const window = [...recentUserMessages.slice(-2), message];
  for (let i = window.length - 1; i >= 0; i--) {
    const sig = expertiseSignalFor(window[i]);
    if (sig) return sig;
  }

  // No signal in window: decay toward intermediate rather than sticking
  // forever on one early "eli5". Window already covers history,
  // so default to intermediate for free movement both ways.
  void currentLevel;
  return 'intermediate';
}
