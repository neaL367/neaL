'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { XIcon } from 'lucide-react'
import { WORK_EXPERIENCES } from '@/app/data'

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

export function WorkExperienceSection() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const setExpandPosition = useState({ x: 0, y: 0 })
  const [workContent, setWorkContent] = useState<React.ReactNode | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const toggleCard = (slug: string, e: React.MouseEvent) => {
    if (expandedSlug === slug) {
      setExpandedSlug(null)
      return
    }

    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      setExpandPosition[1]({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    setExpandedSlug(slug)
  }

  // Load MDX content when a card is expanded
  useEffect(() => {
    if (expandedSlug) {
      async function loadWorkContent() {
        try {
          const { default: Content } = await import(
            `@/contents/work/${expandedSlug}/page.mdx`
          )
          setWorkContent(<Content />)
        } catch (error) {
          console.error('Failed to load work content:', error)
          setWorkContent(null)
        }
      }
      loadWorkContent()
    } else {
      setWorkContent(null)
    }
  }, [expandedSlug])

  return (
    <motion.section
      ref={sectionRef}
      variants={ANIMATION_VARIANTS.container}
      transition={ANIMATION_TRANSITION}
      className="relative"
    >
      <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Work Experience
      </h3>
      <motion.div
        className="flex flex-col space-y-4"
        variants={ANIMATION_VARIANTS.section}
        transition={ANIMATION_TRANSITION}
      >
        {WORK_EXPERIENCES.map((work) => (
          <motion.div
            key={work.slug}
            layout
            onClick={(e) => toggleCard(work.slug, e)}
            className={`relative overflow-hidden rounded-xl bg-zinc-300/30 p-[1px] transition-colors hover:cursor-pointer hover:bg-zinc-300/50 dark:bg-zinc-600/30 dark:hover:bg-zinc-600/50 ${
              expandedSlug === work.slug ? 'z-30' : 'z-10'
            }`}
            transition={{ layout: { duration: 0.3, type: 'spring' } }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative h-full w-full rounded-[12px] bg-white p-4 dark:bg-zinc-950">
              <div className="relative flex w-full flex-wrap justify-between gap-3">
                <div>
                  <h4 className="font-normal dark:text-zinc-100">
                    {work.company}
                  </h4>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    {work.title}
                  </p>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {work.start} - {work.end}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {expandedSlug && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
              onClick={() => setExpandedSlug(null)}
            />

            {WORK_EXPERIENCES.filter((w) => w.slug === expandedSlug).map(
              (work) => (
                <motion.div
                  key={`expanded-${work.slug}`}
                  className="no-scrollbar fixed z-50 max-h-[85vh] w-[95%] max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl sm:p-8 md:p-10 dark:bg-zinc-900"
                  initial={{
                    opacity: 0,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(0.9)',
                  }}
                  animate={{
                    opacity: 1,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(1)',
                  }}
                  exit={{
                    opacity: 0,
                    transform: 'translate(-50%, -50%) scale(0.9)',
                  }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                  <div className="relative">
                    <button
                      onClick={() => setExpandedSlug(null)}
                      className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:cursor-pointer hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      aria-label="Close"
                    >
                      <XIcon size={20} />
                    </button>

                    <div className="mb-6">
                      <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
                        {work.company}
                      </h2>
                      <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {work.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                        {work.start} - {work.end}
                      </p>
                    </div>

                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative mb-8 inline-flex items-center gap-1 text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-400"
                    >
                      <span>Visit company website</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                      </svg>
                      <span className="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
                    </a>

                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                      {workContent}
                    </div>
                  </div>
                </motion.div>
              ),
            )}
          </>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

