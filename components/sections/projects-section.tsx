'use client'
import { PROJECTS } from '@/app/data'
import ProjectMedia from '@/components/ui/project-media'
import { motion } from 'framer-motion'

export function ProjectsSection() {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Projects
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <div key={project.name} className="space-y-2">
            <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
              <ProjectMedia
                src={project.video || project.image}
                type={project.video ? 'video' : 'image'}
              />
            </div>
            <div className="px-1">
              <a
                className="font-base group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
                href={project.link}
                target="_blank"
              >
                {project.name}
                <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
              </a>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}