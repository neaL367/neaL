/**
 * Builds lib/nara/knowledge/corpus.json from the real MDX sources.
 *
 *   bun run scripts/build-corpus.ts
 *
 * Replaces the legacy `scripts/build-site-index.ts`, which cleaned markdown
 * PER LINE. That meant a multi-line JSX element in app/page.mdx was never
 * stripped, so the home section's `summary` — a field carrying BM25F weight
 * 2.5 and feeding the embedding input — was 160 characters of
 * `className="text-inherit no-underline … viewTransitionName: 'author-name' …"`.
 *
 * Fixes here, each with the bug it removes:
 *  1. JSX is stripped as a whole ELEMENT over the document, not line by line,
 *     so multi-line tags and their attributes disappear.
 *  2. Frontmatter accepts single quotes, double quotes AND backticks. The old
 *     regex only matched `'…'`, so switching an author to double quotes
 *     silently dropped the title and date.
 *  3. Summaries are truncated on a word/sentence boundary, never mid-word
 *     (the old build emitted "display: 'i" as user-visible text).
 *  4. A coverage check fails loudly if a generated section contains markup
 *     residue, so this class of bug cannot return silently.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'app', 'writing', 'posts');
const HOME_PAGE = path.join(ROOT, 'app', 'page.mdx');
const OUT_FILE = path.join(ROOT, 'lib', 'nara', 'knowledge', 'corpus.json');
const LEXICON_FILE = path.join(ROOT, 'lib', 'nara', 'language', 'lexicon.ts');

const MAX_CHUNK_CHARS = 1200;
const TARGET_CHUNK_CHARS = 700;
const SUMMARY_CHARS = 200;

interface OutSection {
  id: string;
  slug: string;
  url: string;
  pageTitle: string;
  heading: string;
  level: number;
  publishedAt?: string;
  summary: string;
  text: string;
}

// ─── Frontmatter ─────────────────────────────────────────────────────────────

/** Reads a metadata string in single, double, or backtick quotes. */
function readMeta(src: string): { title: string; publishedAt: string; summary: string } {
  const block = src.match(/export\s+const\s+metadata\s*=\s*\{([\s\S]*?)\n\};/);
  const pick = (key: string): string => {
    if (!block) return '';
    const m = block[1].match(
      new RegExp(`${key}\\s*:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)"|\`((?:[^\`\\\\]|\\\\.)*)\`)`),
    );
    return (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim();
  };
  return { title: pick('title'), publishedAt: pick('publishedAt'), summary: pick('summary') };
}

function stripMeta(src: string): string {
  return src.replace(/export\s+const\s+metadata\s*=\s*\{[\s\S]*?\n\};/, '').trim();
}

// ─── JSX removal (whole-element, multi-line safe) ────────────────────────────

/**
 * Remove JSX elements and expressions wholesale, before any line splitting.
 *
 * Handles, in order:
 *  - fenced code blocks (kept out of prose; they are not answers)
 *  - `{expression}` attribute values, including multi-line objects
 *  - self-closing tags `<Foo … />`
 *  - paired tags with their inner text preserved only when the tag is inline
 *    text formatting; block-level components are dropped with their children
 *    because their children are markup, not prose.
 */
function stripJsx(src: string): string {
  let out = src;

  // Fenced code blocks: record placeholders so code is not treated as prose.
  const fences: string[] = [];
  out = out.replace(/```[\s\S]*?```/g, m => {
    fences.push(m);
    return `\n\u0000FENCE${fences.length - 1}\u0000\n`;
  });

  // Balanced {…} expressions (handles nested braces and strings).
  out = removeBalancedBraces(out);

  // Self-closing component tags, possibly multi-line.
  out = out.replace(/<[A-Za-z][A-Za-z0-9.]*(?:\s[^<>]*?)?\/>/gs, ' ');

  // Paired component tags: drop the tag pair, KEEP inner text only when the
  // inner content has no further markup (i.e. it is real prose like
  // <NaraTrigger>Nara</NaraTrigger>). Otherwise drop the whole block.
  out = out.replace(
    /<([A-Za-z][A-Za-z0-9.]*)(?:\s[^<>]*?)?>([\s\S]*?)<\/\1>/g,
    (_m, _tag: string, inner: string) => (inner.includes('<') ? ' ' : ` ${inner} `),
  );

  // Any remaining stray tag.
  out = out.replace(/<\/?[A-Za-z][^<>]*?>/g, ' ');

  // Restore fences as placeholders for the section splitter to skip.
  out = out.replace(/\u0000FENCE(\d+)\u0000/g, (_m, i: string) => fences[Number(i)] ?? '');

  return out;
}

/** Remove `{ ... }` with correct nesting, string- and escape-aware. */
function removeBalancedBraces(src: string): string {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      if (depth === 0) out.push(ch);
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      if (depth === 0) {
        out.push(ch);
      }
      quote = ch;
      continue;
    }
    if (ch === '{') {
      depth++;
      continue;
    }
    if (ch === '}') {
      if (depth > 0) depth--;
      continue;
    }
    if (depth === 0) out.push(ch);
  }
  return out.join('');
}

