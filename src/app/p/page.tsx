import { getContentList } from "@/lib/content";
import ContentList from "@/components/content-list";

export default async function ProjectsPage() {
  const projects = await getContentList("projects");
  return <ContentList title="Projects" items={projects} baseUrl="/p" />;
}
