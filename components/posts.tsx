"use client"

import React from "react";
import { Link } from "@/components/link";
import type { PostSummary } from "@/types/post";
import type { Route } from "next";


const PostContext = React.createContext<PostSummary | null>(null);

function usePost() {
  const context = React.use(PostContext);
  if (!context) {
    throw new Error("Post subcomponents must be used within a Post.Item");
  }
  return context;
}

export function PostList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-2.5 mb-4">
      {children}
    </div>
  );
}

export function PostItem({ post, children }: { post: PostSummary; children: React.ReactNode }) {
  return (
    <PostContext.Provider value={post}>
      <Link href={`/writing/${post.slug}` as Route}>
        <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2 [content-visibility:auto]">
          {children}
        </div>
      </Link>
    </PostContext.Provider>
  );
}

export function PostTitle() {
  const post = usePost();
  return (
    <p
      className="text-zinc-900 dark:text-zinc-100 tracking-tight"
      style={{
        viewTransitionName: `post-title-${post.slug}`,
        viewTransitionClass: 'via-blur',
        width: 'fit-content'
      } as React.CSSProperties & { viewTransitionClass?: string }}
    >
      {post.metadata.title}
    </p>
  );
}

export function PostDate() {
  const post = usePost();
  return (
    <p className="text-zinc-500 dark:text-zinc-400 tabular-nums lowercase">
      {post.metadata.formattedDate}
    </p>
  );
}

// Legacy support for the old API to avoid breaking changes immediately if needed,
export function Posts({ posts }: { posts: PostSummary[] }) {
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
