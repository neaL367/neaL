import type { InstagramMediaEdge, InstagramPost } from "@/types"

export async function getInstagramPosts(): Promise<InstagramPost[]> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
        throw new Error("Instagram access token is not set")
    }

    const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,media_type,media_url,timestamp,caption&access_token=${accessToken}`,
    )

    if (!response.ok) {
        throw new Error("Failed to fetch Instagram posts")
    }

    const data = await response.json()

    return data.data.map((edge: InstagramMediaEdge["node"]) => ({
        id: edge.id,
        mediaType: edge.media_type,
        mediaUrl: edge.media_url,
        timestamp: new Date(edge.timestamp),
        caption: edge.caption || "",
    }))
}

export async function getInstagramPostById(id: string): Promise<InstagramPost | null> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
        throw new Error("Instagram access token is not set")
    }

    const response = await fetch(
        `https://graph.instagram.com/${id}?fields=id,media_type,media_url,timestamp,caption&access_token=${accessToken}`,
    )

    if (!response.ok) {
        if (response.status === 404) {
            return null
        }
        throw new Error("Failed to fetch Instagram post")
    }

    const data = await response.json()

    return {
        id: data.id,
        mediaType: data.media_type,
        mediaUrl: data.media_url,
        timestamp: new Date(data.timestamp),
        caption: data.caption || "",
    }
}

