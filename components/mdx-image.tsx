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
  const activeTag = currentItem.tag ?? tag;
  const activeTitle = currentItem.title ?? title;
  const activeBadge = currentItem.badge ?? badge;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  // Sizing consistent with blog prose
  let sizeClass = 'max-w-[280px] sm:max-w-[320px]';
  if (size === 'wide' || size === 'full') {
    sizeClass = 'w-full max-w-full';
  } else if (size === 'md') {
    sizeClass = 'max-w-md';
  } else if (size === 'sm') {
    sizeClass = 'max-w-[220px]';
  } else if (size === 'portrait' || size === 'cover') {
    sizeClass = 'max-w-[280px] sm:max-w-[320px]';
  }

  // Consistent site header bar matching code-block-header
  const hasHeader = variant === 'window' || variant === 'browser' || variant === 'album' || activeTag || activeTitle || activeBadge || isMulti;

  return (
    <figure className="mdx-image my-8 flex flex-col items-center">
      <div
        className={`w-fit max-w-full ${sizeClass} overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-200`}
      >
        {/* Unified Top Header Bar */}
        {hasHeader && (
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/70 select-none">
            {/* Left Header Element */}
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {(variant === 'window' || variant === 'browser') ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
              ) : variant === 'album' ? (
                <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 flex-shrink-0" />
              )}

              {(activeTitle || activeTag || currentItem.label) && (
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate tracking-tight">
                  {activeTitle || activeTag || currentItem.label}
                </span>
              )}
            </div>

            {/* Right Header Controls (Badge & Pagination Arrows) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeBadge && (
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-800/50">
                  {activeBadge}
                </span>
              )}

              {isMulti && (
                <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>
                    {currentIndex + 1}/{total}
                  </span>
                  <div className="flex items-center ml-0.5">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous image"
                      className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13L5 8L10 3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next image"
                      className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3L11 8L6 13" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Display */}
        <div className="relative group overflow-hidden bg-zinc-100/30 dark:bg-zinc-950/20">
          {/* Subtle Hover Chevrons for Multi-Image */}
          {isMulti && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/60 hover:bg-zinc-900/90 text-white backdrop-blur-xs cursor-pointer shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13L5 8L10 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/60 hover:bg-zinc-900/90 text-white backdrop-blur-xs cursor-pointer shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3L11 8L6 13" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSrc}
            alt={activeAlt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`w-full h-auto block ${className}`}
            {...props}
          />
        </div>

        {/* Minimal Bottom Switcher Tabs (Only when multi-image) */}
        {isMulti && (
          <div className="flex flex-wrap items-center justify-center gap-1 p-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
            {normalizedImages.map((item, idx) => {
              const isSelected = idx === currentIndex;
              const label = item.label || `Item ${idx + 1}`;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2 py-0.5 font-mono text-[11px] rounded transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/80 font-medium'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Caption Matching Site Typography */}
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

