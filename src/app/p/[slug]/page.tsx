import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getContentList } from "@/lib/content";

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const ProjectComponent = dynamic(
    () => import(`@/content/projects/${params.slug}.mdx`),
    {
      loading: () => <p>Loading...</p>,
    }
  );

  if (!ProjectComponent) {
    notFound();
  }

  return <ProjectComponent />;
}

export async function generateStaticParams() {
  const projects = getContentList("projects");
  return (await projects).map((project) => ({
    slug: project.slug,
  }));
}

export const dynamicParams = false;
