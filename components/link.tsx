"use client";

import NextLink from "next/link";

import React from "react";
import type { Route } from "next";

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

  return (
    <NextLink
      href={hrefPathname as Route}
      className={className || `text-zinc-900 no-underline dark:text-zinc-100 hover:underline hover:underline-offset-4`}
      style={style}
      {...props}
    >
      {children}
    </NextLink>
  );
}