import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getContentList } from "@/lib/content";

export default async function NotePage({
  params,
}: {
  params: { slug: string };
}) {
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
