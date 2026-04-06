import "server-only";

import { cache } from "react";
import type { Post, PostSummary } from "@/types/post";

import {
  allSlugs,
  loadersBySlug,
  type PostSlug,
  type MDXModule,
  metaBySlug,
} from "./generated/posts-manifest";

/**
 * server-serialization
 * Minimize data passed to client components by returning only necessary fields.
 */
export type PostListItem = {
  slug: string;
  title: string;
  publishedAt: string;
  formattedDate: string;
};

export const getPostListItems = cache(async function getPostListItems(): Promise<PostListItem[]> {
  const posts = allSlugs
    .map((slug) => ({
      slug,
      title: metaBySlug[slug].title,
      publishedAt: metaBySlug[slug].publishedAt,
      formattedDate: metaBySlug[slug].formattedDate,
    }))
    .filter((p) => p.publishedAt.trim() !== "");

  return posts.toSorted((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));
});

export const getWritingPostSummaries = cache(async function getWritingPostSummaries(): Promise<
  PostSummary[]
> {
  const posts = allSlugs.map((slug) => ({
    slug,
    metadata: metaBySlug[slug],
  }));

  return posts.toSorted((a, b) => toTime(b.metadata.publishedAt) - toTime(a.metadata.publishedAt));
});

export const getPostMetadata = cache(async function getPostMetadata(slug: string): Promise<PostSummary | null> {
  const s = slug as PostSlug;
  if (!Object.prototype.hasOwnProperty.call(metaBySlug, s)) {
    return null;
  }

  return {
    slug: s,
    metadata: metaBySlug[s],
  };
});

export const getWritingPost = cache(async function getWritingPost(slug: string): Promise<Post> {
  if (!Object.prototype.hasOwnProperty.call(loadersBySlug, slug)) {
    throw new Error(`Unknown post slug: ${slug}`);
  }

  const s = slug as PostSlug;
  const mod: MDXModule = await loadersBySlug[s]();

  return {
    slug: s,
    metadata: metaBySlug[s],
    content: mod.default,
  };
});

export function toTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const d = new Date(publishedAt.includes("T") ? publishedAt : `${publishedAt}T00:00:00`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}
