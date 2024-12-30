import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getContentList } from "@/lib/content";

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

export async function generateStaticParams() {
  const notes = getContentList("notes");
  return (await notes).map((note) => ({
    slug: note.slug,
  }));
}

export const dynamicParams = false;
