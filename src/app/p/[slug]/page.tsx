import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getContentList } from "@/lib/content";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectPage(props: PageProps) {
  const params = await props.params;
  
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
