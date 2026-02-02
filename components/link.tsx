"use client";

import NextLink from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import React from "react";

type Props<T extends string = string> = {
  href: Route<T> | URL;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">;

export function Link<T extends string = string>({
  href,
  children,
  className,
  style,
  ...props
}: Props<T>) {
  const router = useRouter();
  const hrefString = typeof href === "string" ? href : href.toString();
  const isUrl = href instanceof URL;

  const isExternal =
    (isUrl &&
      (href.protocol === "http:" ||
        href.protocol === "https:" ||
        href.protocol === "mailto:")) ||
    (!isUrl &&
      typeof hrefString === "string" &&
      (hrefString.startsWith("http://") ||
        hrefString.startsWith("https://") ||
        hrefString.startsWith("mailto:")));

  const hrefPathname = isUrl && !isExternal ? href.pathname + href.search + href.hash : hrefString;

  if (isExternal) {
    const externalHref = isUrl ? href.toString() : hrefString;
    return (
      <a
        href={externalHref}
        target="_blank"
        className={className || `text-zinc-900 no-underline dark:text-zinc-100 hover:underline hover:underline-offset-4`}
        rel="noopener noreferrer"
        style={style}
        {...props}
      >
        {children}
      </a>
    );
  }

  const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only intercept left clicks without modifier keys
    const isModifierKey = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (isModifierKey || e.button !== 0) return;

    if (document.startViewTransition) {
      e.preventDefault();
      document.startViewTransition(() => {
        router.push(hrefPathname as Route);
      });
    }
  };

  return (
    <NextLink
      href={hrefPathname as Route}
      onClick={handleOnClick}
      className={className || `text-zinc-900 no-underline dark:text-zinc-100 hover:underline hover:underline-offset-4`}
      style={style}
      {...props}
    >
      {children}
    </NextLink>
  );
}