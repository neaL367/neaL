import { levenshteinDistance } from '@/lib/chat/knowledge/concept-graph';

export interface FuzzyCommand {
  conceptId: string;
  confidence: number;
}

export function strippedWords(clean: string): string[] {
  return clean
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^\/+/, ''))
    .filter(Boolean);
}

export function fuzzyWordMatch(word: string, target: string, maxDist: number): boolean {
  const w = word.replace(/^\/+/, '').toLowerCase();
  const t = target.toLowerCase();
  if (w === t) return true;
  if (Math.abs(w.length - t.length) > 2) return false;
  return levenshteinDistance(w, t) <= maxDist;
}

export function fuzzyContainsWord(clean: string, target: string, maxDist: number): boolean {
  for (const w of strippedWords(clean)) {
    if (fuzzyWordMatch(w, target, maxDist)) return true;
  }
  return false;
}

export function fuzzyStartsWithPhrase(clean: string, phrase: string[], maxTotalDist: number): boolean {
  const words = strippedWords(clean);
  if (words.length < phrase.length) return false;
  let total = 0;
  for (let i = 0; i < phrase.length; i++) {
    const w = words[i];
    const t = phrase[i].toLowerCase();
    if (w === t) continue;
    if (Math.abs(w.length - t.length) > 2) return false;
    const d = levenshteinDistance(w, t);
    // Per-word cap to avoid one wildly different word slipping through
    const perWordMax = t.length >= 4 ? 2 : 1;
    if (d > perWordMax) return false;
    total += d;
    if (total > maxTotalDist) return false;
  }
  return true;
}

export function detectFuzzyCommand(clean: string): FuzzyCommand | null {
  const words = strippedWords(clean);
  if (words.length === 0) return null;
  const isSlash = clean.trim().startsWith('/');

  // Slash commands with typo, e.g. "/qiuz", "/rest", "/hep"
  if (isSlash && words.length >= 1) {
    const first = words[0];
    if (fuzzyWordMatch(first, 'quiz', 2)) return { conceptId: 'quiz', confidence: 0.9 };
    if (fuzzyWordMatch(first, 'reset', 2) || fuzzyWordMatch(first, 'clear', 2))
      return { conceptId: 'reset', confidence: 0.9 };
    if (fuzzyWordMatch(first, 'help', 1)) return { conceptId: 'help', confidence: 0.9 };
  }

  // Typo'd quiz phrases at start, e.g. "qiuz me", "quizz me", "start quizz"
  const quizPhraseFuzzy =
    fuzzyStartsWithPhrase(clean, ['quiz', 'me'], 2) ||
    fuzzyStartsWithPhrase(clean, ['start', 'quiz'], 2) ||
    fuzzyStartsWithPhrase(clean, ['take', 'a', 'quiz'], 2) ||
    fuzzyStartsWithPhrase(clean, ['test', 'my', 'knowledge'], 3);
  if (quizPhraseFuzzy && fuzzyContainsWord(clean, 'quiz', 2)) {
    return { conceptId: 'quiz', confidence: 0.88 };
  }

  // Bare "quiz"/"qiuz" (1-2 words) → quiz intent
  if (words.length <= 2 && fuzzyContainsWord(clean, 'quiz', 2)) {
    // Guard against "quit" false positive (quit = abandon, not quiz)
    if (!(words.length === 1 && fuzzyWordMatch(words[0], 'quit', 0))) {
      // Require quiz-like word, not just any fuzzy neighbor: ensure the
      // matched word shares prefix/suffix with "quiz" to cut "quit"/"quid" noise
      // unless quiz context words present.
      const hasContext = words.some(w =>
        ['me', 'start', 'take', 'test', 'please', 'again', 'another', 'more'].includes(w)
      );
      if (hasContext || words.some(w => fuzzyWordMatch(w, 'quiz', 1) || /^[q][a-z]{2,3}$/i.test(w))) {
        return { conceptId: 'quiz', confidence: 0.85 };
      }
    }
  }

  return null;
}
