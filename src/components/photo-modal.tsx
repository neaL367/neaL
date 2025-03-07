"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InstagramPost } from "@/types";

interface PhotoModalProps {
  post: InstagramPost;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function formatDate(date: Date): string {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PhotoModal({
  post,
  onClose,
  onNext,
  onPrevious,
}: PhotoModalProps) {
  const [dominantColor, setDominantColor] = useState<string>("rgba(0,0,0,0.7)");
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, onNext, onPrevious]);

  // Extract dominant color from image
  useEffect(() => {
    if (!post.mediaUrl) return;

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = post.mediaUrl;

    img.onload = () => {
      try {
        // Update image dimensions
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        // Create canvas to analyze image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw image on canvas
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple algorithm to get average color
        let r = 0,
          g = 0,
          b = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        setDominantColor(`rgba(${r}, ${g}, ${b}, 0.85)`);
      } catch (error) {
        console.error("Error extracting image color:", error);
      }
    };
  }, [post.mediaUrl]);

  // Calculate modal width based on image dimensions
  const getModalWidth = () => {
    if (imageDimensions.width === 0)
      return "max-w-full sm:max-w-lg md:max-w-2xl";

    // For landscape images
    if (imageDimensions.width > imageDimensions.height) {
      return "max-w-full sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw]";
    }

    // For portrait or square images
    return "max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl";
  };

  const formatLikeCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 bg-zinc-100 hover:bg-zinc-200 z-10 p-5 rounded-full hover:cursor-pointer"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <div
        className={`w-full ${getModalWidth()} rounded-lg overflow-hidden flex flex-col max-h-max border`}
        style={{ backgroundColor: dominantColor }}
      >
        <div className="relative aspect-square backdrop-blur-md">
          <Image
            src={post.mediaUrl || ""}
            alt="Post image"
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={95}
            className="object-contain"
          />
        </div>
        <div className="p-4 flex justify-between items-center bg-white">
          <div>
            <p className="text-sm font-medium">{formatDate(post.timestamp)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(post.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              <span>{formatLikeCount(post.likeCount)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{post.caption}</p>
          </div>
        </div>
      </div>
      <div className="my-6 flex gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="bg-zinc-100 hover:bg-zinc-200 z-10 p-5 rounded-full hover:cursor-pointer"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="bg-zinc-100 hover:bg-zinc-200 z-10 p-5 rounded-full hover:cursor-pointer"
          onClick={onNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
