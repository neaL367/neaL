import type { MetadataRoute } from "next";
import { getWritingPostSummaries } from "@/app/writing/utils";

export const baseUrl = "https://neal367.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getWritingPostSummaries();

  const writings: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const now = new Date();

  const routes: MetadataRoute.Sitemap = ["", "/writing"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  return [...routes, ...writings];
}
