import { MetadataRoute } from 'next'
import { WEBSITE_URL } from '@/lib/constants'
import fs from 'fs'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrls = [
    {
      url: WEBSITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
  ]

  const postsDirectory = path.join(process.cwd(), '/contents/post')
  const postSlugs = fs.readdirSync(postsDirectory).filter((folder) => {
    const stats = fs.statSync(path.join(postsDirectory, folder))
    return (
      stats.isDirectory() && !folder.startsWith('_') && !folder.startsWith('.')
    )
  })

  const postUrls = postSlugs.map((slug) => {
    const filePath = path.join(postsDirectory, slug, 'page.mdx')
    const stats = fs.statSync(filePath)
    
    return {
      url: `${WEBSITE_URL}/post/${slug}`,
      lastModified: stats.mtime,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  return [...baseUrls, ...postUrls]
}