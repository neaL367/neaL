export type PostFrontmatter = {
  title: string;
  summary: string;
  publishedAt: string;
  author: string;
};

export type Metadata = PostFrontmatter & {
  formattedDate: string;
};

