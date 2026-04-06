import NextLink from "next/link";
import React from "react";
import type { Route } from "next";

type Props<T extends string = string> = {
  href: Route<T> | URL;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">;

const DEFAULT_LINK_CLASSES = "text-zinc-900 no-underline dark:text-zinc-100 hover:underline hover:underline-offset-4";

function ExternalLink({ href, children, className, ...props }: Props) {
  return (
    <a
      href={href.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className={className || DEFAULT_LINK_CLASSES}
      {...props}
    >
      {children}
    </a>
  );
}

function InternalLink<T extends string = string>({ href, children, className, ...props }: Props<T>) {
  const hrefPathname = href instanceof URL ? href.pathname + href.search + href.hash : href;

  return (
    <NextLink
      href={hrefPathname as Route}
      className={className || DEFAULT_LINK_CLASSES}
      {...props}
    >
      {children}
    </NextLink>
  );
}

export function Link<T extends string = string>({
  href,
  ...props
}: Props<T>) {
  const hrefString = href.toString();

  const isExternal =
    hrefString.startsWith("http://") ||
    hrefString.startsWith("https://") ||
    hrefString.startsWith("mailto:");

  if (isExternal) {
    return <ExternalLink href={href as Route | URL} {...props} />;
  }

  return <InternalLink<T> href={href} {...props} />;
}