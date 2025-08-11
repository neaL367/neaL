import { MetadataRoute } from "next";
import { getWritingPosts } from "./lib/posts";
import { metaData } from "./lib/config";

const BaseUrl = metaData.baseUrl.endsWith("/")
  ? metaData.baseUrl
  : `${metaData.baseUrl}/`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogs = getWritingPosts().map((post) => ({
    url: `${BaseUrl}writing/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "writing", "projects", "photos"].map((route) => ({
    url: `${BaseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
