'use client'
import { POSTS } from '@/app/data'
import { motion } from 'motion/react'
import Link from 'next/link'

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

export function PostsSection() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
    >
      <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-100">
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
              <div className='relative w-max'>
                <h4 className="line-clamp-1 text-sm font-normal text-zinc-900 group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
                  {post.title}
                </h4>
                  <span className="absolute -bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-black transition-all duration-300 group-hover:max-w-full dark:bg-white"></span>
              </div>
              <p className="relative line-clamp-1 text-xs text-zinc-500 group-hover:text-zinc-700 md:text-sm dark:text-zinc-400 dark:group-hover:text-zinc-300">
                {post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}
