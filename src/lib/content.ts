import { promises as fs } from 'fs'
import path from 'path'

export type ContentType = 'projects' | 'notes'

export interface ContentItem {
  slug: string
  title: string
  thumbnailImage?: string
  isPublished: boolean
}

export async function getContentList(type: ContentType): Promise<ContentItem[]> {
  const contentDir = path.join(process.cwd(), 'src', 'content', type)
  
  try {
    const folders = await fs.readdir(contentDir)
    
    const contentList = await Promise.all(
      folders.map(async (folder) => {
        const folderPath = path.join(contentDir, folder)
        const stat = await fs.stat(folderPath)

        if (stat.isDirectory()) {
          try {
            const files = await fs.readdir(folderPath)
            if (files.includes('page.mdx')) {
              const { metadata } = await import(`@/content/${type}/${folder}/page.mdx`)
              
              return {
                slug: folder,
                title: metadata.title || folder.split('-').join(' '),
                thumbnailImage: metadata.thumbnailImage,
                isPublished: metadata.isPublished
              }
            }
          } catch (error) {
            console.error(`Error reading folder ${folder}:`, error)
          }
        }
        return null
      })
    )

    return contentList.filter((item): item is { slug: string; title: string; thumbnailImage: string; isPublished: boolean; } => item !== null)
  } catch (error) {
    console.error(`Error reading ${type} directory:`, error)
    return []
  }
}