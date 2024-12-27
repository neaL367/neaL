import { notFound } from "next/navigation";
import { ContentType, getContentBySlug } from "@/lib/mdx";

interface ContentPageProps {
  params: Promise<{ type: ContentType; slug: string }>;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { type, slug } = await params;

  const content = await getContentBySlug(type, slug);
  if (!content) {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {content.frontmatter.title}
        </h1>
        <time className="text-gray-500">
          {new Date(content.frontmatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>
      <div className="prose prose-gray max-w-none">{content.content}</div>
    </article>
  );
}
