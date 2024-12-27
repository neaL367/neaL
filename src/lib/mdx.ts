import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'

export const contentTypes = {
    p: 'projects',
    b: 'blog',
    n: 'notes'
  } as const;

export type ContentType = keyof typeof contentTypes;

export async function getContentBySlug(type: ContentType, slug: string) {
  const contentDir = path.join(process.cwd(), 'contents', type, slug)
  const mdxPath = path.join(contentDir, 'page.mdx')
  
  try {
    const rawContent = await fs.promises.readFile(mdxPath, 'utf-8')
    
    const { content, frontmatter } = await compileMDX({
      source: rawContent,
      options: {
        parseFrontmatter: true,
      },
    })

    return {
      content,
      frontmatter: frontmatter as { title: string; date: string },
      slug,
    }
  } catch (error) {
    console.error(`Error reading MDX file: ${mdxPath}`, error)
    return null
  }
}

export async function getAllContent(type: keyof typeof contentTypes) {
  const contentDir = path.join(process.cwd(), 'contents', type)
  
  try {
    const folders = await fs.promises.readdir(contentDir)
    
    const contents = await Promise.all(
      folders.map(async (folder) => {
        const content = await getContentBySlug(type, folder)
        return content
      })
    )

    return contents
      .filter((content): content is NonNullable<typeof content> => content !== null)
      .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
  } catch (error) {
    console.error(`Error reading content directory: ${contentDir}`, error)
    return []
  }
}
