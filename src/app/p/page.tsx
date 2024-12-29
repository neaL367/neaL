import { getContentList } from '@/lib/content'
import Link from 'next/link'

export default async function ProjectsPage() {
  const projects = getContentList('projects')

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <ul className="space-y-4">
        {(await projects).map((project) => (
          <li key={project.slug}>
            <Link href={`/p/${project.slug}`} className="text-blue-600 hover:underline">
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
