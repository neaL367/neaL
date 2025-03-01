import { cache } from "react";
import type { Metadata } from "next";
import type { ContentType } from "@/types";

import { notFound } from "next/navigation";
import { getContentList } from "@/lib/content";

interface PageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

const TYPE_MAP: Record<string, ContentType> = {
  p: "projects",
  n: "notes",
};

const TYPE_TITLES: Record<ContentType, string> = {
  projects: "Projects",
  notes: "Notes",
};

const getMdxContent = cache(async (type: ContentType, slug: string) => {
  try {
    const { default: Content } = await import(
      `@/contents/${type}/${slug}/page.mdx`
    );
    return Content;
  } catch (error) {
    console.error(`Error loading MDX content for ${type}/${slug}:`, error);
    return null;
  }
});

export default async function ContentPage(props: PageProps) {
  const params = await props.params;
  const type = TYPE_MAP[params.type];
  if (!type) notFound();

  try {
    const contentList = await getContentList(type);
    const content = contentList.find((item) => item.slug === params.slug);

    if (!content || content.published === false) {
      notFound();
    }

    const Content = await getMdxContent(type, params.slug);
    if (!Content) notFound();

    return <Content />;
  } catch (error) {
    console.error(`Error loading content for ${type}/${params.slug}:`, error);
    notFound();
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const type = TYPE_MAP[params.type];
  if (!type) notFound();

  try {
    const contentList = await getContentList(type);
    const metadata = contentList.find((item) => item.slug === params.slug);

    if (!metadata) {
      notFound();
    }

    return {
      title: `${metadata.title} | ${TYPE_TITLES[type]}`,
      description:
        `${metadata.description}` || `Detailed information about ${metadata.title}`,
      openGraph: {
        images: [
          {
            url: "https://neal367.vercel.app/og.png",
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${metadata.title} | ${TYPE_TITLES[type]}`,
      },
    };
  } catch (error) {
    console.error(
      `Error generating metadata for ${type}/${params.slug}:`,
      error
    );
    notFound();
  }
}

export async function generateStaticParams() {
  const types = Object.entries(TYPE_MAP);
  const paramsPromises = types.map(async ([prefix, type]) => {
    const contentList = await getContentList(type);

    return contentList
      .filter((item) => item.published)
      .map((item) => ({
        type: prefix,
        slug: item.slug,
      }));
  });

  const params = await Promise.all(paramsPromises);
  return params.flat();
}

export const dynamicParams = false;
