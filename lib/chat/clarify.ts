import type {
  IntentType,
  PendingClarification,
} from '@/lib/chat/types';
import type { IntentClassification } from '@/lib/chat/nlp';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';

// Ask only on genuine near-ties below full confidence.
const CLARIFY_MARGIN = 0.12;
const CLARIFY_CEILING = 0.95;

function isActionable(intent: IntentType, conceptId?: string): boolean {
  if (intent === 'command' && conceptId === 'quiz') return true;
  if ((intent === 'technical' || intent === 'personal') && !!conceptId) return true;
  if (
    intent === 'conversational' &&
    !!conceptId &&
    (conceptId.startsWith('film:') || conceptId === 'movie_recommendation')
  ) {
    return true;
  }
  return false;
}

function prettyLabel(intent: IntentType, conceptId?: string): string {
  if (intent === 'command' && conceptId === 'quiz') return 'Quiz';
  if (!conceptId) return intent;
  if (conceptId.startsWith('film:')) {
    const name = conceptId.slice(5);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return conceptGraph.getNode(conceptId)?.label || conceptId;
}

function labelTerms(label: string): string[] {
  return label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(w => w.length >= 3);
}

interface ClarifyCandidate {
  intent: IntentType;
  conceptId?: string;
}

/** Find a genuine two-way ambiguity, or null (answer directly). */
export function findClarification(
  result: IntentClassification
): { a: ClarifyCandidate; b: ClarifyCandidate } | null {
  if (result.confidence >= CLARIFY_CEILING) return null;
  if (!isActionable(result.intent, result.conceptId)) return null;
  const alt = (result.alternatives || []).find(
    r =>
      r.confidence >= 0.55 &&
      result.confidence - r.confidence < CLARIFY_MARGIN &&
      isActionable(r.intent, r.conceptId) &&
      (r.intent !== result.intent || r.conceptId !== result.conceptId)
  );
  if (!alt) return null;
  return {
    a: { intent: result.intent, conceptId: result.conceptId },
    b: { intent: alt.intent, conceptId: alt.conceptId },
  };
}

function toOption(
  c: ClarifyCandidate,
  otherConceptId: string | undefined,
  verb: 'explain' | 'quiz' | 'tell'
): PendingClarification['options'][number] {
  const label = prettyLabel(c.intent, c.conceptId);
  if (c.intent === 'command') {
    const on = otherConceptId ? ` on ${prettyLabel('technical', otherConceptId)}` : '';
    return {
      label: `Quiz me${on}`,
      intent: c.intent,
      conceptId: c.conceptId,
      matchTerms: ['quiz', 'test', 'challenge'],
    };
  }
  return {
    label: `${verb === 'quiz' ? 'Quiz' : 'Explain'} ${label}`,
    intent: c.intent,
    conceptId: c.conceptId,
    matchTerms: [...labelTerms(label), verb, 'about', 'tell'],
  };
}

/** Build the one-shot pending clarification for two candidates. */
export function buildClarification(
  a: ClarifyCandidate,
  b: ClarifyCandidate
): PendingClarification {
  // Quiz side always gets quiz wording; the other side explains.
  const aIsQuiz = a.intent === 'command';
  const bIsQuiz = b.intent === 'command';
  const oa = toOption(a, b.conceptId, aIsQuiz ? 'quiz' : bIsQuiz ? 'explain' : 'tell');
  const ob = toOption(b, a.conceptId, bIsQuiz ? 'quiz' : aIsQuiz ? 'explain' : 'tell');
  // A resolved quiz with no topic of its own inherits the discussed concept
  // ("react quiz" → 2 → quiz *on React*, not a random quiz).
  if (aIsQuiz && b.conceptId) oa.subjectId = b.conceptId;
  if (bIsQuiz && a.conceptId) ob.subjectId = a.conceptId;
  return { options: [oa, ob] };
}

/** Resolve the user's reply against pending options: match or null (move on). */
export function resolveClarification(
  userMessage: string,
  pending: PendingClarification
): (ClarifyCandidate & { subjectId?: string }) | null {
  const t = userMessage.toLowerCase().trim();
  const num = t.match(/^(1|2|first|second)\b/);
  if (num) {
    const idx = num[1] === '1' || num[1] === 'first' ? 0 : 1;
    const o = pending.options[idx];
    return o ? { intent: o.intent, conceptId: o.conceptId, subjectId: o.subjectId } : null;
  }
  let bestIdx = -1;
  let bestScore = 0;
  pending.options.forEach((o, i) => {
    let s = 0;
    for (const term of o.matchTerms) {
      if (t.includes(term)) s++;
    }
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  });
  // Require a UNIQUE winner — ties mean still ambiguous, move on.
  const runnerUp = pending.options.reduce((acc, o, i) => {
    if (i === bestIdx) return acc;
    let s = 0;
    for (const term of o.matchTerms) {
      if (t.includes(term)) s++;
    }
    return Math.max(acc, s);
  }, 0);
  if (bestIdx === -1 || bestScore === 0 || runnerUp >= bestScore) return null;
  const o = pending.options[bestIdx];
  return { intent: o.intent, conceptId: o.conceptId, subjectId: o.subjectId };
}

export function formatClarificationQuestion(pending: PendingClarification): {
  text: string;
  suggestions: string[];
} {
  const [a, b] = pending.options;
  return {
    text: `Just to make sure I get you the right thing — Did you mean **${a.label}**, or **${b.label}**?\n\nReply **1** or **2**, or just say it in your own words.`,
    suggestions: [a.label, b.label],
  };
}
