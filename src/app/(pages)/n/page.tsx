import type { Metadata } from "next"
import { getContentList } from "@/lib/content"
import ContentList from "@/components/content-list"

export const metadata: Metadata = {
  title: "Notes",
  description: "Technical notes, tutorials, and web development insights",
  openGraph: {
    images: [
      {
        url: "https://neal367.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes",
    description: "Technical notes, tutorials, and web development insights",
  },
}

export default async function NotesPage() {
  const notes = await getContentList("notes")
  const publishedNotes = notes.filter((note) => note.published)
  return <ContentList title="Notes" items={publishedNotes} baseUrl="/n" />
}

