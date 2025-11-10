import { Link } from "@/components/link";
import { formatDate } from "@/app/writing/utils";
import type { Post } from "@/types/post";
import type { Route } from "next";

type PostsProps = {
  posts: Post[];
};

export function Posts({ posts }: PostsProps) {
  const visiblePosts = posts
    .filter((post) => post.metadata.publishedAt.trim() !== "")
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    });

  return (
    <div>
      {visiblePosts.map((post) => (
        <Link
          key={post.slug}
          href={`/writing/${post.slug}` as Route}
          className="flex flex-col space-y-1 mb-4 transition duration-300 ease-in-out"
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
            <p className=" text-zinc-500 dark:text-zinc-400 tabular-nums">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-zinc-900 dark:text-zinc-100 tracking-tight">
              {post.metadata.title}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
