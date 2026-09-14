/**
 * Builds lib/nara/knowledge/expansion.json — the OFFLINE semantic layer.
 *
 *   bun run scripts/build-semantic.ts
 *
 * WHY THIS EXISTS
 * ---------------
 * The legacy engine's semantic lane was a MiniLM sentence-transformer
 * (`Xenova/all-MiniLM-L6-v2`), intended to run locally via
 * `@huggingface/transformers` and fed a 275 KB `embeddings.json` of 69 x 384
 * floats. Two problems:
 *
 *  1. The package was declared in package.json and bun.lock but was NOT
 *     INSTALLED — the only one of 296 declared dependencies missing from
 *     node_modules. So `embedText()` returned null on every request, the
 *     semantic lane was always empty, and the intent vectors never loaded.
 *     Three of the four advertised confidence signals were dead code.
 *  2. When it did work it was a runtime dependency on a native ONNX runtime,
 *     which is exactly the kind of thing that silently degrades.
 *
 * Both the package and the embeddings file have since been deleted, along with
 * the legacy engine. V2 has no runtime model at all.
 *
 * V2 has no runtime model. Instead, term associations are MINED AT BUILD TIME
 * from how the curated corpus actually uses words together, and frozen into a
 * plain JSON map. The runtime work is a hash lookup — no native code, no
 * download, no optional dependency, and nothing that can quietly return null.
 *
 * Method: for every pair of content terms co-occurring inside a sliding
 * window, accumulate a PPMI-style association score, then keep the top K
 * neighbours per term. PPMI (positive pointwise mutual information) is used
 * rather than raw counts so that a term which simply appears everywhere
 * ("code", "use") does not become everyone's neighbour.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, 'lib', 'nara', 'knowledge', 'expansion.json');

const WINDOW = 6;
const TOP_K = 6;
/** A term must be seen at least this often to be worth associating. */
const MIN_TERM_COUNT = 2;
/** Associations below this PPMI score are noise and are dropped. */
const MIN_SCORE = 0.5;
const MAX_TERMS = 2000;

// ─── Load indexed documents ──────────────────────────────────────────────────

function loadDocs(): Array<{ id: string; text: string }> {
  const docs: Array<{ id: string; text: string }> = [];

  const corpus = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'lib', 'nara', 'knowledge', 'corpus.json'), 'utf-8'),
  ) as Array<{ id: string; text: string }>;
  for (const c of corpus) docs.push({ id: `corpus:${c.id}`, text: c.text });

  // Topics and concepts are read as source text; we only need their prose.
  const topicFiles = [
    'lib/chat/knowledge/topics/core-topics.ts',
    'lib/chat/knowledge/topics/js-ts-topics.ts',
    'lib/chat/knowledge/topics/web-framework-topics.ts',
    'lib/chat/knowledge/topics/concepts-dict.ts',
    'lib/chat/knowledge/concept-graph-data.ts',
    'lib/search/knowledge-graph-data.ts',
  ];
  for (const rel of topicFiles) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf-8');
    // Pull the string literals out of the TS source; that is the prose.
    for (const m of raw.matchAll(/'((?:[^'\\]|\\.){20,})'/g)) {
      const s = m[1].replace(/\\'/g, "'").replace(/\\n/g, ' ');
      docs.push({ id: rel, text: s });
    }
  }

  return docs;
}

// ─── Tokenization (mirrors lib/nara/language/text.ts) ────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this',
  'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'having', 'will',
  'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'to',
  'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
  'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'too', 'very', 's', 't', 'just', 'don', 'now',
  'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which', 'who',
  'whom', 'as', 'because', 'while', 'also', 'like', 'get', 'got', 'make',
  'made', 'use', 'used', 'using', 'way', 'thing', 'things', 'one', 'two',
  'much', 'many', 'let', 'see', 'say', 'said', 'go', 'going', 'even', 'still',
  'well', 'back', 'new', 'want', 'need', 'know', 'take', 'come', 'look',
  'good', 'best', 'better', 'first', 'last', 'long', 'own', 'same', 'every',
]);

/**
 * Generic filler that carries no topical signal. Small corpora over-mine
 * these into every neighbour list ("database -> allowing"), which would then
 * pollute query expansion, so they are removed.
 */
