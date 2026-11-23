import 'server-only';

import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import type { Post, PostSummary, ReadingInfo } from '@/types/post';
import type { Metadata, PostFrontmatter } from '@/types/metadata';
import type { MDXContent } from 'mdx/types';

export type MDXModule = {
  metadata: PostFrontmatter;
  default: MDXContent;
};

// ─── Turbopack Glob Imports ──────────────────────────────────────────────────
//
// `import.meta.glob` is Turbopack's Vite-compatible module collector. The
// `eager` overload returns modules directly and the lazy overload returns
// thunks, and both are generic over the module shape — so the calls below are
// typed by `MDXModule` rather than cast with `as`.

/** Frontmatter and body of every post, imported at build time. */
const eagerModules = import.meta.glob<MDXModule>('./posts/*.mdx', { eager: true });

/** The same set as lazy thunks, so a post body is only loaded when rendered. */
const lazyLoaders = import.meta.glob<MDXModule>('./posts/*.mdx');

/**
 * Read a date-only string as UTC.
 *
 * A bare `2026-04-24` fed to `new Date` is parsed as UTC midnight, but
 * `2026-04-24T00:00:00` (no offset) is parsed as *local* midnight. Appending
 * the offset explicitly keeps the value independent of the build machine's
 * timezone, which is what the RSS feed and sitemap need.
 */
function parseDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date?: string): string {
  if (!date) return '';
  return parseDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function parseTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const time = parseDate(publishedAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function extractSlug(filePath: string): string {
  return filePath.replace(/^\.\/posts\//, '').replace(/\.mdx$/, '');
}

function getPostEntries(): Array<{ slug: string; metadata: Metadata; rawPath: string }> {
  return Object.entries(eagerModules)
    .map(([rawPath, mod]) => {
      const slug = extractSlug(rawPath);
      const frontmatter = mod.metadata;
      const metadata: Metadata = {
        title: frontmatter?.title ?? '',
        summary: frontmatter?.summary ?? '',
        publishedAt: frontmatter?.publishedAt ?? '',
        author: frontmatter?.author ?? 'Neal367',
        formattedDate: formatDate(frontmatter?.publishedAt),
      };
      return { slug, metadata, rawPath };
    })
    .filter((entry) => Boolean(entry.metadata.publishedAt?.trim()));
}

function sortByPublishedAt<T>(items: T[], getPublishedAt: (item: T) => string): T[] {
  return items.toSorted((a, b) => parseTime(getPublishedAt(b)) - parseTime(getPublishedAt(a)));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type PostListItem = {
  slug: string;
  title: string;
  publishedAt: string;
  formattedDate: string;
  readingTime?: number;
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Rendered synchronously so the list lands in the same commit as the page.
 * That keeps the shared `post-title-*` names available to the navigation's
 * view transition snapshot.
 */
export function getPostListItems(): PostListItem[] {
  const posts = getPostEntries().map(({ slug, metadata }) => ({
    slug,
    title: metadata.title,
    publishedAt: metadata.publishedAt,
    formattedDate: metadata.formattedDate,
  }));

  return sortByPublishedAt(posts, (p) => p.publishedAt);
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  'use cache';
  cacheLife('days');
  cacheTag('posts');

  const posts = getPostEntries().map(({ slug, metadata }) => ({
    slug,
    metadata,
  }));

  return sortByPublishedAt(posts, (p) => p.metadata.publishedAt);
}

export async function searchPosts(query: string): Promise<PostSummary[]> {
  'use cache';
  cacheLife('days');
  cacheTag('posts');

  const q = query.toLowerCase().trim();
  if (!q) return getPublishedPosts();

  const posts = getPostEntries()
    .filter(({ metadata }) => {
      return (
        metadata.title.toLowerCase().includes(q) ||
        metadata.summary.toLowerCase().includes(q)
      );
    })
    .map(({ slug, metadata }) => ({
      slug,
      metadata,
    }));

  return sortByPublishedAt(posts, (p) => p.metadata.publishedAt);
}

export async function getPostBySlug(slug: string): Promise<PostSummary | null> {
  'use cache';
  cacheLife('days');
  cacheTag('posts', `post-${slug}`);

  const entry = getPostEntries().find((e) => e.slug === slug);
  if (!entry) return null;

  return {
    slug: entry.slug,
    metadata: entry.metadata,
  };
}

export const getPostContent = cache(async function getPostContent(slug: string): Promise<Post> {
  const targetPath = `./posts/${slug}.mdx`;
  const loader = lazyLoaders[targetPath];

  if (!loader) {
    throw new Error(`Unknown post slug: ${slug}`);
  }

  const mod = await loader();
  const frontmatter = mod.metadata;
  const metadata: Metadata = {
    title: frontmatter?.title ?? '',
    summary: frontmatter?.summary ?? '',
    publishedAt: frontmatter?.publishedAt ?? '',
    author: frontmatter?.author ?? 'Neal367',
    formattedDate: formatDate(frontmatter?.publishedAt),
  };

  return {
    slug,
    metadata,
    content: mod.default,
  };
});

export const getReadingInfo = cache(async function getReadingInfo(): Promise<ReadingInfo | null> {
  return null;
});

// ─── Aliases (backward compat) ───────────────────────────────────────────────

export const getPostMetadata = getPostBySlug;
export const getWritingPost = getPostContent;
export const getWritingPostSummaries = getPublishedPosts;
export const getPostReadingTime = getReadingInfo;
