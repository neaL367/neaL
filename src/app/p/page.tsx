import { getContentList } from "@/lib/content";
import ContentList from "@/components/content-list";

export default async function ProjectsPage() {
  const projects = await getContentList("projects");
  const publishedProjects = projects.filter((note) => note.isPublished);
  return <ContentList title="Projects" items={publishedProjects} baseUrl="/p" />;
}
