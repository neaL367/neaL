import { promises as fs } from 'fs'
import path from 'path'
import { ContentItem, ContentType, Metadata } from '@/types';

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

export async function getContentList(type: ContentType): Promise<ContentItem[]> {
  const contentDir = path.join(process.cwd(), 'src', 'content', type)

  try {
    const folders = await fs.readdir(contentDir)

    const contentList = await Promise.all(
      folders.map(async (folder): Promise<ContentItem | null> => {
        const folderPath = path.join(contentDir, folder)
        const stat = await fs.stat(folderPath)

        if (stat.isDirectory()) {
          try {
            const files = await fs.readdir(folderPath)
            if (files.includes('page.mdx')) {
              const { metadata } = await import(`@/content/${type}/${folder}/page.mdx`) as { metadata: Metadata }

              const title = metadata?.title || folder.split('-').join(' ')
              const description = metadata?.description || ''
              const thumbnail = metadata?.thumbnail || ''
              const published = metadata?.published ?? true
              const date = metadata?.date ? new Date(metadata.date) : new Date()
              const formattedDate = dateFormatter.format(date)

              return {
                slug: folder,
                title,
                description,
                thumbnail,
                published,
                date: formattedDate
              }
            }
          } catch (error) {
            console.error(`Error reading folder ${folder}:`, error)
          }
        }
        return null
      })
    )

    return contentList.filter((item): item is ContentItem => item !== null)
  } catch (error) {
    console.error(`Error reading ${type} directory:`, error)
    return []
  }
}
