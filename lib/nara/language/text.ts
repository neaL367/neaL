/**
 * Nara V2 — the ONE tokenizer + stemmer, shared by indexing and querying.
 *
 * Why this file exists (and why the old one was replaced):
 *  - The legacy build ran documents through `site-index-data.ts` and queries
 *    through `query-reformulator.ts` — two different code paths that could
 *    never agree. Here, `tokenize()` is the only entry point for both.
 *  - The legacy stemmer was ASYMMETRIC: `closure -> closure` but
 *    `closures -> closur`, `cache -> cache` but `caching -> cach`. A query and
 *    a document spelling the same word differently therefore failed to match
 *    in BM25. Every rule below is written so that the singular and plural (and
 *    the base and the participle) collapse to the SAME stem.
 *  - The legacy preserved-term mechanism leaked placeholders: `"asp.net core"`
 *    tokenized to `["asp__term_6__", "core"]` because substitution matched
 *    inside a larger word. Substitution here is regex-boundary aware.
 */

import { SILENT_E_WORDS } from './lexicon';

/**
 * Terms whose internal punctuation is semantic. Matched with word boundaries,
 * longest-first, and restored verbatim after splitting.
 */
const PRESERVED: string[] = [
  'asp.net core',
  'asp.net',
  'next.js',
  'node.js',
  'react.js',
  'vue.js',
  'nuxt.js',
  'three.js',
  'express.js',
  '.net',
  'c++',
  'c#',
  'f#',
  'nextjs',
  'nodejs',
  'reactjs',
  'ci/cd',
  'e2e',
  'a/b',
  'i/o',
];

// Longest first so "asp.net core" wins over "asp.net" wins over ".net".
const PRESERVED_SORTED = [...PRESERVED].sort((a, b) => b.length - a.length);

/** Escape a literal string for use inside a RegExp. */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Boundary-aware phrase protection. A term only matches when it is not
 * glued to a preceding identifier character, so ".net" no longer fires
 * inside "asp.net" once "asp.net core" has already claimed the span.
 */
function protect(text: string): { text: string; map: Map<string, string> } {
  const map = new Map<string, string>();
  let out = text;
  let n = 0;
  for (const term of PRESERVED_SORTED) {
    const pattern = new RegExp(`(?<![\\w])${escapeRe(term)}(?![\\w])`, 'gi');
    out = out.replace(pattern, () => {
      const token = `\u0000${n}\u0000`;
      map.set(token, term.toLowerCase());
      n++;
      return ` ${token} `;
    });
  }
  return { text: out, map };
}

function restore(tokens: string[], map: Map<string, string>): string[] {
  if (map.size === 0) return tokens;
  return tokens.map(t => map.get(t) ?? t);
}

/**
 * Split text into lowercase word tokens. `minLength` 1 keeps short but
 * meaningful tokens ("js", "ts", "go"); callers that want content words
 * should filter with `contentTokens()`.
 */
export function tokenize(text: string, minLength = 1): string[] {
  if (!text) return [];
  const { text: guarded, map } = protect(text.toLowerCase());
  const raw = guarded
    .replace(/[^\w\s\u0000]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= minLength);
  return restore(raw, map);
}

