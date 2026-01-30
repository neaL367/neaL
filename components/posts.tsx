import { Link } from "@/components/link";
import { formatDate } from "@/app/writing/utils";
import type { PostSummary } from "@/types/post";
import type { Route } from "next";

type PostsProps = {
  posts: PostSummary[];
};

export async function Posts({ posts }: PostsProps) {
  return (
    <>
      {posts.map(async (post) => (
        <Link
          key={post.slug}
          href={`/writing/${post.slug}` as Route}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
            <p className="text-zinc-900 dark:text-zinc-100 tracking-tight">
              {post.metadata.title}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 tabular-nums">
              {await formatDate(post.metadata.publishedAt, false)}
            </p>
          </div>
        </Link>
      ))}
    </>
  );
}
