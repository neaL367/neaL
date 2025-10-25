import fs from "node:fs";
import path from "node:path";

import type { Metadata } from "@/types/metadata";
import type { MDXContent } from "mdx/types";
import type { Post } from "@/types/post";

type MDXModule = {
  metadata: Metadata;
  default: MDXContent;
};

async function getMDXData(dir: string): Promise<Post[]> {
  const mdxFiles = fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"));

  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const slug = path.basename(file, path.extname(file));
      const { default: content, metadata } = (await import(
        `@/app/writing/posts/${slug}.mdx`
      )) as MDXModule;

      return {
        slug,
        metadata,
        content,
      };
    }),
  );
  return posts;
}

export function getWritingPosts(): Promise<Post[]> {
  return getMDXData(path.join(process.cwd(), "app", "writing", "posts"));
}

export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  const targetDate = new Date(date);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  const fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return includeRelative ? `${fullDate} (${formattedDate})` : fullDate;
}
