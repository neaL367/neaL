import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ContentLayout } from "@/components/content-layout";
import {
  getAllPosts,
  getMdxContent,
  getValidContentTypes,
  type ContentType,
} from "@/lib/mdx";

interface PageProps {
  params: Promise<{
    type: ContentType;
    slug: string;
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const { type, slug } = params;

  if (!getValidContentTypes().includes(type)) {
    notFound();
  }

  const { exists, content, frontmatter } = await getMdxContent(type, slug);

  if (!exists) {
    notFound();
  }

  return (
    <ContentLayout type={type}>
      <div className="space-y-6">
        <div className="">
          {frontmatter?.title && (
            <h1 className="text-4xl font-bold tracking-tight">
              {frontmatter.title}
            </h1>
          )}
          {frontmatter?.date && (
            <p className="text-sm text-muted-foreground">
              {format(new Date(frontmatter.date), "MMMM d, yyyy")}
            </p>
          )}
        </div>
        <hr />
        {content}
      </div>
    </ContentLayout>
  );
}

export async function generateStaticParams() {
  const types = getValidContentTypes();
  const params = [];

  for (const type of types) {
    const slugs = getAllPosts(type);
    params.push(...slugs.map((slug) => ({ type, slug })));
  }

  return params;
}