/**
 * Normalize text for exact surface matching against the curated alias table.
 *
 * Keeps the characters that carry meaning in technical names (`.`, `+`, `#`,
 * `-`, `/`) so that "next.js", "c++", "c#", and "ci/cd" survive intact, while
 * folding smart punctuation and collapsing whitespace. Lowercases.
 */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[^\p{L}\p{N}\s.+#_/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Stemmer ─────────────────────────────────────────────────────────────────

const MIN_STEM_LENGTH = 3;

/**
 * Sibilant endings that consume the whole `-es` (box|es -> box, not boxe).
 * Used by `stripEsPlural`.
 */
const SIBILANT = /(?:ch|sh|ss|x|z)$/;

/**
 * Restore the silent `e` of a stem that lost it to an inflection.
 *
 * `SILENT_E_WORDS` — the corpus-derived set — is the only authority. Shape
 * cannot decide this, which is the entire reason the lexicon exists: "cache"
 * and "match" are structurally identical and behave differently.
 *
 * There used to be a broad shape fallback here, and it was actively harmful:
 * `ENDS_VOWEL_CONSONANT` matches `-oy`, so stripping the `-ing` from "deploying"
 * produced "deploy", which the fallback then turned into **"deploye"** — a word
 * that appears nowhere, invented by the stemmer, which then failed to match the
 * document's own "deploy". "reviewing" -> "reviewe", "streaming" -> "streame"
 * and "focusing" -> "focuse" were the same defect.
 *
 * Two narrow, lexicon-verified endings are still recovered, because otherwise
 * `demonstrating` -> "demonstrat" would never meet `demonstrate`:
 *   - `-ate` verbs: demonstrat|e, generat|e, accelerat|e
 *   - `-ve` verbs:  involv|e, serv|e, observ|e, preserv|e
 * Both are confirmed against the lexicon before an `e` is added, so the
 * invented-word failure cannot recur.
 */
function withSilentE(base: string): string {
  if (base.length < 2) return base;
  if (SILENT_E_WORDS.has(`${base}e`)) return `${base}e`;
  // The base is bounded so this cannot fire on long derivations, and must end
  // in a true consonant — never y/w/x, where a silent `e` does not apply.
  if (
    base.length <= 7 &&
    !/[aeiouwxy]$/.test(base) &&
    (base.endsWith('at') || base.endsWith('v')) &&
    SILENT_E_WORDS.has(`${base}e`)
  ) {
    return `${base}e`;
  }
  return base;
}

/**
 * Normalise an `-es` plural to its singular.
 *   cach|es  -> cache    (e-final word + bare `s`)
 *   match|es -> match    (sibilant word + full `es`)
 *   box|es   -> box
 */
function stripEsPlural(s: string): string {
  const base = s.slice(0, -2);
  const restored = withSilentE(base);
  if (restored !== base) return restored;
  return SIBILANT.test(base) ? base : restored;
}

/** Vowels, for the "a stem must contain a vowel" guards. */
const HAS_VOWEL = /[aeiou]/;

/**
 * Symmetric suffix stemmer.
 *
 * Contract (enforced by eval/language.test.ts):
 *  1. stem(x) === stem(y) for every inflection pair in INFLECTIONS.
 *  2. stem(stem(x)) === stem(x) — idempotent, so re-indexing is safe.
 *  3. Words of length <= 3 are unchanged.
 *
 * Structure, in order:
 *   A. inflectional layer — at most one rule fires
 *   B. e-final guard      — freezes "cache"/"closure" so their inflections
 *                           strip back TO them (this is the symmetry crux)
 *   C. derivational layer — applied to a fixed point, so rule ORDER can never
 *                           create an asymmetry between related words
 */
/**
 * Stop the derivational layer from stripping a suffix that is part of the
 * word's own base.
 *
 * The derivational rules are needed for genuinely derived words — they are
 * what makes "containers" agree with "container" — but they are blind to
 * whether the suffix they are removing is productive. `rend|er` looks
 * identical to `contain|er`, yet "render" is not "rend" + agent suffix: the
 * derivational pass turned "rendering" into "rend" while leaving "render"
 * alone, so a document saying "renders" could not be found by a query saying
 * "rendering".
 *
 * A suffix is only stripped when the word WITHOUT it is not itself a simpler
 * attested form. `render`/`rend` and `deploy`/`deploy|e` are frozen; a
 * genuine e-final base plus a suffix (`demonstrate` + `ing`) is not, because
 * the e is restored first by `withSilentE`.
 */
function keepBaseBeforeDerivation(s: string): boolean {
  if (s.length <= 6) {
    // Short bases are the dangerous ones: "rend" from "render", "cach" from
    // "cache". Their e-restored form is a real word, so leave them intact.
    return SILENT_E_WORDS.has(`${s}e`) || SILENT_E_WORDS.has(s);
  }
  return false;
}

export function stem(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= MIN_STEM_LENGTH) return w;

  // ── A. Inflectional layer ────────────────────────────────────────────────
  let s = w;

  if (s.endsWith('ies') && s.length > 4) {
    s = `${s.slice(0, -3)}y`; // studies -> study
  } else if (s.endsWith('es') && s.length > 4) {
    // The silent-e reading is tried first: "caches" also looks sibilant
    // ("cach" ends in "ch"), so testing SIBILANT first would yield "cach".
    s = stripEsPlural(s);
  } else if (s.endsWith('ing') && s.length > 5 && HAS_VOWEL.test(s.slice(0, -3))) {
    // The vowel guard stops "string" collapsing to "str": a stem with no
    // vowel cannot carry an -ing suffix in English.
    s = withSilentE(s.slice(0, -3));
  } else if (s.endsWith('ed') && s.length > 4 && HAS_VOWEL.test(s.slice(0, -2))) {
    // `-ed` is ambiguous about what it attached to, so both readings are
    // tried against the corpus list before falling back to the shape rule:
    //   walk|ed  -> walk      (consonant base)
    //   cach|ed  -> cache     (base that lost its silent e)
    const drop = s.slice(0, -2);
    const keepE = s.slice(0, -1);
    if (SILENT_E_WORDS.has(keepE)) s = keepE;
    else s = withSilentE(drop);
  } else if (s.endsWith('s') && !s.endsWith('ss') && !s.endsWith('us') && !s.endsWith('is') && s.length > 4) {
    s = s.slice(0, -1); // closures -> closure
  }

  // ── B. e-final guard ─────────────────────────────────────────────────────
  // Freeze here. Everything below is derivational and would strip the e,
  // breaking agreement with the inflections above.
  if (s.endsWith('e') && s.length > MIN_STEM_LENGTH) return s;

  // ── C. Derivational layer, to a fixed point ──────────────────────────────
  let guard = 0;
  let changed = true;
  while (changed && guard++ < 8) {
    changed = false;
    const before = s;
    if (s.endsWith('ation') && s.length > 7) s = s.slice(0, -5);
    else if (s.endsWith('tion') && s.length > 6) s = s.slice(0, -4);
    else if (s.endsWith('sion') && s.length > 6) s = s.slice(0, -4);
    else if (s.endsWith('ment') && s.length > 6) s = s.slice(0, -4);
    else if (s.endsWith('ness') && s.length > 6) s = s.slice(0, -4);
    else if (s.endsWith('ity') && s.length > 5) s = s.slice(0, -3);
    else if (s.endsWith('ive') && s.length > 5) s = s.slice(0, -3);
    else if (s.endsWith('ous') && s.length > 5) s = s.slice(0, -3);
    else if (s.endsWith('ful') && s.length > 5) s = s.slice(0, -3);
    else if (s.endsWith('ers') && s.length > 5) s = s.slice(0, -1);
    else if ((s.endsWith('er') || s.endsWith('or')) && s.length > 4) {
      // Do not strip a suffix that is part of the base: "render" is not
      // "rend" + agent suffix, so "rendering" must not become "rend" while
      // "render" stays whole. The base is only peeled when the peeled form is
      // itself not an attested e-final word.
      const peeled = s.slice(0, -2);
      if (keepBaseBeforeDerivation(peeled)) break;
      s = peeled;
    } else if (s.endsWith('est') && s.length > 5) s = s.slice(0, -3);
    else if (s.endsWith('ly') && s.length > 4) s = s.slice(0, -2);
    else if (s.endsWith('al') && s.length > 6) s = s.slice(0, -2);
    if (s !== before) changed = true;
  }

  return s.length >= MIN_STEM_LENGTH ? s : w;
}

