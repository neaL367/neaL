import type { InstagramMediaEdge, InstagramPost } from "@/types"

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("Instagram access token is not set")
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,timestamp,caption&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram posts: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return data.data.map((edge: InstagramMediaEdge["node"]) => ({
      id: edge.id,
      mediaType: edge.media_type,
      // Store the original URL without any processing
      mediaUrl: edge.media_url,
      timestamp: new Date(edge.timestamp),
      caption: edge.caption || "",
    }))
  } catch (error) {
    console.error("Error fetching Instagram posts:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

export async function getInstagramPostById(id: string): Promise<InstagramPost | null> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("Instagram access token is not set")
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/${id}?fields=id,media_type,media_url,timestamp,caption&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
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
      // Store the original URL without any processing
      mediaUrl: data.media_url,
      timestamp: new Date(data.timestamp),
      caption: data.caption || "",
    }
  } catch (error) {
    console.error(`Error fetching Instagram post ${id}:`, error)
    return null
  }
}

