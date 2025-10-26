import { getWritingPosts } from "@/app/writing/utils";
import type { MetadataRoute } from "next";

export const baseUrl = "https://neal367.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getWritingPosts();

  const writings = posts.map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ["", "/writing"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...writings];
}
