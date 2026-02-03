import "server-only";

import { cache } from "react";
import type { Post } from "@/types/post";

import {
  allSlugs,
  loadersBySlug,
  type PostSlug,
  type MDXModule,
  metaBySlug,
} from "./generated/posts-manifest";

export const getWritingPostSummaries = cache(async function getWritingPostSummaries(): Promise<
  Array<Pick<Post, "slug" | "metadata">>
> {
  const posts = allSlugs.map((slug) => ({
    slug,
    metadata: metaBySlug[slug],
  }));

  return posts.toSorted((a, b) => toTime(b.metadata.publishedAt) - toTime(a.metadata.publishedAt));
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
