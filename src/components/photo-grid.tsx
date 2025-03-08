"use client";

import type { InstagramPost } from "@/types";
import { PhotoCard } from "./photo-card";
import { useTransitionRouter } from "next-view-transitions";

interface PhotoGridProps {
  posts: InstagramPost[];
  columns?: number;
}

export function PhotoGrid({ posts, columns = 3 }: PhotoGridProps) {
  const router = useTransitionRouter();

  const handleNavigateToPost = (postId: string) => {
    router.push(`/ph/${postId}`);
  };

  const getGridColumns = () => {
    if (columns) {
      return `grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(
        columns,
        3
      )} lg:grid-cols-${columns}`;
    }
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  return (
    <div>
      <div
        className={`grid gap-4 ${getGridColumns()}`}
        role="grid"
        aria-label="Photo gallery"
      >
        {posts.map((post) => (
          <div key={post.id} role="gridcell">
            <PhotoCard
              post={post}
              onClick={() => handleNavigateToPost(post.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
