import type { Metadata } from '@/types/metadata';
import type { MDXContent } from 'mdx/types';

export type ReadingInfo = {
  wordCount: number;
  readingTime: number;
};

export type Post = {
  slug: string;
  metadata: Metadata;
  content: MDXContent;
  readingInfo?: ReadingInfo;
};

export type PostSummary = {
  slug: string;
  metadata: Metadata;
  readingInfo?: ReadingInfo;
};
