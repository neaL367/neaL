import { evaluateMathExpression } from '../math-evaluator';

const VOWEL_LESS_EXCEPTIONS = new Set([
  'rhythm', 'rhythms', 'crypt', 'crypts', 'lynx', 'flyby', 'flybys',
  'gypsy', 'gypsies', 'slyly', 'dryly', 'shyly', 'spryly', 'myrrh', 'sync', 'syncs',
  'myth', 'myths', 'hymn', 'hymns', 'psych', 'glyph', 'glyphs', 'tryst', 'trysts'
]);

export function isGibberish(text: string): boolean {
  const clean = text.toLowerCase().trim();
  if (!clean) return false;
  if (VOWEL_LESS_EXCEPTIONS.has(clean)) return false;
  // Keyboard spam or long consonant sequence (treating 'y' as vowel)
  if (/^[b-df-hj-np-tv-xz]{5,}$/i.test(clean)) return true;
  if (/^(asdf|qwer|zxcv|1234|hjkl)/i.test(clean) && clean.length >= 7) return true;
  if (/^([a-z])\1{3,}$/i.test(clean)) return true;
  if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`\s]+$/.test(clean) && clean.length >= 3) return true;
  return false;
}

export function tryEvaluateMath(text: string): string | null {
  const clean = text
    .replace(/^(what is|calculate|solve|eval|evaluate)\s+/i, '')
    .replace(/[?=]/g, '')
    .trim();

  const res = evaluateMathExpression(clean);
  if (res !== null) {
    return `${clean} = ${res}`;
  }
  return null;
}
