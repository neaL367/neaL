export interface Metadata {
  title?: string
  description?: string
  thumbnail?: string
  published?: boolean
  date?: string
}

export type ContentType = "projects" | "notes"

export interface ContentItem {
  slug: string
  title: string
  description: string
  thumbnail: string
  published: boolean
  date: string
}

