'use client'

import { LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const About = dynamic(() => import('@/components/about').then((mod) => mod.About), {
  loading: () => <div className="h-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const HorizontalRule = dynamic(() => 
  import('@/components/ui/horizontal-rule').then((mod) => mod.HorizontalRule)
)

const Header = dynamic(() => import('@/components/header').then((mod) => mod.Header), {
  loading: () => <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const Footer = dynamic(() => import('@/components/footer').then((mod) => mod.Footer), {
  loading: () => <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const HelloEffect = dynamic(() => 
  import('@/components/ui/hello-effect').then((mod) => mod.HelloEffect), {
  loading: () => <div className="h-42 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const Work = dynamic(() => import('@/components/work').then((mod) => mod.Work), {
  loading: () => <div className="h-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const Posts = dynamic(() => import('@/components/posts').then((mod) => mod.Posts), {
  loading: () => <div className="h-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const Connect = dynamic(() => import('@/components/connect').then((mod) => mod.Connect), {
  loading: () => <div className="h-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const Projects = dynamic(() => import('@/components/projects').then((mod) => mod.Projects), {
  loading: () => <div className="h-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

const Certificates = dynamic(() => import('@/components/certificates').then((mod) => mod.Certificates), {
  loading: () => <div className="h-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
})

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
        className="space-y-14"
        variants={VARIANTS_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <Suspense fallback={<div className="mb-8 flex h-42 items-center justify-center animate-pulse bg-zinc-100 dark:bg-zinc-800" />}>
          <div className="mb-8 flex h-42 items-center justify-center">
            <HelloEffect />
          </div>
        </Suspense>
        <HorizontalRule />

        <Suspense fallback={<div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />}>
          <Header />
        </Suspense>

        <div className="px-4 md:px-6">
          <About />
        </div>
        <HorizontalRule />

        <div className="px-4 md:px-6">
          <Projects />
        </div>
        <HorizontalRule />

        <div className="px-4 md:px-6">
          <Work />
        </div>
        <HorizontalRule />

        <div className="px-4 md:px-6">
          <Certificates />
        </div>
        <HorizontalRule />

        <div className="px-4 md:px-6">
          <Posts />
        </div>
        <HorizontalRule />

        <div className="px-4 md:px-6">
          <Connect />
        </div>
        <HorizontalRule />

        <Footer />
      </m.main>
    </LazyMotion>
  )
}
