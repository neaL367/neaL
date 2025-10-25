import type { ReactNode } from "react";
import type { Route } from "next";
import NextLink from "next/link";

interface Props {
  href: Route | string;
  children: ReactNode;
  className?: string;
}

export function Link({ href, children, className }: Props) {
  const baseClass = `text-zinc-900 no-underline dark:text-zinc-100 hover:underline hover:underline-offset-4`;
  const combinedClass = className ? `${baseClass} ${className}` : baseClass;

  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http") ||
      href.startsWith("https") ||
      href.startsWith("mailto:"));

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        className={combinedClass}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href as Route} className={combinedClass}>
      {children}
    </NextLink>
  );
}
