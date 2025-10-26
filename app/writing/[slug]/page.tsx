import { notFound } from "next/navigation";
import { formatDate, getWritingPosts } from "@/app/writing/utils";
import { baseUrl } from "@/app/sitemap";
import type { Metadata } from "next";
import { Link } from "@/components/link";

export async function generateStaticParams() {
  const posts = await getWritingPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const posts = await getWritingPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post || post.metadata.publishedAt.trim() == "") {
    notFound();
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
  } = post.metadata;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `/writing/${slug}`,
      images: [
        {
          url: `${baseUrl}/opengraph-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: `${baseUrl}/opengraph-image.jpg`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const posts = await getWritingPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post || post.metadata.publishedAt.trim() == "") {
    notFound();
  }

  const { metadata, content: Content } = post;

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: metadata.title,
            datePublished: metadata.publishedAt,
            dateModified: metadata.publishedAt,
            description: metadata.summary,
            url: `${baseUrl}/writing/${slug}`,
            author: {
              "@type": "Person",
              name: "Neal367",
            },
          }),
        }}
      />
      <div className="flex justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tighter">
            {metadata.title}
          </h1>
          <p className="mt-2 mb-8 text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(metadata.publishedAt)}
          </p>
        </div>
        <div>
          <Link href="/">{metadata.author}</Link>
        </div>
      </div>
      <article>
        <Content />
      </article>
    </section>
  );
}
