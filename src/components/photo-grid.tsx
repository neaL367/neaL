"use client";

import type { InstagramPost, SortOption } from "@/types";
import { PhotoCard } from "./photo-card";
import { useTransitionRouter } from "next-view-transitions";
import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";

// Lazy load the sorting controls to reduce initial JS bundle
const SortControls = lazy(() => import("./sort-controls"));

interface PhotoGridProps {
  posts: InstagramPost[];
  columns?: number;
  initialLoading?: boolean;
  initialSortBy?: SortOption;
}

export function PhotoGrid({
  posts,
  columns = 3,
  initialSortBy = "newest",
}: PhotoGridProps) {
  const router = useTransitionRouter();
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [filteredPosts, setFilteredPosts] = useState<InstagramPost[]>(posts);
  const [showSortControls, setShowSortControls] = useState(false);

  const handleNavigateToPost = (postId: string) => {
    router.push(`/ph/${postId}`, { scroll: false });
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

  useEffect(() => {
    // Apply sorting based on the selected option
    const sortedPosts = [...posts];

    switch (sortBy) {
      case "newest":
        sortedPosts.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        break;
      case "oldest":
        sortedPosts.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        break;
      case "most-likes":
        sortedPosts.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case "least-likes":
        sortedPosts.sort((a, b) => a.likeCount - b.likeCount);
        break;
      default:
        break;
    }

    setFilteredPosts(sortedPosts);
  }, [sortBy, posts]);

  if (posts.length === 0) {
    return (
      <div className="mt-8 text-center p-8 border rounded-md bg-muted/50">
        <p className="text-muted-foreground">
          No photos available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-start mt-6 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSortControls(!showSortControls)}
          className="hover:cursor-pointer"
        >
          {showSortControls ? "Hide Filters" : "Sort & Filter"}
        </Button>
      </div>

      {showSortControls ? (
        <Suspense
          fallback={
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-md mb-4"></div>
          }
        >
          <SortControls sortBy={sortBy} setSortBy={setSortBy} />
        </Suspense>
      ) : null}

      <div
        className={`grid gap-2.5 ${getGridColumns()}`}
        aria-label="Photo gallery"
      >
        {filteredPosts.map((post) => (
          <div key={post.id}>
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
