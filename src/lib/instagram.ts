import { cache } from 'react'
import type { InstagramMediaEdge, InstagramPost } from "@/types"

export const getInstagramPosts = cache(async (): Promise<InstagramPost[]> => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
        console.error("Instagram access token is not set")
        return []
    }

    try {
        const response = await fetch(
            `https://graph.instagram.com/me/media?fields=id,media_type,media_url,timestamp,caption,like_count&access_token=${accessToken}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch Instagram posts: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        return data.data.map((edge: InstagramMediaEdge["node"]) => ({
            id: edge.id,
            mediaType: edge.media_type,
            mediaUrl: edge.media_url,
            timestamp: new Date(edge.timestamp),
            caption: edge.caption || "",
            likeCount: edge.like_count || 0,
        }))
    } catch (error) {
        console.error("Error fetching Instagram posts:", error)
        return []
    }
})

export const getInstagramPostById = cache(async (id: string): Promise<InstagramPost | null> => {
    const posts = await getInstagramPosts()
    const post = posts.find(p => p.id === id)
    
    // If found in cache, return it
    if (post) return post
    
    // Otherwise fetch individually
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
        console.error("Instagram access token is not set")
        return null
    }

    try {
        const response = await fetch(
            `https://graph.instagram.com/${id}?fields=id,media_type,media_url,timestamp,caption,like_count&access_token=${accessToken}`,
            { next: { revalidate: 3600 } }
        )

        if (!response.ok) {
            if (response.status === 404) {
                return null
            }
            throw new Error(`Failed to fetch Instagram post: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        return {
            id: data.id,
            mediaType: data.media_type,
            mediaUrl: data.media_url,
            timestamp: new Date(data.timestamp),
            caption: data.caption || "",
            likeCount: data.like_count || 0,
        }
    } catch (error) {
        console.error(`Error fetching Instagram post ${id}:`, error)
        return null
    }
})