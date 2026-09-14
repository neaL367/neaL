/**
 * Nara V2 — dialogue state.
 *
 * The legacy `state.ts` sanitizer was applied to some fields but not others.
 * Concretely: `roundRobinCursors` was read from the client and used as
 * `list[currentCursor % list.length]` with no numeric validation, so a string
 * cursor from a crafted or corrupted client made the index expression NaN,
 * `list[NaN]` came back `undefined`, and the handler threw
 * `TypeError: Cannot read properties of undefined (reading 'charAt')` —
 * an HTTP 500 from a request-body field.
 *
 * Here EVERY field that arrives from the client passes through a validator
 * that returns a well-typed value or a safe default. Nothing from the client
 * is trusted, and no client value can index an array or reach `.charAt`.
 */
import type {
  DialogueState,
  Intent,
  AnswerShape,
  OpenQuestion,
  PendingOffer,
} from '../types';

export const STATE_VERSION = 2 as const;

export function createState(salt?: number): DialogueState {
  return {
    version: STATE_VERSION,
    turn: 0,
    topicStack: [],
    mentions: [],
    explained: [],
    offer: null,
    openQuestion: null,
    expertise: 'intermediate',
    salt: typeof salt === 'number' && Number.isFinite(salt) ? Math.abs(Math.floor(salt)) : Math.floor(Math.random() * 1e6),
    lastUserText: '',
    lastAnswerTitle: '',
  };
}

// ─── Validation primitives ───────────────────────────────────────────────────

function asString(v: unknown, max = 500): string {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

function asInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  return i < min ? min : i > max ? max : i;
}

function asIdList(v: unknown, max = 64): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== 'string') continue;
    const s = item.trim().slice(0, 80);
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

const EXPERTISE = new Set(['beginner', 'intermediate', 'expert']);
// Must list every member of `AnswerShape`. Omitting one silently coerces a
// persisted open question of that shape back to 'definition' — which is what
// happened to the newly added 'safety' shape until it was added here.
const SHAPES = new Set<AnswerShape>([
  'definition', 'mechanism', 'reason', 'comparison', 'enumeration',
  'fact', 'opinion', 'instance', 'social', 'meta', 'command',
  'safety',
]);
const INTENTS = new Set<Intent>([
  'ask', 'followup', 'correct', 'reject', 'affirm', 'social', 'meta',
  'command', 'unknown',
]);

function asShape(v: unknown): AnswerShape {
  return typeof v === 'string' && SHAPES.has(v as AnswerShape) ? (v as AnswerShape) : 'definition';
}

function asIntent(v: unknown): Intent {
  return typeof v === 'string' && INTENTS.has(v as Intent) ? (v as Intent) : 'unknown';
}

function asOffer(v: unknown): PendingOffer | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const conceptId = asString(o.conceptId, 80);
  const kind = asString(o.kind, 10);
  if (!conceptId) return null;
  if (kind !== 'code' && kind !== 'deepen') return null;
  return {
    conceptId,
    title: asString(o.title, 160),
    kind,
    offeredAtTurn: asInt(o.offeredAtTurn, 0, 1e6, 0),
  };
}

function asOpenQuestion(v: unknown): OpenQuestion | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.options)) return null;
  const options: OpenQuestion['options'] = [];
  for (const raw of o.options) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const label = asString(r.label, 120);
    if (!label) continue;
    options.push({
      label,
      conceptId: asString(r.conceptId, 80) || undefined,
      kind: asShape(r.kind),
      intent: asIntent(r.intent),
    });
    if (options.length >= 4) break;
  }
  if (options.length === 0) return null;
  return { options, askedAtTurn: asInt(o.askedAtTurn, 0, 1e6, 0) };
}

// ─── Sanitizer ───────────────────────────────────────────────────────────────

/**
 * Validate an entire client-supplied state object. Returns a fresh state when
 * anything is structurally wrong, so a corrupt payload degrades to "new
 * session" rather than to an exception.
 */
export function sanitizeState(raw: unknown): DialogueState {
  const fresh = createState();
  if (!raw || typeof raw !== 'object') return fresh;
  const o = raw as Record<string, unknown>;

  // A version mismatch means the shape may be arbitrary; start clean.
  if (asInt(o.version, 0, 999, 0) !== STATE_VERSION) return fresh;

  const mentions: DialogueState['mentions'] = [];
  if (Array.isArray(o.mentions)) {
    for (const m of o.mentions.slice(0, 64)) {
      if (!m || typeof m !== 'object') continue;
      const r = m as Record<string, unknown>;
      const id = asString(r.id, 80);
      if (!id) continue;
      mentions.push({
        id,
        turn: asInt(r.turn, 0, 1e6, 0),
        explained: asInt(r.explained, 0, 1e6, 0),
      });
    }
  }

  const expertiseRaw = asString(o.expertise, 20);

  return {
    version: STATE_VERSION,
    turn: asInt(o.turn, 0, 1e5, 0),
    topicStack: asIdList(o.topicStack),
    mentions,
    explained: asIdList(o.explained, 128),
    offer: asOffer(o.offer),
    openQuestion: asOpenQuestion(o.openQuestion),
    expertise: EXPERTISE.has(expertiseRaw) ? (expertiseRaw as DialogueState['expertise']) : 'intermediate',
    // The salt is server-owned variety, but it is still clamped to a safe int.
    salt: asInt(o.salt, 0, 1e9, fresh.salt),
    lastUserText: asString(o.lastUserText, 600),
    lastAnswerTitle: asString(o.lastAnswerTitle, 200),
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface RecordOptions {
  conceptIds: string[];
  answerTitle: string;
  userText: string;
  explainedConcept?: string;
}

/**
 * Record one exchange.
 *
 * The legacy `topicThread` mixed concept ids with display titles, so
 * follow-up resolution compared an id against a title and silently failed.
 * This stack holds ids ONLY; titles live in `lastAnswerTitle`.
 */
export function recordTurn(state: DialogueState, o: RecordOptions): DialogueState {
  const turn = state.turn + 1;

  const stack = [...state.topicStack];
  for (const id of o.conceptIds) {
    const at = stack.indexOf(id);
    if (at >= 0) stack.splice(at, 1);
    stack.unshift(id);
  }

  return {
    ...state,
    turn,
    topicStack: stack.slice(0, 12),
    explained: o.explainedConcept
      ? [...new Set([...state.explained, o.explainedConcept])].slice(-64)
      : state.explained,
    mentions: o.conceptIds.length
      ? [
          ...state.mentions.filter(m => !o.conceptIds.includes(m.id)),
          ...o.conceptIds.map(id => ({
            id,
            turn,
            explained: (state.mentions.find(m => m.id === id)?.explained ?? 0) + 1,
          })),
        ].slice(-32)
      : state.mentions,
    lastUserText: o.userText.slice(0, 600),
    lastAnswerTitle: o.answerTitle.slice(0, 200),
  };
}

/** The topic a follow-up should resolve to, if any. */
export function currentTopic(state: DialogueState): string | undefined {
  return state.topicStack[0];
}
