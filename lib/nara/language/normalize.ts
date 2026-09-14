/**
 * Nara V2 — conservative text normalization.
 *
 * The legacy `normalize.ts` contained this map:
 *
 *   facts -> yes,  bet -> yes,  fr -> yes,  ong -> yes,  yh -> yes
 *
 * so the perfectly reasonable question "facts about react" was rewritten to
 * "yes about react" before any classifier saw it — the user's actual words
 * were destroyed by an over-eager slang dictionary. Normalization must never
 * change what was ASKED; it may only remove noise.
 *
 * Rules here:
 *  - Punctuation and whitespace are collapsed.
 *  - Smart quotes/apostrophes are folded to ASCII (the site's own data uses
 *    U+2019, and the legacy English gate rejected it with HTTP 400).
 *  - Emoji and symbols are dropped (again: the legacy gate 400'd on them).
 *  - Typo correction only fires for a small, high-confidence set of
 *    unambiguous misspellings. It never maps one real word to another.
 */

/** Curly quotes and dashes that appear in the site's own copy. */
const FOLD: Array<[RegExp, string]> = [
  [/[\u2018\u2019\u201B\u2032]/g, "'"],
  [/[\u201C\u201D\u201F\u2033]/g, '"'],
  [/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-'],
  [/\u2026/g, '...'],
  [/\u00A0/g, ' '],
];

/**
 * High-confidence misspellings only. Every entry is a word that is not itself
 * a valid English word or technical term, so the correction cannot destroy
 * meaning. Compare the legacy map, which rewrote valid words.
 */
const TYPOS = new Map<string, string>([
  ['recieve', 'receive'],
  ['seperate', 'separate'],
  ['definately', 'definitely'],
  ['occured', 'occurred'],
  ['wich', 'which'],
  ['teh', 'the'],
  ['adn', 'and'],
  ['taht', 'that'],
  ['javscript', 'javascript'],
  ['javascrpt', 'javascript'],
  ['typscript', 'typescript'],
  ['typescrpt', 'typescript'],
  ['reactjs', 'react'],
  ['nextjs', 'next.js'],
  ['nodejs', 'node.js'],
  ['postgress', 'postgres'],
  ['kubernets', 'kubernetes'],
  ['componant', 'component'],
  ['componets', 'components'],
  ['functon', 'function'],
  ['funtion', 'function'],
  ['variabel', 'variable'],
  ['asynchonous', 'asynchronous'],
  ['asyncronous', 'asynchronous'],
  ['perfomance', 'performance'],
  ['accesibility', 'accessibility'],
  ['acessibility', 'accessibility'],
  // Neither is a real English word; both are common human misspellings on
  // exactly the queries ("euphorea physics") that declined for lack of them.
  ['euphorea', 'euphoria'],
  ['euphora', 'euphoria'],
  ['phsyics', 'physics'],
]);

/** Emoji, pictographs, dingbats, and other symbol blocks. */
const SYMBOLS =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu;

export interface NormalizeResult {
  text: string;
  /** True when normalization removed nothing but noise. */
  changed: boolean;
  corrections: Array<{ from: string; to: string }>;
}

/**
 * Normalize without changing meaning. Idempotent: normalizing twice yields
 * the same string, which the legacy implementation also got right and which
 * matters because the client may echo text back through the API.
 */
export function normalize(input: string): NormalizeResult {
  const original = input;
  let text = input;

  for (const [re, to] of FOLD) text = text.replace(re, to);
  text = text.replace(SYMBOLS, ' ');

  // Keep technical and arithmetic punctuation that carries meaning:
  // . + # - / * % ^ ( ) and word characters.
  //
  // Apostrophes are preserved deliberately. Replacing them with a space turned
  // "don’t" into "don t", which broke contraction detection and made the
  // negation guard miss "don’t explain closures" — so the engine answered the
  // closure question it had just been told not to answer. `tokenize` strips
  // apostrophes on its own, so keeping them here costs nothing.
  text = text.replace(/[^\p{L}\p{N}\s.+#\-_/*%^()'’]/gu, ' ');

  const corrections: Array<{ from: string; to: string }> = [];
  text = text
    .split(/\s+/)
    .filter(Boolean)
    .map(word => {
      const bare = word.toLowerCase().replace(/[.+#\-_/]+$/, '');
      const fix = TYPOS.get(bare);
      if (fix) {
        corrections.push({ from: bare, to: fix });
        // Preserve trailing punctuation such as a question mark already gone.
        return word.toLowerCase().replace(bare, fix);
      }
      return word;
    })
    .join(' ');

  text = text.replace(/\s+/g, ' ').trim();

  return { text, changed: text !== original.trim(), corrections };
}

/**
 * Detect text that is effectively empty after normalization ("...", "!!!").
 */
export function isEffectivelyEmpty(text: string): boolean {
  return text.replace(/[^a-z0-9]/gi, '').length === 0;
}

/**
 * Language gate. The legacy `english.ts` rejected ANY character outside
 * \x20-\x7E with HTTP 400 — so a curly apostrophe from the client's keyboard
 * (or the site's own copy) killed the request. V2 accepts any script and lets
 * retrieval decide; only a query with no Latin/ASCII content at all is
 * reported as non-English, and even then the caller answers gracefully rather
 * than erroring.
 */
export function looksNonEnglish(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const latin = letters.filter(l => /[a-z]/i.test(l)).length;
  return latin / letters.length < 0.3;
}
