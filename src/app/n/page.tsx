import ContentCard from "@/components/content-card";
import ContentLayout from "@/components/content-layout";
import { getAllContent } from "@/lib/mdx";

export default async function NotesPage() {
  const notes = await getAllContent('n');

  return (
    <ContentLayout title="Notes">
      {notes.map((note) => (
        <ContentCard
          key={note.slug}
          title={note.frontmatter.title}
          date={new Date(note.frontmatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          slug={note.slug}
          type="n"
        />
      ))}
    </ContentLayout>
  );
}
