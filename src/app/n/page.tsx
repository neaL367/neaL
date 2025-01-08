import { getContentList } from "@/lib/content";
import ContentList from "@/components/content-list";

export default async function NotesPage() {
  const notes = await getContentList("notes");
  return <ContentList title="Notes" items={notes} baseUrl="/n" />;
}
