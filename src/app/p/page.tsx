import { Link } from "next-view-transitions";
import { getContentList } from "@/lib/content";

export default async function ProjectsPage() {
  const projects = await getContentList("projects");

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">projects</h1>
      {projects.length > 0 ? (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/p/${project.slug}`}
                className="text-blue-600 duration-500"
              >
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Stay turned.</p>
      )}
    </div>
  );
}
