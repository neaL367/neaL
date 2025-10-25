import { getWritingPosts } from "@/app/writing/utils";
import { Posts } from "@/components/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Read my writing.",
};

export default async function WritingPage() {
  const posts = await getWritingPosts();

  return (
    <div>
      <div className="mb-16">
        <h1 className="text-2xl font-medium mb-6">Writing</h1>
        <p className="mb-6 text-zinc-700 dark:text-zinc-300">
          A collection of my essays and reflections on various topics.
        </p>
      </div>

      <Posts posts={posts} />
    </div>
  );
}
