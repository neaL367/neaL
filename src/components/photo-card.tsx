"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { InstagramPost } from "@/types";

interface PhotoCardProps {
  post: InstagramPost;
  onClick: () => void;
}

function formatDate(date: Date): string {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

export function PhotoCard({ post, onClick }: PhotoCardProps) {
  return (
    <div className="">
      <Card className="overflow-hidden mt-6 pt-0 py-0 border-0 h-max flex flex-col hover:shadow-md transition-shadow duration-200">
        <div
          className="relative aspect-square cursor-pointer border"
          onClick={onClick}
        >
          <Image
            src={post.mediaUrl || ""}
            alt={post.caption}
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all"
            loading="lazy"
            quality={50}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Card>
      <div className="pt-2">
        <p className="text-xs text-zinc-500">{formatDate(post.timestamp)}</p>
      </div>
    </div>
  );
}
