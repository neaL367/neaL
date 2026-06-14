import 'server-only';

import { cache } from 'react';
import type { Post, PostSummary, ReadingInfo } from '@/types/post';
import {
  allSlugs,
  loadersBySlug,
  type PostSlug,
  type MDXModule,
  metaBySlug,
} from './generated/posts-manifest';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PostListItem = {
  slug: string;
  title: string;
  publishedAt: string;
  formattedDate: string;
  readingTime?: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidPost(slug: PostSlug): boolean {
  return metaBySlug[slug].publishedAt.trim() !== '';
}

function toReadingInfo(meta: { wordCount: number; readingTime: number }): ReadingInfo {
  return { wordCount: meta.wordCount, readingTime: meta.readingTime };
}

function sortByPublishedAt<T>(items: T[], getPublishedAt: (item: T) => string): T[] {
  return items.toSorted((a, b) => parseTime(getPublishedAt(b)) - parseTime(getPublishedAt(a)));
}

function parseTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const d = new Date(publishedAt.includes('T') ? publishedAt : `${publishedAt}T00:00:00`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const getPostListItems = cache(async function getPostListItems(): Promise<PostListItem[]> {
  const posts = allSlugs
    .filter(isValidPost)
    .map((slug) => ({
      slug,
      title: metaBySlug[slug].title,
      publishedAt: metaBySlug[slug].publishedAt,
      formattedDate: metaBySlug[slug].formattedDate,
      readingTime: metaBySlug[slug].readingTime,
    }));

  return sortByPublishedAt(posts, (p) => p.publishedAt);
});

export const getPublishedPosts = cache(async function getPublishedPosts(): Promise<PostSummary[]> {
  const posts = allSlugs
    .filter(isValidPost)
    .map((slug) => ({
      slug,
      metadata: metaBySlug[slug],
      readingInfo: toReadingInfo(metaBySlug[slug]),
    }));

  return sortByPublishedAt(posts, (p) => p.metadata.publishedAt);
});

export const searchPosts = cache(async function searchPosts(query: string): Promise<PostSummary[]> {
  const q = query.toLowerCase().trim();
  if (!q) return getPublishedPosts();

  const posts = allSlugs
    .filter((slug) => {
      if (!isValidPost(slug)) return false;
      const meta = metaBySlug[slug];
      return (
        meta.title.toLowerCase().includes(q) ||
        meta.summary.toLowerCase().includes(q)
      );
    })
    .map((slug) => ({
      slug,
      metadata: metaBySlug[slug],
      readingInfo: toReadingInfo(metaBySlug[slug]),
    }));

  return sortByPublishedAt(posts, (p) => p.metadata.publishedAt);
});

export const getPostBySlug = cache(async function getPostBySlug(
  slug: string,
): Promise<PostSummary | null> {
  const s = slug as PostSlug;
  if (!Object.prototype.hasOwnProperty.call(metaBySlug, s)) return null;
  if (!isValidPost(s)) return null;

  return {
    slug: s,
    metadata: metaBySlug[s],
    readingInfo: toReadingInfo(metaBySlug[s]),
  };
});

export const getPostContent = cache(async function getPostContent(slug: string): Promise<Post> {
  if (!Object.prototype.hasOwnProperty.call(loadersBySlug, slug)) {
    throw new Error(`Unknown post slug: ${slug}`);
  }

  const s = slug as PostSlug;
  const mod: MDXModule = await loadersBySlug[s]();

  return {
    slug: s,
    metadata: metaBySlug[s],
    content: mod.default,
    readingInfo: toReadingInfo(metaBySlug[s]),
  };
});

export const getReadingInfo = cache(async function getReadingInfo(
  slug: string,
): Promise<ReadingInfo | null> {
  const s = slug as PostSlug;
  if (!Object.prototype.hasOwnProperty.call(metaBySlug, s)) return null;
  return toReadingInfo(metaBySlug[s]);
});

// ─── Aliases (backward compat) ───────────────────────────────────────────────

export const getPostMetadata = getPostBySlug;
export const getWritingPost = getPostContent;
export const getWritingPostSummaries = getPublishedPosts;
export const getPostReadingTime = getReadingInfo;
