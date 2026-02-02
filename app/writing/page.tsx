import { getWritingPostSummaries } from "@/app/writing/utils";
import { Suspense } from "react";
import { baseUrl } from "@/app/sitemap";
import { Posts } from "@/components/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Read my writing.",
  openGraph: {
    title: "Writing | Neal367",
    description: "A collection of my essays and reflections on various topics.",
    url: `${baseUrl}/writing`,
    siteName: "Neal367",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/opengraph-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Neal367 Writing Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing | Neal367",
    description: "A collection of my essays and reflections on various topics.",
    creator: "@NL367",
    images: [`${baseUrl}/opengraph-image.jpg`],
  },
};

export default function WritingPage() {
  return (
    <section>
      <div className="mb-16">
        <h1 className="font-semibold text-2xl tracking-tighter mb-6">Writing</h1>
        <p className="mb-6 text-zinc-700 dark:text-zinc-300">
          A collection of my essays and reflections on various topics.
        </p>
      </div>

      <Suspense fallback={<p className="text-zinc-500">Loading posts...</p>}>
        <PostList />
      </Suspense>
    </section>
  );
}

async function PostList() {
  const posts = await getWritingPostSummaries();
  const published = posts.filter((p) => p.metadata.publishedAt.trim() !== "");

  return (
    <article className="flex flex-col space-y-2.5 mb-4">
      <Posts posts={published} />
    </article>
  );
}
