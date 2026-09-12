/**
 * Builds lib/search/site-index-data.generated.ts from the actual MDX sources
 * (app/page.mdx + app/writing/posts/*.mdx) so Nara indexes FULL post content —
 * every paragraph, not hand-copied excerpts. Run after editing any MDX, then
 * rebuild embeddings:
 *
 *   bun run build:site-index && bun run build:embeddings
 */
import fs from 'node:fs';
import path from 'node:path';

interface GenSection {
  id: string;
  slug: string;
  url: string;
  pageTitle: string;
  heading: string;
  level: number;
  summary?: string;
  publishedAt?: string;
  text: string;
}

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'app', 'writing', 'posts');
const HOME_PAGE = path.join(ROOT, 'app', 'page.mdx');
const OUT_FILE = path.join(ROOT, 'lib', 'search', 'site-index-data.generated.ts');

// Long sections split into paragraph chunks so answers stay pinpoint.
const MAX_CHUNK_CHARS = 1200;
const TARGET_CHUNK_CHARS = 700;

function readMeta(src: string): { title: string; publishedAt: string; summary: string } {
  const block = src.match(/export const metadata = \{([\s\S]*?)\};/);
  const pick = (key: string): string => {
    const m = block?.[1].match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`, 's'));
    return m ? m[1] : '';
  };
  return { title: pick('title'), publishedAt: pick('publishedAt'), summary: pick('summary') };
}

function stripMeta(src: string): string {
  return src.replace(/export const metadata = \{[\s\S]*?\};/, '').trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Markdown/JSX → plain text, keeping readable words. */
function cleanInline(s: string): string {
  return s
    .replace(/<[^>]+>/g, '') // JSX/HTML tags (keep inner text)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(^|\W)\*(\S[^*]*\S)\*(?=\W|$)/g, '$1$2') // italic
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/^#{1,6}\s+/, '') // headings
    .replace(/^>\s?/, '') // blockquotes
    .replace(/^(\s*[-*]\s+|\s*\d+[.)]\s+)/, '') // list markers
    .replace(/\s+/g, ' ')
    .trim();
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
  body: string
): GenSection[] {
  const blocks: RawBlock[] = [];
  let current: RawBlock = { heading: `${title} Overview`, level: 1, paragraphs: [] };
  let inFence = false;

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trimEnd();
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      const h = line.trim().match(/^(#{2,3})\s+(.*)$/);
      if (h) {
        if (current.paragraphs.length > 0) blocks.push(current);
        current = {
          heading: cleanInline(h[2]) || title,
          level: h[1].length,
          paragraphs: [],
        };
        continue;
      }
    }
    const text = cleanInline(line);
    if (text) current.paragraphs.push(text);
  }
  if (current.paragraphs.length > 0) blocks.push(current);

  const sections: GenSection[] = [];
  for (const b of blocks) {
    const chunks = chunkParagraphs(b.paragraphs);
    chunks.forEach((text, idx) => {
      sections.push({
        id: chunks.length > 1 ? `${slug}#${slugify(b.heading)}-${idx + 1}` : `${slug}#${slugify(b.heading)}`,
        slug,
        url,
        pageTitle: title,
        heading: b.heading,
        level: b.level,
        summary: text.slice(0, 160),
        ...(publishedAt ? { publishedAt } : {}),
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
    if ((cur + ' ' + p).trim().length > MAX_CHUNK_CHARS && cur) {
      chunks.push(cur.trim());
      cur = p;
      // Merge tiny stragglers forward instead of orphaning them
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

function parseFile(filePath: string, slug: string, url: string, fallbackTitle: string): GenSection[] {
  const src = fs.readFileSync(filePath, 'utf-8');
  const meta = readMeta(src);
  const title = meta.title || fallbackTitle;
  if (!title) return [];
  return parseSections(slug, url, title, meta.publishedAt, stripMeta(src));
}

function main(): void {
  const all: GenSection[] = [];
  if (fs.existsSync(HOME_PAGE)) {
    all.push(...parseFile(HOME_PAGE, 'home', '/', 'Home'));
  }
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .sort();
  for (const file of posts) {
    const slug = file.replace(/\.mdx$/, '');
    all.push(...parseFile(path.join(POSTS_DIR, file), slug, `/writing/${slug}`, slug));
  }

  const header = `/**
 * AUTO-GENERATED by \`bun run build:site-index\` — DO NOT EDIT.
 * Source of truth: app/page.mdx + app/writing/posts/*.mdx
 * Sections: ${all.length} (regenerate after editing MDX, then rebuild embeddings).
 */
`;
  const body = `export const GENERATED_SECTIONS = ${JSON.stringify(all, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, header + body, 'utf-8');
  console.log(`[build-site-index] Wrote ${all.length} sections → ${OUT_FILE}`);
  for (const s of all) {
    console.log(`  - ${s.id} (${s.text.length} chars)`);
  }
}

main();
