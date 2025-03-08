"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { InstagramPost } from "@/types";
// import { formatDate } from "@/lib/utils";
import { Heart } from "lucide-react";

interface PhotoCardProps {
  post: InstagramPost;
  onClick: () => void;
}

export function PhotoCard({ post, onClick }: PhotoCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="group">
      <Card
        className="overflow-hidden mt-6 pt-0 py-0 border-0 h-max flex flex-col hover:shadow-md transition-shadow duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative aspect-square cursor-pointer border"
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View post: ${post.caption || "Instagram post"}`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          )}

          <Image
            src={post.mediaUrl || ""}
            alt={post.caption || "Instagram post"}
            fill
            className={`object-cover transition-all duration-300 
              ${isLoading ? "opacity-0" : "opacity-100"}
              ${isHovered ? "" : ""}`}
            loading="lazy"
            quality={60}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setIsLoading(false)}
            style={{
              viewTransitionName: `photo-${post.id}`,
            }}
          />

          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <div className="flex items-center gap-2 text-white">
              <Heart className="h-5 w-5 fill-white" />
              <span className="font-medium">{post.likeCount}</span>
            </div>
          </div>
        </div>
      </Card>
      {/* <div className="pt-2">
        <p className="text-xs text-zinc-500">{formatDate(post.timestamp)}</p>
      </div> */}
    </div>
  );
}
