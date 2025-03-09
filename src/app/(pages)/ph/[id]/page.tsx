import { notFound } from "next/navigation";
import Image from "next/image";
import { Heart, Calendar } from 'lucide-react';
import { getInstagramPosts } from "@/lib/instagram";
import { formatDate, formatTime } from "@/lib/utils";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";

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

  // Find index of current post and get next/previous posts
  const currentIndex = posts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-11rem)] bg-black/20 backdrop-blur-lg rounded-md">
      
      <div className="relative flex-1 min-h-[50vh] md:min-h-full">
        <Image
          src={post.mediaUrl || ""}
          alt={post.caption || "Photo"}
          fill
          className="object-contain transition-all duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
          priority
          style={{
            viewTransitionName: `photo-${post.id}`,
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 w-full p-6 flex flex-col border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">
              {formatDate(post.timestamp)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatTime(post.timestamp)} (GMT+7)
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

        <div className="mt-6 flex justify-between">
          {prevPost ? (
            <Link href={`/ph/${prevPost.id}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          ) : <div />}
          
          {nextPost ? (
            <Link href={`/ph/${nextPost.id}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}