import { notFound } from "next/navigation";
import { Metadata } from "next";
import { promises as fs } from 'fs';
import path from 'path';

type ContentType = 'projects' | 'notes';

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
    const { default: Component } = await import(`@/content/${type}/${params.slug}/page.mdx`);
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

  const title = params.slug.replace(/-/g, " ");
  return {
    title: `${title} | My ${TYPE_TITLES[type]}`,
    description: `Detailed information about ${title}`,
  };
}

async function getContentList(type: ContentType): Promise<{ slug: string; title: string }[]> {
  const contentDir = path.join(process.cwd(), 'src', 'content', type);
  
  try {
    const folders = await fs.readdir(contentDir);
    
    const contentPromises = folders.map(async (folder) => {
      const folderPath = path.join(contentDir, folder);
      const stat = await fs.stat(folderPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(folderPath);
        if (files.includes('page.mdx')) {
          return {
            slug: folder,
            title: folder.split('-').join(' ')
          };
        }
      }
      return null;
    });

    const contentList = await Promise.all(contentPromises);
    return contentList.filter((item): item is { slug: string; title: string } => item !== null);
  } catch (error) {
    console.error(`Error reading ${type} directory:`, error);
    return [];
  }
}

export async function generateStaticParams() {
  const types = Object.entries(TYPE_MAP);
  const paramsPromises = types.map(async ([prefix, type]) => {
    const items = await getContentList(type);
    return items.map(item => ({ type: prefix, slug: item.slug }));
  });

  const params = await Promise.all(paramsPromises);
  return params.flat();
}

export const dynamicParams = false;

