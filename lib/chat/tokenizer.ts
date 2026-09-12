// Tech terms that should not be split into punctuation fragments
const PRESERVED_TERMS = [
  'next.js',
  'node.js',
  'react.js',
  'vue.js',
  'c++',
  'c#',
  '.net',
  'type-safe',
  'type-safety',
  'client-side',
  'server-side',
  'full-stack',
  'e2e',
];

export function tokenize(text: string): string[] {
  let normalized = text.toLowerCase();

  // Protect preserved compound terms
  const replacements: Array<{ original: string; placeholder: string }> = [];
  PRESERVED_TERMS.forEach((term, idx) => {
    if (normalized.includes(term)) {
      const placeholder = `__term_${idx}__`;
      replacements.push({ original: term, placeholder });
      normalized = normalized.replaceAll(term, placeholder);
    }
  });

  // Tokenize words, removing standard punctuation
  const rawTokens = normalized
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);

  // Restore preserved terms
  return rawTokens.map(token => {
    const found = replacements.find(r => r.placeholder === token);
    return found ? found.original : token;
  });
}

// Bounded LRU-style cache for stem operations
const STEM_CACHE = new Map<string, string>();
const MAX_STEM_CACHE = 2048;

// Lightweight Porter-style suffix stemmer with O(1) memoization
export function stem(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return w;

  const cached = STEM_CACHE.get(w);
  if (cached !== undefined) return cached;

  let result = w;
  if (w.endsWith('ies') && w.length > 4) result = w.slice(0, -3) + 'y';
  else if (w.endsWith('ing') && w.length > 5) result = w.slice(0, -3);
  else if (w.endsWith('tion') && w.length > 5) result = w.slice(0, -4);
  else if (w.endsWith('ment') && w.length > 5) result = w.slice(0, -4);
  else if (w.endsWith('ness') && w.length > 5) result = w.slice(0, -4);
  else if (w.endsWith('ers') && w.length > 4) result = w.slice(0, -3);
  else if (w.endsWith('er') && w.length > 4) result = w.slice(0, -2);
  else if (w.endsWith('est') && w.length > 4) result = w.slice(0, -3);
  else if (w.endsWith('ed') && w.length > 4) result = w.slice(0, -2);
  else if (w.endsWith('ly') && w.length > 4) result = w.slice(0, -2);
  else if (w.endsWith('sses')) result = w.slice(0, -2);
  else if (w.endsWith('es') && w.length > 4) result = w.slice(0, -2);
  else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) result = w.slice(0, -1);

  if (STEM_CACHE.size >= MAX_STEM_CACHE) {
    const oldest = STEM_CACHE.keys().next().value;
    if (oldest) STEM_CACHE.delete(oldest);
  }
  STEM_CACHE.set(w, result);

  return result;
}

export const stemWord = stem;