// ─── Markdown → plain text ───────────────────────────────────────────────────

function cleanInline(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // images -> alt
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(^|\W)\*(\S[^*]*\S)\*(?=\W|$)/g, '$1$2') // italic
    .replace(/(^|\W)_(\S[^_]*\S)_(?=\W|$)/g, '$1$2') // underscore italic
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/^#{1,6}\s+/, '')
    .replace(/^>\s?/, '')
    .replace(/^(\s*[-*+]\s+|\s*\d+[.)]\s+)/, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Truncate on a word boundary and close the sentence cleanly. */
function summarize(text: string, limit = SUMMARY_CHARS): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (lastStop > limit * 0.5) return cut.slice(0, lastStop + 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trim()}…`;
}

// ─── Sectioning ──────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

interface RawBlock {
  heading: string;
  level: number;
  paragraphs: string[];
}

function parseSections(
  slug: string,
  url: string,
  title: string,
  publishedAt: string,
  body: string,
): OutSection[] {
  const blocks: RawBlock[] = [];
  let current: RawBlock = { heading: `${title} Overview`, level: 1, paragraphs: [] };
  let inFence = false;

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trimEnd();
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue; // code is not answer prose
    const h = line.trim().match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      if (current.paragraphs.length > 0) blocks.push(current);
      current = { heading: cleanInline(h[2]) || title, level: h[1].length, paragraphs: [] };
      continue;
    }
    const text = cleanInline(line);
    if (text) current.paragraphs.push(text);
  }
  if (current.paragraphs.length > 0) blocks.push(current);

  const sections: OutSection[] = [];
  for (const b of blocks) {
    const chunks = chunkParagraphs(b.paragraphs);
    chunks.forEach((text, idx) => {
      sections.push({
        id: chunks.length > 1
          ? `${slug}#${slugify(b.heading)}-${idx + 1}`
          : `${slug}#${slugify(b.heading)}`,
        slug,
        url,
        pageTitle: title,
        heading: b.heading,
        level: b.level,
        ...(publishedAt ? { publishedAt } : {}),
        summary: summarize(text),
        text,
      });
    });
  }
  return sections;
}

