import Link from 'next/link'
import { getContentList } from '@/lib/content'

export default async function NotesPage() {
  const notes = getContentList('notes')

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Notes</h1>
      <ul className="space-y-4">
        {(await notes).map((note) => (
          <li key={note.slug}>
            <Link href={`/n/${note.slug}`} className="text-blue-600 hover:underline">
              {note.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

