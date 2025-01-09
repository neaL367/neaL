import { getContentList } from "@/lib/content";
import ContentList from "@/components/content-list";

export default async function NotesPage() {
  const notes = await getContentList("notes");
  const publishedNotes = notes.filter((note) => note.isPublished);
  return <ContentList title="Notes" items={publishedNotes} baseUrl="/n" />;
}
