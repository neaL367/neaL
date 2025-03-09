export interface Metadata {
  title?: string
  description?: string
  published?: boolean
  date?: string
}

export type ContentType = "projects" | "notes"

export type SortOption = "newest" | "oldest" | "most-likes" | "least-likes";

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
    like_count?: number
  }
}

export interface InstagramPost {
  id: string
  mediaType: string
  mediaUrl: string
  timestamp: Date
  caption?: string
  likeCount: number
}