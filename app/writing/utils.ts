import "server-only";

import { cacheLife } from "next/cache";

import type { Post } from "@/types/post";

import {
  allSlugs,
  metaBySlug,
  loadersBySlug,
  type PostSlug,
  type MDXModule,
} from "./generated/posts-manifest";

export async function getWritingPostSummaries(): Promise<
  Array<Pick<Post, "slug" | "metadata">>
> {
  const posts = allSlugs.map((slug) => ({
    slug,
    metadata: metaBySlug[slug],
  }));

  posts.sort((a, b) => toTime(b.metadata.publishedAt) - toTime(a.metadata.publishedAt));

  return posts;
}

export async function getWritingPost(slug: string): Promise<Post> {
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
}

export async function getWritingPosts(): Promise<Post[]> {
  const posts = await Promise.all(allSlugs.map((s) => getWritingPost(s)));
  return posts;
}

export async function formatDate(
  date: string,
  includeRelative = false,
): Promise<string> {
  "use cache";
  cacheLife("max");

  const currentDate = new Date();
  const targetDate = new Date(date.includes("T") ? date : `${date}T00:00:00`);

  const diffMs = currentDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  let relative = "Today";
  if (diffYears > 0) relative = `${diffYears}y ago`;
  else if (diffMonths > 0) relative = `${diffMonths}mo ago`;
  else if (diffDays > 0) relative = `${diffDays}d ago`;

  const fullDate = targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return includeRelative ? `${fullDate} (${relative})` : fullDate;
}

export function toTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const d = new Date(publishedAt.includes("T") ? publishedAt : `${publishedAt}T00:00:00`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}
