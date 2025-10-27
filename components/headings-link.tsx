"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/types/heading";

type TableOfContentsProps = {
  headings: Heading[];
};

export function HeadingsLink({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className={`space-y-1 ${headings.length === 0 ? "hidden" : ""}`}>
      <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        On this page
      </p>
      <ul className="space-y-3.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block text-sm transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 ${
                activeId === heading.id
                  ? "font-medium text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
