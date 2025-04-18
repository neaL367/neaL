import type { Metadata } from 'next'
import { WEBSITE_URL } from '@/lib/constants'
import fs from 'fs'
import path from 'path'

async function getPostMetadata(slug: string) {
  const coverImagePath = `/post/${slug}/cover.png`

  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} - neaL367`,
    description: `Thoughts and insights about ${slug}`,
    coverImage: coverImagePath,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { title, description, coverImage } = await getPostMetadata(slug)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${WEBSITE_URL}/post/${slug}`,
      images: [
        {
          url: `${WEBSITE_URL}${coverImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${WEBSITE_URL}${coverImage}`],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { default: PostContent } = await import(
    `@/contents/post/${slug}/page.mdx`
  )

  return <PostContent />
}

export function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), '/contents/post')
  const postFolders = fs.readdirSync(postsDirectory).filter((folder) => {
    const stats = fs.statSync(path.join(postsDirectory, folder))
    return (
      stats.isDirectory() && !folder.startsWith('_') && !folder.startsWith('.')
    )
  })

  return postFolders.map((folder) => ({
    slug: folder,
  }))
}

export const dynamicParams = false
