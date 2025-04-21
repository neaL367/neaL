'use client'
import { PROJECTS } from '@/app/data'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Suspense, lazy } from 'react'
import VideoSkeleton from './ui/video-skeleton'

const ANIMATION_VARIANTS = {
  section: {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
}

const ANIMATION_TRANSITION = {
  duration: 0.3,
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
      <h3 className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Projects
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <div key={project.name} className="space-y-2">
            <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
              <Suspense fallback={<VideoSkeleton />}>
                <ProjectMedia
                  src={project.video || project.image}
                  type={project.video ? 'video' : 'image'}
                />
              </Suspense>
            </div>
            <div className="px-1 hover:cursor-pointer">
              <Link
                className="group font-base relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
                href={project.link || ''}
                target="_blank"
              >
                <p className="relative max-w-max">
                  {project.name}
                  <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                </p>
                <p className="text-base group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300">
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
