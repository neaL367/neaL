import { notFound } from "next/navigation";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getInstagramPosts } from "@/lib/instagram";
import { formatDate, formatTime } from "@/lib/utils";
import type { Metadata } from "next";

interface PhotoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 3600

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getInstagramPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata(
  props: PhotoPageProps
): Promise<Metadata> {
  const posts = await getInstagramPosts();
  const params = await props.params;
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    return {
      title: "Photo Not Found",
    };
  }

  return {
    title: post.caption
      ? `Photo: ${post.caption.substring(0, 60)}...`
      : "Photo",
    description: post.caption || "View this Instagram photo",
    openGraph: {
      images: [
        {
          url: post.mediaUrl,
          width: 1200,
          height: 630,
          alt: post.caption || "Instagram photo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PhotoPage(props: PhotoPageProps) {
  const posts = await getInstagramPosts();
  const params = await props.params;
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className=" flex flex-col  min-h-[calc(100vh-11rem)] bg-black/20 backdrop-blur-lg rounded-md">
      <div className="relative flex-1 min-h-[50vh] md:min-h-full">
        <Image
          src={post.mediaUrl || ""}
          alt={post.caption || "Photo"}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 70vw"
          priority
          style={{
            viewTransitionName: `photo-${post.id}`,
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 w-full p-6 flex flex-col border">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium">
            {formatDate(post.timestamp)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatTime(post.timestamp)}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <span className="text-sm font-medium">{post.likeCount} likes</span>
          </div>
        </div>

        {post.caption ? (
          <div className="mb-3">
            <h1 className="text-xl font-semibold mb-2">Caption</h1>
            <p className="text-gray-700 dark:text-gray-300 break-words">
              {post.caption}
            </p>
          </div>
        ) : null}

        {/* <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-sm text-muted-foreground">Media Type: {post.mediaType}</div>
          <div className="text-sm text-muted-foreground mt-1">Post ID: {post.id}</div>
        </div> */}
      </div>
    </div>
  );
}