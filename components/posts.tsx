'use client'
import { POSTS } from '@/app/data'
import { motion } from 'motion/react'
import Link from 'next/link'
import { AnimatedUnderline } from '@/components/ui/animated-underline'

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

export function Posts() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
    >
      <h3 className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Posts
      </h3>
      <div className="flex flex-col space-y-4">
        {POSTS.map((post) => (
          <Link
            key={post.uid}
            className="group rounded-xl transition-all"
            href={post.link}
            data-id={post.uid}
          >
            <div className="flex flex-col space-y-1.5">
              <div className="relative max-w-max">
                <h4 className="max-w-max truncate font-normal text-zinc-900 group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
                  {post.title}
                  <AnimatedUnderline />
                </h4>
              </div>
              <p className="relative truncate text-zinc-500 group-hover:text-zinc-700 text-sm dark:text-zinc-400 dark:group-hover:text-zinc-300">
                {post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}

