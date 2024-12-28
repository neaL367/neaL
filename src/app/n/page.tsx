import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getAllPosts } from "@/lib/mdx"

export default function NotesPage() {
  const posts = getAllPosts('n')

  return (
    <div className="container py-6 lg:py-12">
      <h1 className="text-3xl font-bold mb-6">Notes</h1>
      <div className="max-w-2xl space-y-4">
        {posts.map((post) => (
          <Card key={post}>
            <CardHeader>
              <CardTitle>
                <Link 
                  href={`/n/${post}`} 
                  className="hover:underline"
                >
                  {post.replace(/-/g, ' ')}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Read full post
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

