import type { CSSProperties } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Link } from '@/components/link';
import { getWritingPost } from '@/app/writing/utils';
import { metaBySlug, type PostSlug } from '../generated/posts-manifest';
import { baseUrl } from '@/app/sitemap';

export async function PostArticle({ slug }: { slug: string }) {
  const metadata = metaBySlug[slug as PostSlug];
  if (!metadata || !metadata.publishedAt?.trim()) notFound();

  const { content: Content, readingInfo } = await getWritingPost(slug);

  return (
    <>
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
        <h1
          className="text-4xl leading-tight font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
          style={
            {
              viewTransitionName: `post-title-${slug}`,
              width: 'fit-content',
            } as CSSProperties
          }
        >
          {metadata.title}
        </h1>
        <div className="mt-6 flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <Image src="/avatar.png" alt="Neal367" width={24} height={24} className="object-cover" />
          <Link
            href="/"
            style={
              {
                viewTransitionName: 'author-name',
                display: 'inline-block',
                width: 'fit-content',
              } as CSSProperties
            }
            className="font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
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
      <article data-testid="writing-post-content">
        <div className="typeset typeset-docs max-w-[37em]">
          <Content />
        </div>
      </article>
    </>
  );
}

export function PostArticleSkeleton() {
  return (
    <section className="relative" aria-busy="true" aria-label="Loading article">
      <div className="mb-10">
        <div className="h-12 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="space-y-4" aria-hidden="true">
        <div className="h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-5 w-11/12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </section>
  );
}
