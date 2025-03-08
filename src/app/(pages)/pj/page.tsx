import type { Metadata } from "next";
import { getContentList } from "@/lib/content";
import ContentList from "@/components/content-list";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore my web development projects and portfolio work",
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
    title: "Projects",
    description: "Explore my web development projects and portfolio work",
  },
};

export default async function ProjectsPage() {
  const projects = await getContentList("projects");
  const publishedProjects = projects.filter((projects) => projects.published);
  return (
    <div className="min-h-[calc(90dvh-10rem)]">
      <ContentList title="Projects" items={publishedProjects} baseUrl="/pj" />
    </div>
  );
}
