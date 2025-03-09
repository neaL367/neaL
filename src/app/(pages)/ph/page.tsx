import type { Metadata } from "next";
import { getInstagramPosts } from "@/lib/instagram";
import { PhotoGrid } from "@/components/photo-grid";
import type { SortOption } from "@/types";

interface PhotosPageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

export const revalidate = 3600;

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

export default async function PhotosPage(props: PhotosPageProps) {
  const params = await props.searchParams;
  const sortBy = ((params.sort as string) || "newest") as SortOption;

  const posts = await getInstagramPosts();

  // Pre-sort posts on the server based on the requested sort
  const sortedPosts = [...posts];

  switch (sortBy) {
    case "newest":
      sortedPosts.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      break;
    case "oldest":
      sortedPosts.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      break;
    case "most-likes":
      sortedPosts.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case "least-likes":
      sortedPosts.sort((a, b) => a.likeCount - b.likeCount);
      break;
    default:
      break;
  }

  return (
    <div className="min-h-[calc(100dvh-10rem)]">
      <h1 className="text-2xl font-medium mb-4">Photos</h1>
      <p className="text-gray-600">
        Check out My latest photos and moments captured on Instagram.
      </p>
      <PhotoGrid posts={sortedPosts} initialSortBy={sortBy} />
    </div>
  );
}
