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

export function IntroSection() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
      className="flex-1 mt-[5rem]"
    >
      <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        About
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">
        I’m a 22‑year‑old Information and Communication Technology student at
        Sripatum University in Bangkok, with a keen focus on front‑end web
        development. I enjoy crafting polished user interfaces, experimenting
        with modern frameworks, and tackling new challenges head‑on. Outside of
        coding, I draw inspiration from the immersive worlds of{' '}
        <a
          href="https://www.rockstargames.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-block text-zinc-900 dark:text-zinc-300"
        >
          Rockstar Games
          <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
        </a>
        , and I’m passionate about one day designing my own pixel‑art video
        games.
      </p>
    </motion.section>
  )
}