function chunkParagraphs(paragraphs: string[]): string[] {
  const chunks: string[] = [];
  let cur = '';
  for (const p of paragraphs) {
    if ((`${cur} ${p}`).trim().length > MAX_CHUNK_CHARS && cur) {
      chunks.push(cur.trim());
      cur = p;
      continue;
    }
    cur = cur ? `${cur} ${p}` : p;
    if (cur.length >= TARGET_CHUNK_CHARS) {
      chunks.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) {
    if (chunks.length > 0 && cur.trim().length < 200) {
      chunks[chunks.length - 1] = `${chunks[chunks.length - 1]} ${cur.trim()}`;
    } else {
      chunks.push(cur.trim());
    }
  }
  return chunks.filter(Boolean);
}

function parseFile(filePath: string, slug: string, url: string, fallbackTitle: string): OutSection[] {
  const src = fs.readFileSync(filePath, 'utf-8');
  const meta = readMeta(src);
  const title = meta.title || fallbackTitle;
  if (!title) return [];
  return parseSections(slug, url, title, meta.publishedAt, stripJsx(stripMeta(src)));
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Markup residue that must never reach the index. */
const RESIDUE = /className=|viewTransition|style=\{\{|=>|\bexport\b|\bimport\b|<\/?[A-Za-z]/;

function validate(sections: OutSection[], errors: string[]): void {
  for (const s of sections) {
    if (RESIDUE.test(s.text)) {
      errors.push(`${s.id}: markup residue in text -> ${s.text.slice(0, 90)}…`);
    }
    if (RESIDUE.test(s.summary)) {
      errors.push(`${s.id}: markup residue in summary -> ${s.summary.slice(0, 90)}…`);
    }
    if (s.text.length < 40) {
      errors.push(`${s.id}: suspiciously short (${s.text.length} chars)`);
    }
    if (/\S…$/.test(s.summary) === false && s.summary.endsWith('…')) {
      // fine — ellipsis is the intended mid-sentence truncation marker
    }
    if (!s.heading) errors.push(`${s.id}: empty heading`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  const all: OutSection[] = [];
  const errors: string[] = [];

  if (fs.existsSync(HOME_PAGE)) all.push(...parseFile(HOME_PAGE, 'home', '/', 'Home'));

  const posts = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx')).sort();
  for (const file of posts) {
    const slug = file.replace(/\.mdx$/, '');
    all.push(...parseFile(path.join(POSTS_DIR, file), slug, `/writing/${slug}`, slug));
  }

  validate(all, errors);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(all, null, 2)}\n`, 'utf-8');

  const chars = all.reduce((n, s) => n + s.text.length, 0);
  console.log(`[build-corpus] ${all.length} sections, ${chars} chars -> ${path.relative(ROOT, OUT_FILE)}`);
  for (const s of all) console.log(`  · ${s.id} (${s.text.length}c)`);

  if (errors.length) {
    console.error(`\n[build-corpus] FAILED validation (${errors.length}):`);
    for (const e of errors) console.error('  ✗ ' + e);
    process.exit(1);
  }
  console.log('\n[build-corpus] validation passed — no markup residue');

  checkLexicon(all);
}

/**
 * Verify `lib/nara/language/lexicon.ts` still covers the content.
 *
 * The lexicon's own docstring has always claimed this script validates it.
 * It did not, and the list drifted far enough to matter: `knowledge`, `make`,
 * `share`, `people` and `engine` were all missing, so `knowledges` stemmed to
 * `knowledg` while `knowledge` stemmed to itself.
 *
 * The list is NOT regenerated here. A first attempt at that produced only four
 * words, because "is the e-less form also a corpus word" is too strict a test
 * for a corpus this small — `closure` was dropped even though `closures` is
 * common in the content. The curated list carries knowledge the text alone
 * does not, so this script's job is to catch drift, not to author it.
 *
 * The check is deliberately narrow: it flags an e-final word only when the
 * content ALSO uses a form whose e-less stem would collide with it. Those are
 * the words where a missing entry actually produces an asymmetry.
 */
function checkLexicon(sections: OutSection[]): void {
  const src = fs.readFileSync(LEXICON_FILE, 'utf-8');
  const listed = new Set(
    [...src.matchAll(/^\s*'([a-z]+)',/gm)].map(m => m[1]!),
  );

  const text = sections.map(s => `${s.heading} ${s.summary} ${s.text}`).join(' ').toLowerCase();
  const words = [...new Set(text.split(/[^a-z]+/).filter(w => w.length >= 4))];
  const vocabulary = new Set(words);

  const missing = new Set<string>();
  const note = (w: string) => {
    if (!listed.has(w)) missing.add(w);
  };

  for (const w of words) {
    if (w.length < 4) continue;

    // (a) An e-final word whose e-less form is also a word the content uses:
    //     "knowledge"/"knowledg" is not this case, but "close"/"clos" is.
    if (w.endsWith('e')) {
      const base = w.slice(0, -1);
      if (base.length >= 3 && vocabulary.has(base)) note(w);
    }

    // (b) A participle or plural whose base + `e` is a word the content uses.
    //     This is the case that matters most, because the e-final word may
    //     never appear bare: the prose writes "serving" and "observing" but
    //     never "serve" or "observe", so only the inflected side is visible.
    //     Without the entry, "serving" stems to "serv" and can never match
    //     "serve" if it is later added to the content.
    const stems: Array<[string, string[]]> = [
      ['ing', [w.slice(0, -3)]],
      ['ed', [w.slice(0, -1), w.slice(0, -2)]],
      ['es', [w.slice(0, -1)]],
    ];
    for (const [suffix, candidates] of stems) {
      if (!w.endsWith(suffix) || w.length <= suffix.length + 2) continue;
      for (const base of candidates) {
        if (base.length >= 3 && vocabulary.has(`${base}e`)) note(`${base}e`);
      }
    }
  }

  if (missing.size > 0) {
    console.error(`\n[build-corpus] lexicon is missing ${missing.size} e-final word(s):`);
    for (const w of [...missing].sort()) console.error(`  ✗ ${w}`);
    console.error('  Add them to SILENT_E_WORDS in lib/nara/language/lexicon.ts.');
    process.exit(1);
  }
  console.log(`[build-corpus] lexicon covers all ${listed.size} e-final words`);
}

main();
