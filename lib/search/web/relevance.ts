// Stopwords for relevance gating (question words + function words carry no signal).
const WEB_RELEVANCE_STOPWORDS = new Set([
  'who', 'what', 'when', 'where', 'why', 'how', 'which', 'whom', 'whose',
  'is', 'are', 'was', 'were', 'be', 'been', 'will', 'would', 'can', 'could',
  'do', 'does', 'did', 'the', 'and', 'for', 'with', 'from', 'that', 'this',
  'about', 'tell', 'you', 'your', 'gonna', 'wanna',
]);

export function significantQueryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 4 && !WEB_RELEVANCE_STOPWORDS.has(t));
}

/**
 * Acronym-aware match for digit-bearing keys ("gta6" → "Grand Theft Auto VI"):
 * letters must prefix the title's word initials in order. Narrow on purpose —
 * digit-bearing keys are specific (gta6, ps5), so false positives are rare.
 */
export function acronymHit(key: string, title: string): boolean {
  const alpha = key.replace(/[^a-z]/g, '');
  if (!/[0-9]/.test(key) || alpha.length < 2) return false;
  const initials = title
    .split(/[^a-z0-9]+/i)
    .filter(w => /^[a-z0-9]/i.test(w))
    .map(w => w[0].toLowerCase())
    .join('');
  return initials.startsWith(alpha);
}

/**
 * Deterministic relevance gate: the blind Wikipedia top-hit (and thin DDG
 * snippets) can be completely off-topic ("Open Water" for a GTA query).
 * Single-keyword queries carry too little signal to judge → accept.
 * Multi-keyword queries must hit the title or ≥2 distinct keys in text
 * (acronym-aware, so "gta6" counts toward "Grand Theft Auto VI").
 */
export function isRelevantResult(query: string, title: string, snippet: string): boolean {
  const keys = significantQueryTokens(query);
  if (keys.length <= 1) return true;
  const titleLow = title.toLowerCase();
  // Strong: any key in the title, or digit-key acronym alignment ("gta6"→title initials "gtav").
  if (keys.some(k => titleLow.includes(k) || acronymHit(k, titleLow))) return true;
  const hay = `${titleLow} ${snippet.toLowerCase()}`;
  return keys.filter(k => hay.includes(k) || acronymHit(k, titleLow)).length >= 2;
}
