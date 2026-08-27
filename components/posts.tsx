'use client';

import React from 'react';
import { Link } from '@/components/link';

// Simplified type for what a post item needs
type PostDisplayData =
  | {
      slug: string;
      title: string;
      formattedDate: string;
    }
  | {
      slug: string;
      metadata: {
        title: string;
        formattedDate: string;
      };
    };

const PostContext = React.createContext<PostDisplayData | null>(null);

function usePost() {
  const context = React.use(PostContext);
  if (!context) {
    throw new Error('Post subcomponents must be used within a Post.Item');
  }

  // Normalize the data
  if ('metadata' in context) {
    return {
      slug: context.slug,
      title: context.metadata.title,
      formattedDate: context.metadata.formattedDate,
    };
  }

  return context;
}

export function PostList({
  children,
  className = 'flex flex-col mb-6',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function PostItem({
  post,
  children,
  className = 'w-full flex items-baseline justify-between py-1 group [content-visibility:auto]',
}: {
  post: PostDisplayData;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PostContext.Provider value={post}>
      <Link
        href={`/writing/${post.slug}`}
        data-testid="writing-post-link"
        className="post-link block w-full"
      >
        <div className={className}>{children}</div>
      </Link>
    </PostContext.Provider>
  );
}

export function PostTitle({
  className = 'text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 font-medium tracking-tight transition-colors leading-snug',
}: {
  className?: string;
}) {
  const post = usePost();
  return (
    <span
      className={className}
      style={
        {
          viewTransitionName: `post-title-${post.slug}`,
          width: 'fit-content',
        } as React.CSSProperties
      }
    >
      {post.title}
    </span>
  );
}

export function PostDate({
  className = 'text-xs text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0 ml-4 font-normal leading-snug',
}: {
  className?: string;
}) {
  const post = usePost();
  return (
    <span className={className} suppressHydrationWarning>
      {post.formattedDate}
    </span>
  );
}

/**
 * Providing a default implementation while keeping compound components available
 */
export function Posts({ posts }: { posts: PostDisplayData[] }) {
  return (
    <PostList>
      {posts.map((post) => (
        <PostItem key={post.slug} post={post}>
          <PostTitle />
          <PostDate />
        </PostItem>
      ))}
    </PostList>
  );
}

export const Post = {
  List: PostList,
  Item: PostItem,
  Title: PostTitle,
  Date: PostDate,
};