/**
 * Extra index-side surface forms for a token.
 *
 * Belt-and-braces for the pairs a single-pass stemmer still cannot unify:
 * documents are indexed under these variants as well as their own stem, so a
 * query only has to match ONE plausible form. This makes retrieval symmetric
 * even where the stemmer is merely close.
 */
export function indexVariants(token: string): string[] {
  const t = token.toLowerCase();
  const out = new Set<string>([t, stem(t)]);
  const s = stem(t);
  // Silent-e restoration variants.
  if (s.length > 3 && !s.endsWith('e')) out.add(`${s}e`);
  if (s.endsWith('e')) out.add(s.slice(0, -1));
  // Plural/singular variants of the stem.
  if (!s.endsWith('s')) out.add(`${s}s`);
  if (s.endsWith('s')) out.add(s.slice(0, -1));
  if (!s.endsWith('ing')) out.add(`${s}ing`);
  return [...out].filter(v => v.length >= 2);
}

/** Convenience: tokenize then stem. */
export function stemTokens(tokens: string[]): string[] {
  return tokens.map(stem);
}

// ─── Stopwords ───────────────────────────────────────────────────────────────

/**
 * Function words. Used to derive CONTENT tokens (what a query is actually
 * about) and to build the confidence denominator. Kept deliberately small:
 * an over-broad list silently deletes the word the user cared about.
 */
export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'than', 'so', 'as',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'do', 'does', 'did', 'doing', 'done',
  'have', 'has', 'had', 'having',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours',
  'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers',
  'it', 'its', 'they', 'them', 'their', 'theirs',
  'this', 'that', 'these', 'those', 'there', 'here',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'about',
  'into', 'over', 'under', 'between', 'through', 'during', 'before', 'after',
  'not', 'no', 'nor', 'only', 'just', 'also', 'very', 'too', 'more', 'most',
  'some', 'any', 'all', 'each', 'every', 'both', 'few', 'many', 'much',
  'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
  'tell', 'explain', 'please', 'pls', 'thanks', 'thank', 'give', 'show',
  'want', 'need', 'know', 'like', 'get', 'got', 'make', 'made', 'use', 'used',
  'using', 'work', 'works', 'working', 'thing', 'things', 'stuff', 'way',
  's', 't', 're', 've', 'll', 'd', 'm',
]);

/** Content-bearing tokens (stems) from raw text, order-preserving, deduped. */
export function contentTokens(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tok of tokenize(text)) {
    if (STOPWORDS.has(tok)) continue;
    if (tok.length < 2) continue;
    const st = stem(tok);
    if (STOPWORDS.has(st)) continue;
    if (seen.has(st)) continue;
    seen.add(st);
    out.push(st);
  }
  return out;
}

/** True when the token carries meaning (not a stopword and not a single char). */
export function isContentToken(tok: string): boolean {
  return tok.length >= 2 && !STOPWORDS.has(tok);
}
