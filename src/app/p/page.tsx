import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getAllPosts } from "@/lib/mdx"

export default function ProjectsPage() {
  const posts = getAllPosts('p')

  return (
    <div className="container py-6 lg:py-12">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <div className="max-w-2xl space-y-4">
        {posts.map((post) => (
          <Card key={post}>
            <CardHeader>
              <CardTitle>
                <Link 
                  href={`/p/${post}`} 
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

