import type { Route } from "next";
import NextLink from "next/link";

type Props<T extends string = string> = {
  href: Route<T> | URL;
  children: React.ReactNode;
  className?: string;
};

export function Link<T extends string = string>({
  href,
  children,
  className,
}: Props<T>) {
  const baseClass = `text-zinc-900 no-underline dark:text-zinc-100 hover:underline hover:underline-offset-4`;
  const combinedClass = className ? `${baseClass} ${className}` : baseClass;

  const isExternal =
    href instanceof URL ||
    (typeof href === "string" &&
      (href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:")));

  if (isExternal) {
    return (
      <a
        href={href instanceof URL ? href.toString() : href}
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
