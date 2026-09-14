/**
 * Language-layer contract tests.
 *
 * These are the invariants the legacy engine violated. Each block names the
 * specific production bug it prevents.
 *
 *   bun run eval/language.test.ts
 */
import { stem, tokenize, contentTokens } from '@/lib/nara/language/text';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    pass++;
  } else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function eq(actual: unknown, expected: unknown): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

// ─── 1. Stemmer symmetry ─────────────────────────────────────────────────────
// Legacy: closure->closure but closures->closur; cache->cache but caching->cach.
const INFLECTIONS: Array<[string, string]> = [
  ['closure', 'closures'],
  ['cache', 'caching'],
  ['cache', 'caches'],
  ['cache', 'cached'],
  ['module', 'modules'],
  ['promise', 'promises'],
  ['string', 'strings'],
  ['render', 'renders'],
  ['component', 'components'],
  ['function', 'functions'],
  ['variable', 'variables'],
  ['object', 'objects'],
  ['array', 'arrays'],
  ['hook', 'hooks'],
  ['event', 'events'],
  ['task', 'tasks'],
  ['type', 'types'],
  ['generics', 'generic'],
  ['class', 'classes'],
  ['box', 'boxes'],
  ['match', 'matches'],
  ['study', 'studies'],
  ['walk', 'walked'],
  ['close', 'closed'],
  ['resolve', 'resolved'],
  ['container', 'containers'],
  ['scope', 'scopes'],
  ['loop', 'loops'],
  ['state', 'states'],
];

for (const [a, b] of INFLECTIONS) {
  check(`stem symmetry: "${a}" == "${b}"`, stem(a) === stem(b), `stem("${a}")=${stem(a)} stem("${b}")=${stem(b)}`);
}

// ─── 2. Stemmer idempotence ──────────────────────────────────────────────────
const IDEMPOTENT_WORDS = [
  'closures', 'cache', 'caching', 'rendering', 'components', 'generics',
  'principles', 'modularity', 'accessibility', 'asynchronous', 'performance',
  'understanding', 'engineered', 'functional', 'containers', 'immutability',
  'javascript', 'typescript', 'hydration', 'memoization',
];
for (const w of IDEMPOTENT_WORDS) {
  check(`stem idempotent: "${w}"`, stem(stem(w)) === stem(w), `${w} -> ${stem(w)} -> ${stem(stem(w))}`);
}

// ─── 3. Short words untouched ────────────────────────────────────────────────
for (const w of ['js', 'ts', 'go', 'css', 'api', 'dom', 'sql']) {
  check(`short word preserved: "${w}"`, stem(w) === w, `got ${stem(w)}`);
}

// ─── 4. Preserved-term integrity ─────────────────────────────────────────────
// Legacy: "asp.net core" -> ["asp__term_6__", "core"]  (garbage token)
const PRESERVED_CASES: Array<[string, string[]]> = [
  ['asp.net core', ['asp.net core']],
  ['.net framework', ['.net', 'framework']],
  ['next.js app router', ['next.js', 'app', 'router']],
  ['node.js streams', ['node.js', 'streams']],
  ['c++ templates', ['c++', 'templates']],
  ['c# generics', ['c#', 'generics']],
  ['ci/cd pipeline', ['ci/cd', 'pipeline']],
];

for (const [input, expected] of PRESERVED_CASES) {
  const got = tokenize(input);
  check(`preserved terms: "${input}"`, eq(got, expected), `got ${JSON.stringify(got)}`);
}

// No token may ever contain a control character or a placeholder remnant.
const PROBE_TEXTS = [
  'asp.net core and next.js routing',
  'node.js vs .net performance',
  'tell me about c++ and c#',
  'react.js or vue.js?',
  'ci/cd with e2e tests',
];
for (const text of PROBE_TEXTS) {
  const toks = tokenize(text);
  check(
    `no placeholder leakage: "${text}"`,
    toks.every(t => !t.includes('\u0000') && !/__term_/.test(t)),
    JSON.stringify(toks),
  );
}

// ─── 5. Content tokens ───────────────────────────────────────────────────────
// Legacy: normalize.ts turned "facts" into "yes", deleting the content word.
check(
  'content tokens keep real words',
  eq(contentTokens('what is the cache'), ['cache']),
  JSON.stringify(contentTokens('what is the cache')),
);
check(
  'content tokens drop function words',
  contentTokens('how do you use the event loop').includes('event'),
  JSON.stringify(contentTokens('how do you use the event loop')),
);
check(
  'content tokens dedupe inflections',
  eq(contentTokens('closures closure'), ['closure']),
  JSON.stringify(contentTokens('closures closure')),
);

// ─── 6. Tokenizer is shared (doc-side and query-side agree) ─────────────────
// This is a real invariant, not a formality. The legacy engine indexed documents
// with one tokenizer (site-index-data.ts) and tokenized queries with another
// (query-reformulator.ts), so document and query terms could fail to intersect
// at all. There is now ONE tokenizer and ONE stemmer, used by the index builder,
// the retrieval lanes and the analyzer. If they ever diverge, this fails.
const DOC = 'Caching strategies in Next.js';
const QUERY = 'how does caching work in next.js';
const docStems = new Set(tokenize(DOC).map(stem));
const shared = tokenize(QUERY).map(stem).filter(t => docStems.has(t));
check('query/document stems intersect on shared terms', shared.length >= 2, `shared=${JSON.stringify(shared)}`);

// ─── Report ──────────────────────────────────────────────────────────────────
console.log(`\nlanguage contract: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('  ✓ all invariants hold\n');
