import fs from "node:fs";
import path from "node:path";

import type { Metadata } from "@/types/metadata";
import type { MDXContent } from "mdx/types";
import type { Post } from "@/types/post";

type MDXModule = {
  metadata: Metadata;
  default: MDXContent;
};

function getMDXSlugs(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.basename(file, path.extname(file)));
}

async function importMDXPost(slug: string): Promise<Post> {
  const { default: content, metadata } = (await import(
    `@/app/writing/posts/${slug}.mdx`
  )) as MDXModule;

  return { slug, metadata, content };
}

async function getMDXData(dir: string): Promise<Post[]> {
  const slugs = getMDXSlugs(dir);
  return Promise.all(slugs.map((slug) => importMDXPost(slug)));
}


export function getWritingPosts(): Promise<Post[]> {
  const postsDir = path.join(process.cwd(), "app", "writing", "posts");
  return getMDXData(postsDir);
}

export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date();
  const targetDate = new Date(date.includes("T") ? date : `${date}T00:00:00`);

  const diffMs = currentDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  let relative = "Today";
  if (diffYears > 0) relative = `${diffYears}y ago`;
  else if (diffMonths > 0) relative = `${diffMonths}mo ago`;
  else if (diffDays > 0) relative = `${diffDays}d ago`;

  const fullDate = targetDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return includeRelative ? `${fullDate} (${relative})` : fullDate;
}
