import { Link } from "next-view-transitions";
import { getContentList } from "@/lib/content";

export default async function NotesPage() {
  const notes = await getContentList("notes");

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">notes</h1>
      <ul className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <li key={note.slug}>
              <Link
                href={`/n/${note.slug}`}
                className="text-blue-600 duration-500"
              >
                {note.title}
              </Link>
            </li>
          ))
        ) : (
          <p>Stay turned.</p>
        )}
      </ul>
    </div>
  );
}
