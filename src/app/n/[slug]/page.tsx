import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getContentList } from "@/lib/content";
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NotePage(props: PageProps) {
  const params = await props.params;
  
  const NoteComponent = dynamic(
    () => import(`@/content/notes/${params.slug}.mdx`),
    {
      loading: () => <p>Loading...</p>,
    }
  );

  if (!NoteComponent) {
    notFound();
  }

  return <NoteComponent />;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;

  return {
    title: `${params.slug.replace(/-/g, ' ')} | My Notes`,
    description: `Detailed notes about ${params.slug.replace(/-/g, ' ')}`,
  }
}

export async function generateStaticParams() {
  const notes = getContentList("notes");
  
  return (await notes).map((note) => ({
    slug: note.slug,
  }));
}

export const dynamicParams = false;
