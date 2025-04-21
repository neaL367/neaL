'use client'

import { motion } from 'motion/react'

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
      className="flex-1 mt-[5rem]"
    >
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
      I craft digital experiences for the web.      </p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        <a href="https://react.dev/" className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4">react</a>,{' '}
        <a href="https://nextjs.org/" className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4">next.js</a>,{' '}
        <a href="https://tailwindcss.com/" className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4">tailwindcss</a>,{' '}
        <a href="https://ui.shadcn.com/" className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4">shadcn/ui</a>{' '}
        — whatever gets the job done.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        studying at{' '}
        <a 
          href="https://www.spu.ac.th/" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4"
        >
          sripatum university
        </a>. 
        volunteer at{' '}
        <a 
          href="https://goodgeek.club" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4"
        >
          goodgeekclub
        </a>.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        <span className="text-zinc-900 dark:text-zinc-300 font-medium">specialize in:</span> 
        {' '}typescript, server components, multilingual sites.
        <br />
        clean interfaces, responsive designs.
        <br />
        and making websites look like someone cared.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        deploy on{' '}
        <a 
          href="https://vercel.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4"
        >
          vercel
        </a>{' '}
        and{' '}
        <a 
          href="https://aws.amazon.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4"
        >
          aws
        </a>. 
        organize workshops in my free time.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        off-screen, i play{' '}
        <a 
          href="https://www.rockstargames.com/" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-900 dark:text-zinc-300 underline underline-offset-4"
        >
          rockstar games
        </a>{' '}
        and dream about making pixel-art games.
      </p>
    </motion.section>
  )
}
