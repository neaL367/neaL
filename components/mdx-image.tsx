'use client';

import React, { useState, useMemo } from 'react';

export interface ImageItem {
  src: string;
  alt?: string;
  caption?: string;
  label?: string;
  title?: string;
  tag?: string;
  badge?: string;
}

export interface MDXImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | string[];
  images?: (ImageItem | string)[];
  caption?: string;
  size?: 'portrait' | 'cover' | 'sm' | 'md' | 'wide' | 'full';
  variant?: 'default' | 'card' | 'poster' | 'window' | 'browser' | 'cinematic' | 'album';
  tag?: string;
  title?: string;
  badge?: string;
}

export function MDXImage({
  src,
  images,
  alt = '',
  caption: mainCaption,
  className = '',
  size = 'portrait',
  variant = 'default',
  tag,
  title,
  badge,
  ...props
}: MDXImageProps) {
  // Normalize images list
  const normalizedImages: ImageItem[] = useMemo(() => {
    if (images && images.length > 0) {
      return images.map((img, i) => {
        if (typeof img === 'string') {
          return { src: img, alt: `${alt} (${i + 1})` };
        }
        return img;
      });
    }
    if (Array.isArray(src)) {
      return src.map((s, i) => ({ src: s, alt: `${alt} (${i + 1})` }));
    }
    if (src) {
      return [{ src, alt, caption: mainCaption, title, tag, badge }];
    }
    return [];
  }, [images, src, alt, mainCaption, title, tag, badge]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const total = normalizedImages.length;
  const isMulti = total > 1;

  const currentItem = normalizedImages[currentIndex] || { src: '', alt: '' };
  const activeSrc = currentItem.src;
  const activeAlt = currentItem.alt ?? alt;
  const activeCaption = currentItem.caption ?? mainCaption;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  // Clean, proportional sizing
  let sizeClass = 'w-full';
  if (size === 'sm') {
    sizeClass = 'max-w-[280px]';
  } else if (size === 'portrait' || size === 'cover') {
    sizeClass = 'max-w-[380px]';
  } else if (size === 'md') {
    sizeClass = 'max-w-[500px]';
  } else if (size === 'wide' || size === 'full') {
    sizeClass = 'w-full';
  }

  const isWindow = variant === 'window' || variant === 'browser';

  return (
    <figure className="mdx-image my-8 flex flex-col items-center">
      <div
        className={`relative w-full ${sizeClass} overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-900/40 transition-all`}
      >
        {/* Optional Subtle Window Header (Only for explicit window/browser variant) */}
        {isWindow && (
          <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800/70 px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 select-none">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            {(currentItem.label || currentItem.title || title) && (
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
                {currentItem.label || currentItem.title || title}
              </span>
            )}
            <div className="w-8" />
          </div>
        )}

        {/* Multi-Image Minimal Translucent Floating Badge */}
        {isMulti && (
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/60 dark:bg-black/75 text-white backdrop-blur-md px-2 py-0.5 text-[11px] font-mono shadow-sm select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="p-0.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13L5 8L10 3" />
              </svg>
            </button>
            <span className="tabular-nums px-1 text-white/90">
              {currentIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="p-0.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3L11 8L6 13" />
              </svg>
            </button>
          </div>
        )}

        {/* Image Container */}
        <div
          onClick={isMulti ? handleNext : undefined}
          className={`relative overflow-hidden ${isMulti ? 'cursor-pointer select-none' : ''}`}
          title={isMulti ? 'Click to view next image' : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSrc}
            alt={activeAlt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`w-full h-auto block object-cover ${className}`}
            {...props}
          />
        </div>
      </div>

      {/* Clean, Minimal Caption */}
      {activeCaption && (
        <figcaption className="mdx-image-caption mt-2.5 text-center text-xs text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed font-sans">
          {activeCaption}
        </figcaption>
      )}
    </figure>
  );
}

export function MDXImageGrid({
  children,
  cols = 2,
  className = '',
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
}) {
  const colClass = cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
  return (
    <div className={`my-8 grid gap-4 items-start ${colClass} ${className}`}>
      {children}
    </div>
  );
}

