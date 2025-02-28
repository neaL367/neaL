import type { Metadata } from "next"
import { getContentList } from "@/lib/content"
import ContentList from "@/components/content-list"

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore my web development projects and portfolio work",
  openGraph: {
    title: "Projects | neaL367",
    description: "Explore my web development projects and portfolio work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | neaL367",
    description: "Explore my web development projects and portfolio work",
  },
}

export default async function ProjectsPage() {
  const projects = await getContentList("projects")
  const publishedProjects = projects.filter((projects) => projects.published)
  return <ContentList title="Projects" items={publishedProjects} baseUrl="/p" />
}

