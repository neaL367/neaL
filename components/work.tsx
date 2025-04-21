'use client'

import { useRef } from 'react'
import { motion } from 'motion/react'
import { WORK_EXPERIENCES } from '@/app/data'
import Link from 'next/link'
import Image from 'next/image'

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

export function Work() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <motion.section
      ref={sectionRef}
      variants={ANIMATION_VARIANTS.container}
      transition={ANIMATION_TRANSITION}
      className="relative"
    >
      <h3 className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Work Experience
      </h3>
      <motion.div
        className="flex flex-col space-y-4"
        variants={ANIMATION_VARIANTS.section}
        transition={ANIMATION_TRANSITION}
      >
        {WORK_EXPERIENCES.map((work) => (
          <motion.div
            key={work.id}
            className="relative overflow-hidden bg-zinc-300/30  transition-colors dark:bg-zinc-600/30"
          >
            <div className="relative h-full w-full bg-white dark:bg-zinc-950">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="relative mt-1 h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={work.logo}
                      alt={`${work.company} logo`}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Link
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex max-w-max items-center text-lg font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      {work.company}
                      <span className="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                    </Link>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {work.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {work.start} - {work.end}
                    </p>
                  </div>
                </div>

                <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>
                    Built WordPress sites for{' '}
                    <Link
                      href="https://qlhealthcare.co.th"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center text-zinc-900 dark:text-zinc-300"
                    >
                      QL Healthcare Thailand
                      <span className="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                    </Link>
                    {', '}
                    <Link
                      href="https://dseelin.co.th"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center text-zinc-900 dark:text-zinc-300"
                    >
                      D.Seelin
                      <span className="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                    </Link>{' '}
                    & multilingual <code className='text-zinc-200'>Next.js</code> site for{' '}
                    <Link
                      href="https://youthplusthailand.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center text-zinc-900 dark:text-zinc-300"
                    >
                      YouthPlusThailand
                      <span className="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                    </Link>{' '}
                    (all hosted on Plesk)
                  </li>

                  <li>
                    Co‑created{' '}
                    <Link
                      href="https://hopeis.us/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center text-zinc-900 dark:text-zinc-300"
                    >
                      HopeIs.Us
                      <span className="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                    </Link>{' '}
                    - youth volunteer project promoting mindfulness through interactive quizzes, built in 2 months
                  </li>

                  <li>
                    Managed AWS infra: Amazon Linux 2 EC2 (LAMP) & S3 static
                    hosting with redirection rules
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

