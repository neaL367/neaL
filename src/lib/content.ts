import { promises as fs } from 'fs'
import path from 'path'

export async function getContentList(type: 'projects' | 'notes' | 'blog') {
  const contentDir = path.join(process.cwd(), 'src', 'content', type)
  const files = await fs.readdir(contentDir)
  
  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => ({
      slug: file.replace('.mdx', ''),
      title: file.replace('.mdx', '').split('-').join(' ')
    }))
}

