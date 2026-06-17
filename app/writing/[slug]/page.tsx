import { Link } from '@/components/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getWritingPost, getWritingPostSummaries, getPostMetadata } from '@/app/writing/utils';
import { metaBySlug, type PostSlug } from '../generated/posts-manifest';
import { baseUrl } from '@/app/sitemap';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await getWritingPostSummaries();
  return posts.filter((p) => p.metadata.publishedAt?.trim()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<'/writing/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug) notFound();

  const post = await getPostMetadata(slug);

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
      type: 'article',
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
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/opengraph-image.jpg`],
    },
  };
}

export default async function Page(props: PageProps<'/writing/[slug]'>) {
  const { slug } = await props.params;
  if (!slug) notFound();

  const metadata = metaBySlug[slug as PostSlug];
  if (!metadata || !metadata.publishedAt?.trim()) notFound();

  const postPromise = getWritingPost(slug);
  const post = await postPromise;

  const { content: Content, readingInfo } = post;

  return (
    <section className="relative">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: metadata.title,
            datePublished: metadata.publishedAt,
            dateModified: metadata.publishedAt,
            description: metadata.summary,
            url: `${baseUrl}/writing/${slug}`,
            author: { '@type': 'Person', name: metadata.author ?? 'Neal367' },
          }),
        }}
      />
      <div className="mb-10">
        <div className="mb-5">
          <Link
            href="/writing"
            style={
              {
                viewTransitionName: 'writing-title',
                viewTransitionClass: 'via-blur',
                display: 'inline-block',
                width: 'fit-content',
              } as React.CSSProperties & { viewTransitionClass?: string }
            }
            className="text-sm font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Writing
          </Link>
        </div>
        <h1
          className="font-semibold text-4xl tracking-tighter text-zinc-900 dark:text-zinc-100"
          style={
            {
              viewTransitionName: `post-title-${slug}`,
              viewTransitionClass: 'via-blur',
              width: 'fit-content',
            } as React.CSSProperties & { viewTransitionClass?: string }
          }
        >
          {metadata.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <Image
            src="/avatar.png"
            alt="Neal367"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
          />
          <Link
            href="/"
            style={
              {
                viewTransitionName: 'author-name',
                viewTransitionClass: 'via-blur',
                display: 'inline-block',
                width: 'fit-content',
              } as React.CSSProperties & { viewTransitionClass?: string }
            }
            className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {metadata.author}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span suppressHydrationWarning>{metadata.formattedDate}</span>
          {readingInfo && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span>{readingInfo.readingTime} min read</span>
            </>
          )}
        </div>
      </div>
      <article>
        <Content />
      </article>
    </section>
  );
}
