import type { Metadata } from "next";
import { getInstagramPosts } from "@/lib/instagram";
import { PhotoGrid } from "@/components/photo-grid";

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Photos",
  description: "Check out My latest photos and moments captured on Instagram",
  openGraph: {
    images: [
      {
        url: "https://neal367.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photos",
    description: "Check out My latest photos and moments captured on Instagram",
  },
};

export default async function PhotosPage() {
  const posts = await getInstagramPosts();

  return (
    <div className="min-h-[calc(100dvh-10rem)]">
      <h1 className="text-2xl font-medium mb-4">Photos</h1>
      <p className="text-gray-600">
        Check out My latest photos and moments captured on Instagram.
      </p>
      <PhotoGrid posts={posts} />
    </div>
  );
}
