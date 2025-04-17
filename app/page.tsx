'use client'

import { LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import dynamic from 'next/dynamic'

const IntroSection = dynamic(() =>
  import('@/components/sections/intro-section').then((mod) => mod.IntroSection),
)

const WorkExperienceSection = dynamic(() =>
  import('@/components/sections/work-experience-section').then(
    (mod) => mod.WorkExperienceSection,
  ),
)

const PostsSection = dynamic(() =>
  import('@/components/sections/posts-section').then((mod) => mod.PostsSection),
)

const ConnectSection = dynamic(() =>
  import('@/components/sections/connect-section').then(
    (mod) => mod.ConnectSection,
  ),
)

const ProjectsSection = dynamic(() =>
  import('@/components/sections/projects-section').then(
    (mod) => mod.ProjectsSection,
  ),
)

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export default function Page() {
  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="space-y-24"
        variants={VARIANTS_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <IntroSection />
        <ProjectsSection />
        <WorkExperienceSection />
        <PostsSection />
        <ConnectSection />
      </m.main>
    </LazyMotion>
  )
}
