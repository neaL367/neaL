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

const eagerModules = import.meta.glob('./posts/*.mdx', {
  eager: true,
}) as Record<string, MDXModule>;

const lazyLoaders = import.meta.glob('./posts/*.mdx') as Record<
  string,
  () => Promise<MDXModule>
>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date?: string): string {
  if (!date) return '';
  const targetDate = new Date(date.includes('T') ? date : `${date}T00:00:00`);
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const d = new Date(publishedAt.includes('T') ? publishedAt : `${publishedAt}T00:00:00`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
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

export async function getPostListItems(): Promise<PostListItem[]> {
  'use cache';
  cacheLife('days');
  cacheTag('posts');

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
