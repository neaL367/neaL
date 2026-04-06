"use client";

import React from "react";
import { Link } from "@/components/link";
import type { Route } from "next";

// Simplified type for what a post item needs
type PostDisplayData = {
  slug: string;
  title: string;
  formattedDate: string;
} | {
  slug: string;
  metadata: {
    title: string;
    formattedDate: string;
  }
};

const PostContext = React.createContext<PostDisplayData | null>(null);

function usePost() {
  const context = React.use(PostContext);
  if (!context) {
    throw new Error("Post subcomponents must be used within a Post.Item");
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
  className = "flex flex-col space-y-2.5 mb-4" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function PostItem({ 
  post, 
  children,
  className = "w-full flex flex-col md:flex-row space-x-0 md:space-x-2 [content-visibility:auto]"
}: { 
  post: PostDisplayData; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PostContext.Provider value={post}>
      <Link href={`/writing/${post.slug}` as Route}>
        <div className={className}>
          {children}
        </div>
      </Link>
    </PostContext.Provider>
  );
}

export function PostTitle({ className = "text-zinc-900 dark:text-zinc-100 tracking-tight" }: { className?: string }) {
  const post = usePost();
  return (
    <p
      className={className}
      style={{
        viewTransitionName: `post-title-${post.slug}`,
        viewTransitionClass: 'via-blur',
        width: 'fit-content'
      } as React.CSSProperties & { viewTransitionClass?: string }}
    >
      {post.title}
    </p>
  );
}

export function PostDate({ className = "text-zinc-500 dark:text-zinc-400 tabular-nums" }: { className?: string }) {
  const post = usePost();
  return (
    <p className={className}>
      {post.formattedDate}
    </p>
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
