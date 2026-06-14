import fs from 'node:fs';
import path from 'node:path';

const postsDir = path.join(process.cwd(), 'app', 'writing', 'posts');
const outDir = path.join(process.cwd(), 'app', 'writing', 'generated');
const outFile = path.join(outDir, 'posts-manifest.ts');

function formatDate(date: string): string {
  if (!date) return '';
  const targetDate = new Date(date.includes('T') ? date : `${date}T00:00:00`);
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function countWords(text: string): number {
  const stripped = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/export\s+const\s+metadata\s*=\s*{[\s\S]*?};/g, '')
    .replace(/[#*_>\-[\]()!]/g, '')
    .trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter((w) => w.length > 0).length;
}

function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

function extractMetadataFromSource(source: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const titleMatch = source.match(/title:\s*['"]([^'"]+)['"]/);
  if (titleMatch) result.title = titleMatch[1];

  const summaryMatch = source.match(/summary:\s*['"]([^'"]+)['"]/);
  if (summaryMatch) result.summary = summaryMatch[1];

  const publishedAtMatch = source.match(/publishedAt:\s*['"]([^'"]*)['"]/);
  if (publishedAtMatch) result.publishedAt = publishedAtMatch[1];

  const authorMatch = source.match(/author:\s*['"]([^'"]+)['"]/);
  if (authorMatch) result.author = authorMatch[1];

  return result;
}

const files = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith('.mdx'))
  .sort((a, b) => a.localeCompare(b));

const slugs = files.map((f) => f.replace(/\.mdx$/, ''));

fs.mkdirSync(outDir, { recursive: true });

const out: string[] = [];
out.push(`import type { Metadata } from "@/types/metadata";`);
out.push(`import type { MDXContent } from "mdx/types";`);
out.push(``);
out.push(`export type MetadataWithDate = Metadata & { formattedDate: string; wordCount: number; readingTime: number };`);
out.push(`export type MDXModule = { metadata: Metadata; default: MDXContent };`);
out.push(`export const allSlugs = ${JSON.stringify(slugs)} as const;`);
out.push(`export type PostSlug = typeof allSlugs[number];`);
out.push(``);
out.push(`export const metaBySlug: Record<PostSlug, MetadataWithDate> = {`);

for (const slug of slugs) {
  const full = path.join(postsDir, `${slug}.mdx`);
  const mdx = fs.readFileSync(full, 'utf8');
  const m = mdx.match(/export\s+const\s+metadata\s*=\s*({[\s\S]*?})\s*;?/);
  if (!m) {
    const lineNum = mdx.substring(0, mdx.indexOf('export const metadata')).split('\n').length;
    throw new Error(`Missing metadata in ${slug}.mdx (line ~${lineNum})`);
  }

  const metadata = extractMetadataFromSource(m[1]);

  if (!metadata.title) {
    throw new Error(`Missing required field "title" in ${slug}.mdx`);
  }
  if (!metadata.author) {
    throw new Error(`Missing required field "author" in ${slug}.mdx`);
  }

  const publishedAt = (metadata.publishedAt as string) || '';
  const body = mdx.replace(/export\s+const\s+metadata\s*=\s*{[\s\S]*?}\s*;?/, '');
  const wordCount = countWords(body);
  const readingTime = calculateReadingTime(wordCount);

  const metaObj: Record<string, unknown> = {
    title: metadata.title,
    publishedAt,
    summary: metadata.summary || '',
    author: metadata.author,
    formattedDate: formatDate(publishedAt),
    wordCount,
    readingTime,
  };

  const lines = Object.entries(metaObj).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `  ${key}: ${JSON.stringify(value)},`;
    }
    if (typeof value === 'string') {
      const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `  ${key}: '${escaped}',`;
    }
    return `  ${key}: ${JSON.stringify(value)},`;
  });

  out.push(`  "${slug}": {\n${lines.join('\n')}\n  },`);
}

out.push(`};`);
out.push(``);
out.push(`export const loadersBySlug: Record<PostSlug, () => Promise<MDXModule>> = {`);
for (const slug of slugs) {
  out.push(`  "${slug}": () => import("../posts/${slug}.mdx") as Promise<MDXModule>,`);
}
out.push(`};`);
out.push(``);

fs.writeFileSync(outFile, out.join('\n'), 'utf8');
console.log(`Generated ${path.relative(process.cwd(), outFile)} (${slugs.length} posts)`);
