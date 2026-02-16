import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { getWritingPost, getWritingPostSummaries } from "@/app/writing/utils";
import { metaBySlug, type PostSlug } from "../generated/posts-manifest";
import { baseUrl } from "@/app/sitemap";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = await getWritingPostSummaries();
  return posts
    .filter((p) => p.metadata.publishedAt?.trim())
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/writing/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug) notFound();

  const posts = await getWritingPostSummaries();
  const post = posts.find((p) => p.slug === slug);

  if (!post || !post.metadata.publishedAt?.trim()) notFound();

  const { title, publishedAt: publishedTime, summary: description } = post.metadata;

  const canonical = `${baseUrl}/writing/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: canonical,
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
      images: [`${baseUrl}/opengraph-image.jpg`],
    },
  };
}


export default async function Page(props: PageProps<"/writing/[slug]">) {
  const { slug } = await props.params;
  if (!slug) notFound();

  const metadata = metaBySlug[slug as PostSlug];
  if (!metadata || !metadata.publishedAt?.trim()) notFound();

  const postPromise = getWritingPost(slug);
  const post = await postPromise;

  const { content: Content } = post;

  return (
    <section className="relative">
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
            author: { "@type": "Person", name: metadata.author ?? "Neal367" },
          }),
        }}
      />
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/writing"
            style={{ viewTransitionName: 'writing-title', viewTransitionClass: 'via-blur', display: 'inline-block', width: 'fit-content' } as React.CSSProperties & { viewTransitionClass?: string }}
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Writing
          </Link>
        </div>
        <h1
          className="font-semibold text-2xl tracking-tighter"
          style={{ viewTransitionName: `post-title-${slug}`, viewTransitionClass: 'via-blur', width: 'fit-content' } as React.CSSProperties & { viewTransitionClass?: string }}
        >
          {metadata.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {metadata.formattedDate} • <Link href="/" style={{ viewTransitionName: 'author-name', viewTransitionClass: 'via-blur', display: 'inline-block', width: 'fit-content' } as React.CSSProperties & { viewTransitionClass?: string }}>{metadata.author}</Link>
        </p>
      </div>
      <article>
        <Content />
      </article>
    </section>
  );
}

