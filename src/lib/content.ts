import { promises as fs } from "node:fs"
import path from "node:path"
import type { ContentItem, ContentType } from "@/types"
import { formatDate } from "./utils"

export async function getContentList(type: ContentType): Promise<ContentItem[]> {
  const contentDir = path.join(process.cwd(), "src", "contents", type)

  try {
    const folders = await fs.readdir(contentDir)

    const contentPromises = folders.map(async (folder) => {
      const folderPath = path.join(contentDir, folder)
      const folderStat = await fs.stat(folderPath)

      if (!folderStat.isDirectory()) return null

      const files = await fs.readdir(folderPath)
      if (!files.includes("page.mdx")) return null

      try {
        const { metadata } = await import(`@/contents/${type}/${folder}/page.mdx`)

        return {
          slug: folder,
          title: metadata?.title || folder.replace(/-/g, " "),
          description: metadata?.description || "",
          published: metadata?.published ?? true,
          date: metadata?.date ? formatDate(new Date(metadata.date)) : formatDate(new Date()),
        }
      } catch (error) {
        console.error(`Error importing metadata for folder ${folder}:`, error)
        return null
      }
    })

    return (await Promise.all(contentPromises)).filter((item): item is ContentItem => item !== null)
  } catch (error) {
    console.error(`Error reading ${type} directory:`, error)
    return []
  }
}

