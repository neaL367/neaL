import React, { Suspense } from "react";
import { Link } from "@/components/link";
import { PostList, PostItem, PostTitle, PostDate } from "@/components/posts";
import { baseUrl } from "@/app/sitemap";
import { getWritingPostSummaries } from "@/app/writing/utils";
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
        <div className="mb-4">
          <Link
            href="/"
            style={{ viewTransitionName: 'author-name', display: 'inline-block', width: 'fit-content' } as React.CSSProperties}
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Neal367
          </Link>
        </div>
        <h1
          className="font-semibold text-2xl tracking-tighter mb-6"
          style={{ viewTransitionName: 'writing-title', width: 'fit-content' } as React.CSSProperties}
        >
          Writing
        </h1>
        <p className="mb-6 text-zinc-700 dark:text-zinc-300">
          A collection of my essays and reflections on various topics.
        </p>
      </div>

      <Suspense fallback={<p className="text-zinc-500">Loading posts...</p>}>
        <PostCollection />
      </Suspense>
    </section>
  );
}

async function PostCollection() {
  const posts = await getWritingPostSummaries();
  const published = posts.filter((p) => p.metadata.publishedAt.trim() !== "");

  return (
    <PostList>
      {published.map((post) => (
        <PostItem key={post.slug} post={post}>
          <PostTitle />
          <PostDate />
        </PostItem>
      ))}
    </PostList>
  );
}
