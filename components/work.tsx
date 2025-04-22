import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { AnimatedUnderline } from '@/components/ui/animated-underline'
import { processHtmlWithAnimatedLinks } from '@/lib/utils'
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

export function Work() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

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
        className="flex flex-col gap-5 space-y-4"
        variants={ANIMATION_VARIANTS.section}
        transition={ANIMATION_TRANSITION}
      >
        {WORK_EXPERIENCES.map((work) => (
          <motion.div
            key={work.id}
            className="transition-theme relative overflow-hidden "
          >
            <div className="relative h-full w-full bg-white py-4 pr-4 dark:bg-zinc-950 transition-all ease-out duration-1000">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start space-x-5">
                  <div className="relative mt-1 h-10 w-10 overflow-hidden rounded-md">
                    <Image
                      src={work.logo}
                      alt={`${work.company} logo`}
                      width={40}
                      height={40}
                      className={`h-full w-full object-cover ${
                        imageLoaded
                          ? 'blur-0 scale-100 opacity-100'
                          : 'scale-95 opacity-0 blur-sm'
                      }`}
                      priority
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={75}
                      unoptimized
                      onLoad={() => setImageLoaded(true)}
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
                      <AnimatedUnderline />
                    </Link>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {work.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {work.start} - {work.end}
                    </p>
                  </div>
                </div>

                {/* Render accomplishments if they exist */}
                {work.accomplishments && work.accomplishments.length > 0 && (
                  <ul className="accomplishment-list list-inside list-disc space-y-1.5 pl-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {work.accomplishments.map((accomplishment, index) => (
                      <li
                        key={index}
                        dangerouslySetInnerHTML={{
                          __html: processHtmlWithAnimatedLinks(accomplishment),
                        }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}
