'use client'

import { LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import dynamic from 'next/dynamic'

import { About } from '@/components/about'

const Work = dynamic(() => import('@/components/work').then((mod) => mod.Work))

const Posts = dynamic(() =>
  import('@/components/posts').then((mod) => mod.Posts),
)

const Connect = dynamic(() =>
  import('@/components/connect').then((mod) => mod.Connect),
)

const Projects = dynamic(() =>
  import('@/components/projects').then((mod) => mod.Projects),
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
        <About />
        <Projects />
        <Work />
        <Posts />
        <Connect />
      </m.main>
    </LazyMotion>
  )
}
