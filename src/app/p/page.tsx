import ContentCard from "@/components/content-card";
import ContentLayout from "@/components/content-layout";
import { getAllContent } from "@/lib/mdx";

export default async function ProjectsPage() {
  const projects = await getAllContent('p');

  return (
    <ContentLayout title="Projects">
      {projects.map((project) => (
        <ContentCard
          key={project.slug}
          title={project.frontmatter.title}
          date={new Date(project.frontmatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          slug={project.slug}
          type="p"
        />
      ))}
    </ContentLayout>
  );
}
