import type { Metadata } from "@/types/metadata";
import type { MDXContent } from "mdx/types";

export type Post = {
  slug: string;
  metadata: Metadata;
  content: MDXContent;
};