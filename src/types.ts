export interface Metadata {
  title?: string
  description?: string
  published?: boolean
  date?: string
}

export type ContentType = "projects" | "notes"

export interface ContentItem {
  slug: string
  title: string
  description: string
  published: boolean
  date: string
}

export interface InstagramMediaEdge {
  node: {
    id: string
    media_type: string
    media_url: string
    timestamp: string
    caption?: string
  }
}

export interface InstagramPost {
  id: string
  mediaType: string
  mediaUrl: string
  timestamp: Date
  caption: string
}