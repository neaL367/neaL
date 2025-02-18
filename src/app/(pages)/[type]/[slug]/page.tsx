import dynamic from "next/dynamic";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentList } from "@/lib/content";
import { ContentType } from "@/types";

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

    const Component = dynamic(
      () => import(`@/contents/${type}/${params.slug}/page.mdx`),
      {
        loading: () => <p>Loading...</p>,
      }
    );

    return <Component />;
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
        metadata.description || `Detailed information about ${metadata.title}`,
      openGraph: {
        images: metadata.thumbnail ? [metadata.thumbnail] : [],
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
