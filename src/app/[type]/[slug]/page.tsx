import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentType, getContentList } from "@/lib/content";

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
    const { default: Component, metadata } = await import(`@/content/${type}/${params.slug}/page.mdx`);

    if (metadata.isPublished === false) {
      notFound()
    }

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
    const { metadata } = await import(`@/content/${type}/${params.slug}/page.mdx`)

    return {
      title: `${metadata.title} | ${TYPE_TITLES[type]}`,
      description: metadata.description || `Detailed information about ${metadata.title}`,
      openGraph: {
        images: metadata.thumbnailImage ? [metadata.thumbnailImage] : [],
      },
    }
  } catch (error) {
    console.error(`Error generating metadata for ${type}/${params.slug}:`, error)
    notFound()
  }
}


export async function generateStaticParams() {
  const types = Object.entries(TYPE_MAP)
  const paramsPromises = types.map(async ([prefix, type]) => {
    const contentList = await getContentList(type)
    
    return contentList
      .filter(item => item.isPublished)
      .map(item => ({
        type: prefix,
        slug: item.slug
      }))
  })

  const params = await Promise.all(paramsPromises)
  return params.flat()
}

export const dynamicParams = false;

