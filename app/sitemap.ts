import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/app/writing/utils';

export const baseUrl = 'https://neal367.site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const writings: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const now = new Date();

  const routes: MetadataRoute.Sitemap = ['', '/writing'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 1,
  }));

  return [...routes, ...writings];
}
