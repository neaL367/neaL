import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";
import { getContentList } from "@/lib/content";

type ContentType = "projects" | "notes" | "blog";

interface PageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

const typeToPrefix: Record<ContentType, string> = {
  projects: "p",
  notes: "n",
  blog: "b",
};

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

  const Component = dynamic(
    () => import(`@/content/${type}/${params.slug}/page.mdx`),
    {
      loading: () => <p>Loading...</p>,
    }
  );

  if (!Component) {
    notFound();
  }

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
    const prefix = typeToPrefix[type];

    params.push(
      ...items.map((item) => ({
        type: prefix,
        slug: item.slug,
      }))
    );
  }

  return params;
}

export const dynamicParams = false;
