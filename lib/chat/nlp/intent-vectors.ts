/**
 * Few-shot intent scorer: the answer to "yet another phrasing needs yet
 * another regex". Each intent owns a handful of example phrases; the query
 * embedding votes by cosine similarity. New typing styles work with ZERO new
 * conditions as long as they mean something close to an example.
 *
 * Design constraints:
 * - Regex stays authoritative: embedding confidence caps at 0.88, below every
 *   exact-match score (0.9+), and fractional priorities lose all ties.
 * - Entity intents (technical/personal/films) are EXCLUDED — the concept
 *   graph, KG triples, and film patterns own those with higher precision.
 * - Fully offline/local ( MiniLM already shipped); null-safe when the model
 *   or example vectors aren't ready — classify degrades to regex-only.
 */
import type { ConversationState, IntentType } from '@/lib/chat/types';
import { semanticIndex } from '@/lib/search/semantic-index';

// Floor: MiniLM paraphrases land 0.6-0.85; unrelated pairs sit 0.1-0.4.
const MIN_COSINE = 0.58;

const INTENT_EXAMPLES: Record<string, string[]> = {
  greeting: ['hi', 'hello there', 'hey, how is it going', 'good morning', 'yo, what is up', 'hiya'],
  thanks: ['thanks a lot', 'thank you so much', 'much obliged', 'really appreciate it', 'thanks for the help'],
  bye: ['bye for now', 'goodbye', 'see you later', 'catch you later', 'i have to run', 'talk to you soon'],
  joke: ['tell me a joke', 'make me laugh', 'got any good jokes', 'make me giggle', 'i could use a laugh'],
  fact: ['tell me something interesting', 'share a cool fact', 'hit me with some trivia', 'give me a fun fact'],
  empathy: ['i feel burned out', 'work is crushing me', 'i am exhausted lately', 'feeling overwhelmed', 'i want to give up'],
  affirm: ['yes please', 'sounds good', 'go right ahead', 'absolutely, continue', 'yes, show me more'],
  reject: ['no thank you', 'not interested', 'skip that', 'rather not', 'no, lets drop it'],
  quiz: ['quiz me', 'test my knowledge', 'challenge me with questions', 'ask me some quiz questions', 'test my frontend skills', 'start a quiz round'],
  help: ['what can you do', 'how can you help me', 'show me what you can do', 'what are your options here'],
  persona: ['who are you', 'tell me about yourself', 'introduce yourself', 'what is nara'],
  who_made: ['who made you', 'who created you', 'who built this thing', 'who is your creator'],
  how_are_you: ['how are you', 'how are you doing', 'how goes it', 'how have you been'],
  movie_rec: ['recommend a movie', 'what should i watch tonight', 'suggest a good film', 'movie recommendations please'],
  'film:interstellar': ['tell me about interstellar', 'time dilation on millers planet', 'gargantua black hole movie'],
  'film:arrival': ['tell me about arrival', 'heptapod aliens linguistics movie', 'sapir whorf film'],
  'film:contact': ['tell me about the contact movie', 'ellie arroway seti film', 'carl sagan contact'],
  'film:tenet': ['tell me about tenet', 'entropy inversion time movie', 'temporal pincer film'],
  'film:ex_machina': ['tell me about ex machina', 'ava robot consciousness film', 'turing test android movie'],
  'film:2001': ['tell me about 2001 space odyssey', 'hal 9000 kubrick film', 'space odyssey movie'],
};

const vectors = new Map<string, Float32Array[]>();
let loadPromise: Promise<void> | null = null;
let loaded = false;

export function isIntentVectorReady(): boolean {
  return loaded;
}

/** Idempotent background warm-up; safe to fire-and-forget per request. */
export async function ensureIntentVectorsLoaded(): Promise<void> {
  if (loaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    for (const [key, phrases] of Object.entries(INTENT_EXAMPLES)) {
      const vecs: Float32Array[] = [];
      for (const p of phrases) {
        const v = await semanticIndex.embedText(p);
        if (v) vecs.push(v);
      }
      if (vecs.length > 0) vectors.set(key, vecs);
    }
    loaded = vectors.size > 0;
  })();
  try {
    await loadPromise;
  } finally {
    loadPromise = null;
  }
}

export interface EmbeddingSignal {
  key: string;
  score: number;
}

function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}

/**
 * Sync cosine vote. Returns null when vectors aren't ready (regex-only mode)
 * or the query couldn't embed — never throws, never blocks.
 */
export function getEmbeddingSignals(queryVector: Float32Array | null): EmbeddingSignal[] | null {
  if (!queryVector || !loaded || vectors.size === 0) return null;
  const out: EmbeddingSignal[] = [];
  for (const [key, vecs] of vectors) {
    let best = -1;
    for (const v of vecs) {
      const s = cosine(queryVector, v);
      if (s > best) best = s;
    }
    if (best >= MIN_COSINE) out.push({ key, score: best });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

export type SignalPush = (
  intent: IntentType,
  conceptId: string | undefined,
  confidence: number,
  priority: number
) => void;

/** Map a cosine win onto pipeline candidates. Mirrors regex priorities +0.5 (lose ties). */
export function pushEmbeddingSignal(
  key: string,
  score: number,
  state: ConversationState | undefined,
  lastTopic: string | undefined,
  push: SignalPush
): void {
  // Cap below every exact regex (0.9+) so meaning-votes never overrule rules.
  const conf = Math.min(0.88, 0.62 + (score - MIN_COSINE) * 0.65);
  const pendingSubject = state?.pendingOffer?.subjectId;

  if (key === 'affirm') {
    if (pendingSubject) push('continuation', pendingSubject, conf, 20.5);
    else if (lastTopic) push('continuation', lastTopic, conf, 21.5);
    else push('conversational', 'affirmation', conf, 22.5);
    return;
  }
  if (key === 'reject') {
    push('rejection', pendingSubject || lastTopic, conf, 30.5);
    return;
  }
  if (key === 'quiz') {
    push('command', 'quiz', conf, 13.5);
    return;
  }
  if (key === 'help') {
    push('command', 'help', conf, 63.5);
    return;
  }
  if (key === 'joke') {
    push('joke', undefined, conf, 50.5);
    return;
  }
  if (key.startsWith('film:')) {
    push('conversational', key, conf, 90.5);
    return;
  }
  const table: Record<string, [IntentType, string | undefined, number]> = {
    greeting: ['conversational', 'greeting', 44.5],
    thanks: ['conversational', 'thanks', 40.5],
    bye: ['conversational', 'bye', 42.5],
    fact: ['conversational', 'fact', 51.5],
    empathy: ['conversational', 'empathy', 52.5],
    persona: ['conversational', 'persona', 60.5],
    who_made: ['conversational', 'who_made_you', 61.5],
    how_are_you: ['conversational', 'how_are_you', 62.5],
    movie_rec: ['conversational', 'movie_recommendation', 100.5],
  };
  const mapped = table[key];
  if (mapped) push(mapped[0], mapped[1], conf, mapped[2]);
}
