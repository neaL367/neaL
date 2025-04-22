import { motion } from 'motion/react'
import { AnimatedUnderline } from './ui/animated-underline'

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

export function About() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
      className="mt-[5rem] flex-1"
    >
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        I design and build intuitive, high-performance web experiences.
      </p>

      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        Leveraging tools like{' '}
        <a
          href="https://react.dev/"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          React
          <AnimatedUnderline />
        </a>
        ,{' '}
        <a
          href="https://nextjs.org/"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          Next.js
          <AnimatedUnderline />
        </a>
        ,{' '}
        <a
          href="https://tailwindcss.com/"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          Tailwind CSS
          <AnimatedUnderline />
        </a>
        , and{' '}
        <a
          href="https://ui.shadcn.com/"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          shadcn/ui
          <AnimatedUnderline />
        </a>{' '}
        to deliver pixel-perfect solutions.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        studying at{' '}
        <a 
          href="https://www.spu.ac.th/" 
          target="_blank"
          rel="noopener noreferrer"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          Sripatum University
          <AnimatedUnderline />
        </a>
        , and volunteering with{' '}
        <a
          href="https://goodgeek.club"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          GoodGeekClub
          <AnimatedUnderline />
        </a>{' '}
        to empower our local tech community.
      </p>

      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-300">
          Specialties:
        </span>{' '}
        TypeScript, server components, multilingual sites,
        <br /> clean, responsive interfaces, and a focus on craft and detail.
      </p>

      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        I deploy my projects on{' '}
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          Vercel
          <AnimatedUnderline />
        </a>{' '}
        and{' '}
        <a
          href="https://aws.amazon.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          AWS
          <AnimatedUnderline />
        </a>
        , and I regularly host workshops to share best practices in web
        development.
      </p>

      <p className="text-zinc-600 dark:text-zinc-400">
        off-screen, i play{' '}
        <a 
          href="https://www.rockstargames.com/" 
          target="_blank"
          rel="noopener noreferrer"
          className="group relative text-zinc-900 dark:text-zinc-300"
        >
          Rockstar Games
          <AnimatedUnderline />
        </a>{' '}
        and dream about making pixel-art games.
      </p>
    </motion.section>
  )
}
