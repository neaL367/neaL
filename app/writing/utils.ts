import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "@/types/metadata";
import type { MDXContent } from "mdx/types";
import type { Post } from "@/types/post";
import type { Heading } from "@/types/heading";

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

export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractHeadingsFromMDX(slug: string): Heading[] {
  const filePath = path.join(
    process.cwd(),
    "app",
    "writing",
    "posts",
    `${slug}.mdx`
  );

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const headings: Heading[] = [];

  const cleanContent = content
    .replace(/^---[\s\S]*?---/m, "") // Remove frontmatter
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, ""); // Remove inline code

  const markdownHeadingRegex = /^(#{1,2})\s+(.+)$/gm;

  let match;
  while ((match = markdownHeadingRegex.exec(cleanContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateHeadingId(text);
    headings.push({ id, text, level });
  }

  return headings;
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