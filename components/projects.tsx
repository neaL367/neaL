'use client'
import { motion } from 'motion/react'
import Link from 'next/link'
import { lazy } from 'react'

import { AnimatedUnderline } from '@/components/ui/animated-underline'
import { PROJECTS } from '@/app/data/projects'

const ANIMATION_VARIANTS = {
  section: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
  container: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
}

const ANIMATION_TRANSITION = {
  duration: 0.2,
}

const ProjectMedia = lazy(() =>
  import('@/components/ui/project-media').then((mod) => ({
    default: mod.default,
  })),
)

export function Projects() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
    >
      <h3 className="mb-6 text-xl font-medium text-zinc-900 dark:text-zinc-100">
        Projects
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <div key={project.name} className="space-y-2">
            <div className="relative bg-zinc-50/40 p-2 ring-1 rounded-xl ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
              <ProjectMedia src={project.image} />
            </div>
            <div className="px-1 hover:cursor-pointer">
              <Link
                className="group font-base relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
                href={project.link || ''}
                target="_blank"
              >
                <h4 className="relative max-w-max">
                  {project.name}
                  <AnimatedUnderline />
                </h4>
                <p className="text-sm text-zinc-700 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300">
                  {project.description}
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}


