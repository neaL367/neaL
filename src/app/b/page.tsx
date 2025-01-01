import { Link } from "next-view-transitions";
import { getContentList } from "@/lib/content";

export default async function BlogPage() {
  const posts = await getContentList("blog");

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">blog</h1>
      <ul className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/b/${post.slug}`}
                className="text-blue-600 duration-500"
              >
                {post.title}
              </Link>
            </li>
          ))
        ) : (
          <p>Stay turned.</p>
        )}
      </ul>
    </div>
  );
}
