/**
 * English-only input guard. Nara's retrieval, classifiers, and copy are all
 * English-tuned, so non-English input can only produce confident nonsense.
 * Rule: ASCII printable + whitespace. Everything else is stripped client-side
 * and rejected server-side (client checks are bypassable).
 */

export const ENGLISH_ONLY_ERROR =
  'Please write in English only — I can only understand English questions!';

const NON_ENGLISH_RE = /[^\x20-\x7E\s]/;
const NON_ENGLISH_GLOBAL_RE = /[^\x20-\x7E\s]/g;

export function isEnglishText(text: string): boolean {
  return !NON_ENGLISH_RE.test(text);
}

export function stripNonEnglish(text: string): string {
  return text.replace(NON_ENGLISH_GLOBAL_RE, '');
}
