import { promises as fs } from 'fs'
import path from 'path'

export async function getContentList(type: 'projects' | 'notes' | 'blog') {
  const contentDir = path.join(process.cwd(), 'src', 'content', type)
  const folders = await fs.readdir(contentDir)

  const contentList = await Promise.all(
    folders.map(async (folder) => {
      const folderPath = path.join(contentDir, folder)
      const stat = await fs.stat(folderPath)

      if (stat.isDirectory()) {
        const files = await fs.readdir(folderPath)
        if (files.includes('page.mdx')) {
          return {
            slug: folder,
            title: folder.split('-').join(' ')
          }
        }
      }
      return null
    })
  )

  return contentList.filter((item): item is { slug: string; title: string } => item !== null)
}

