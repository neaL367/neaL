export type ContentType = 'projects' | 'notes'

export interface Metadata {
  title: string
  description?: string
  thumbnail?: string
  published: boolean
  date: string
}

export interface ContentItem extends Omit<Metadata, 'date'> {
  slug: string
  date: string
}