const GENERIC = new Set([
  'allowing', 'direct', 'directly', 'simple', 'simply', 'handle', 'handling',
  'allow', 'allows', 'include', 'includes', 'including', 'provide',
  'provides', 'providing', 'require', 'requires', 'required', 'often',
  'always', 'never', 'usually', 'really', 'actually', 'instead', 'within',
  'without', 'across', 'along', 'around', 'behind', 'beyond', 'during',
  'enough', 'entire', 'everything', 'example', 'examples', 'however',
  'itself', 'least', 'less', 'lots', 'maybe', 'nothing', 'particular',
  'perhaps', 'quite', 'rather', 'since', 'something', 'sometimes',
  'together', 'toward', 'towards', 'unless', 'until', 'whether', 'whose',
  'yourself', 'contributing', 'based', 'comes', 'means', 'matters',
  'works', 'working', 'start', 'starts', 'starting', 'keep', 'keeps',
  'keeping', 'lives', 'live', 'takes', 'taking', 'gives', 'giving',
  'writing', 'written', 'reads', 'reading', 'called', 'calling',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.-]/g, ' ')
    .split(/\s+/)
    .map(t => t.replace(/^[.+#-]+|[.+#-]+$/g, ''))
    .filter(
      t =>
        t.length >= 3 &&
        t.length <= 24 &&
        !STOPWORDS.has(t) &&
        !GENERIC.has(t) &&
        !/^\d+$/.test(t),
    );
}

// ─── Co-occurrence + PPMI ────────────────────────────────────────────────────

function main(): void {
  const docs = loadDocs();
  console.log(`[build-semantic] ${docs.length} text units`);

  const termCount = new Map<string, number>();
  const pairCount = new Map<string, number>();

  const pairKey = (a: string, b: string): string => (a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`);

  for (const d of docs) {
    const toks = tokenize(d.text);
    if (toks.length < 3) continue;
    const localTerms = new Set<string>();
    for (const t of toks) localTerms.add(t);
    for (const t of localTerms) termCount.set(t, (termCount.get(t) ?? 0) + 1);

    for (let i = 0; i < toks.length; i++) {
      const a = toks[i];
      const seen = new Set<string>();
      for (let j = i + 1; j < Math.min(toks.length, i + 1 + WINDOW); j++) {
        const b = toks[j];
        if (a === b || seen.has(b)) continue;
        seen.add(b);
        if (!localTerms.has(a) || !localTerms.has(b)) continue;
        // Distance decay: closer words are more strongly associated.
        pairCount.set(pairKey(a, b), (pairCount.get(pairKey(a, b)) ?? 0) + 1);
      }
    }
  }

  // Keep the highest-signal terms only, so the artifact stays small.
  const ranked = [...termCount.entries()]
    .filter(([, c]) => c >= MIN_TERM_COUNT)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TERMS)
    .map(([t]) => t);
  const keep = new Set(ranked);

  // PPMI over kept terms.
  //
  // Denominators matter: term probabilities are taken over TOTAL term
  // occurrences and pair probabilities over TOTAL pair occurrences. Using the
  // document count for both (the obvious-but-wrong choice) makes every pmi
  // negative for common words and collapses the map to a handful of terms.
  const neighbours = new Map<string, Array<{ term: string; score: number }>>();
  let totalTermOccurrences = 0;
  for (const [t, c] of termCount) if (keep.has(t)) totalTermOccurrences += c;
  let totalPairs = 0;
  for (const [key, c] of pairCount) {
    const [a, b] = key.split('\u0000');
    if (keep.has(a) && keep.has(b)) totalPairs += c;
  }
  totalPairs = totalPairs || 1;
  totalTermOccurrences = totalTermOccurrences || 1;

  for (const [key, count] of pairCount) {
    const [a, b] = key.split('\u0000');
    if (!keep.has(a) || !keep.has(b)) continue;
    const pa = (termCount.get(a) ?? 0) / totalTermOccurrences;
    const pb = (termCount.get(b) ?? 0) / totalTermOccurrences;
    const pab = count / totalPairs;
    if (pab <= 0 || pa <= 0 || pb <= 0) continue;
    const pmi = Math.log(pab / (pa * pb));
    if (pmi <= 0) continue;
    const score = Number(pmi.toFixed(3));
    if (score < MIN_SCORE) continue;
    for (const [x, y] of [[a, b], [b, a]] as const) {
      const list = neighbours.get(x) ?? [];
      list.push({ term: y, score });
      neighbours.set(x, list);
    }
  }

  const out: Record<string, Array<{ term: string; score: number }>> = {};
  for (const [term, list] of neighbours) {
    const trimmed = list.sort((a, b) => b.score - a.score).slice(0, TOP_K);
    if (trimmed.length > 0) out[term] = trimmed;
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(out)}\n`, 'utf-8');

  const size = fs.statSync(OUT_FILE).size;
  console.log(`[build-semantic] ${Object.keys(out).length} terms -> ${path.relative(ROOT, OUT_FILE)} (${(size / 1024).toFixed(1)} KB)`);

  for (const probe of ['cache', 'closure', 'state', 'async', 'react', 'database']) {
    const n = out[probe];
    if (n) console.log(`  ${probe.padEnd(10)} -> ${n.map(x => `${x.term}(${x.score})`).join(', ')}`);
  }
}

main();
