import Link from 'next/link'
import { getContentList } from '@/lib/content'

export default async function BlogPage() {
  const posts = getContentList('blog')

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <ul className="space-y-4">
        {(await posts).map((post) => (
          <li key={post.slug}>
            <Link href={`/b/${post.slug}`} className="text-blue-600 hover:underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

