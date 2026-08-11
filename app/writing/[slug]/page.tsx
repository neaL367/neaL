import { Suspense } from 'react';
import type { CSSProperties } from 'react';
import { Link } from '@/components/link';
import { getWritingPostSummaries, getPostMetadata } from '@/app/writing/utils';
import { baseUrl } from '@/app/sitemap';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PostArticle, PostArticleSkeleton } from './post-article';

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

export default function Page({ params }: PageProps<'/writing/[slug]'>) {
  return (
    <section className="relative">
      <div className="mb-5">
        <Link
          href="/writing"
          data-testid="writing-post-shell-marker"
          style={
            {
              viewTransitionName: 'writing-title',
              display: 'inline-block',
              width: 'fit-content',
            } as CSSProperties
          }
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Writing
        </Link>
      </div>
      <Suspense fallback={<PostArticleSkeleton />}>
        {params.then(({ slug }) => <PostArticle slug={slug} />)}
      </Suspense>
    </section>
  );
}
