import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'

export interface Frontmatter {
  title?: string
  date?: string
  description?: string
}

export async function getMdxContent(type: string, slug: string) {
  const contentPath = path.join(process.cwd(), 'src', 'contents', type, slug, 'page.mdx')
  
  try {
    if (!fs.existsSync(contentPath)) {
      return { exists: false, content: null, frontmatter: null }
    }

    const source = fs.readFileSync(contentPath, 'utf8')
    const { content, frontmatter } = await compileMDX<Frontmatter>({
      source,
      options: { 
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
        },
      },
    })
    
    return {
      exists: true,
      content,
      frontmatter
    }
  } catch (error) {
    console.error('Error reading MDX:', error)
    return { exists: false, content: null, frontmatter: null }
  }
}

export function getAllPosts(type: string): string[] {
  const contentPath = path.join(process.cwd(), 'src', 'contents', type)
  
  if (!fs.existsSync(contentPath)) {
    return []
  }

  return fs.readdirSync(contentPath)
}

export function getValidContentTypes() {
  return ['p', 'n', 'b'] as const
}

export type ContentType = ReturnType<typeof getValidContentTypes>[number]

