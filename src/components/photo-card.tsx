"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { InstagramPost } from "@/types";
import { formatDate } from "@/lib/utils";
import { Heart, Calendar } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface PhotoCardProps {
  post: InstagramPost;
  onClick: () => void;
  priority?: boolean;
}

export function PhotoCard({ post, onClick, priority = false }: PhotoCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(cardRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="group" ref={cardRef}>
      <Card
        className="overflow-hidden pt-0 py-0 border-0 h-max flex flex-col hover:shadow-md transition-all duration-300 rounded-sm"
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
              <Skeleton className="h-full w-full absolute" />
            </div>
          )}

          {(isInView || priority) && (
            <Image
              src={post.mediaUrl || ""}
              alt={post.caption || "Instagram post"}
              fill
              className={`object-cover transition-all duration-300 
                ${isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"}
                ${isHovered ? "scale-105" : "scale-100"}`}
              priority={priority}
              quality={60}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setIsLoading(false)}
              style={{
                viewTransitionName: `photo-${post.id}`,
              }}
            />
          )}

          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 fill-white" />
                <span className="font-medium">{post.likeCount}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}