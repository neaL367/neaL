import { notFound } from "next/navigation";
import { Metadata } from "next/types";
import { ContentType, getContentList } from "@/lib/content";


interface PageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

const prefixToType: Record<string, ContentType> = {
  p: "projects",
  n: "notes",
  b: "blog",
};

const typeToTitle: Record<ContentType, string> = {
  projects: "Projects",
  notes: "Notes",
  blog: "Blog",
};

export default async function ContentPage(props: PageProps) {
  const params = await props.params;
  const type = prefixToType[params.type];

  if (!type) {
    notFound();
  }
  const { default: Component } = await import(
    `@/content/${type}/${params.slug}/page.mdx`
  );

  return <Component />;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const type = prefixToType[params.type];

  if (!type) {
    notFound();
  }

  return {
    title: `${params.slug.replace(/-/g, " ")} | My ${typeToTitle[type]}`,
    description: `Detailed notes about ${params.slug.replace(/-/g, " ")}`,
  };
}

export async function generateStaticParams() {
  const types: ContentType[] = ["projects", "notes", "blog"];
  const params = [];

  for (const type of types) {
    const items = await getContentList(type);
    const prefix = Object.keys(prefixToType).find(
      (key) => prefixToType[key] === type
    );

    if (prefix) {
      params.push(
        ...items.map((item) => ({
          type: prefix,
          slug: item.slug,
        }))
      );
    }
  }

  return params;
}

export const dynamicParams = false;
