import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { AnimatedUnderline } from '@/components/ui/animated-underline'
import { processHtmlWithAnimatedLinks } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Code, Heart } from 'lucide-react'
import { WORK_EXPERIENCES } from '@/app/data/work'

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

const positionIcons = {
  developer: <Code className="size-4" />,
  volunteer: <Heart className="size-4" />,
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
        className="flex flex-col gap-5"
        variants={ANIMATION_VARIANTS.section}
        transition={ANIMATION_TRANSITION}
      >
        {WORK_EXPERIENCES.map((experience) => (
          <div key={experience.company} className="relative space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex shrink-0 items-center justify-center">
                {experience.companyLogo ? (
                  <Image
                    src={experience.companyLogo}
                    alt={experience.company}
                    width={42}
                    height={42}
                    className="rounded-full"
                    priority
                    sizes='(max-width: 768px) 100vw, 33vw'
                  />
                ) : (
                  <span className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                )}
              </span>

              <Link
                href={experience.link || '#'}
                target={experience.link ? '_blank' : undefined}
                rel={experience.link ? 'noopener noreferrer' : undefined}
                className="group relative inline-flex max-w-max items-center text-lg font-medium text-zinc-900 dark:text-zinc-100"
              >
                {experience.company}
                <AnimatedUnderline />
              </Link>

              {experience?.current && (
                <span className="relative flex items-center justify-center">
                  <span className="absolute inline-flex size-3 animate-ping rounded-full bg-green-500 opacity-50"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                </span>
              )}
            </div>

            <Accordion
              type="multiple"
              defaultValue={experience.positions
                .filter((pos) => pos.expanded)
                .map((pos) => pos.id)}
            >
              {experience.positions.map((position) => (
                <AccordionItem
                  key={position.id}
                  value={position.id}
                  className="border-none"
                >
                  <div className="flex items-start gap-3 ml-1.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {position.icon && positionIcons[position.icon]}
                    </span>

                    <div className="flex-1 ">
                      <AccordionTrigger className="p-0 space-y-3.5 hover:no-underline">
                        <div className="flex flex-col items-start">
                          <h4 className="text-left font-medium text-zinc-900 dark:text-zinc-100">
                            {position.title}
                          </h4>

                          <p className="flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            {position.employmentType && (
                              <span>{position.employmentType}</span>
                            )}
                            {position.employmentType && position.year && (
                              <span className="flex h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />
                            )}
                            <span>{position.year}</span>
                          </p>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pt-2 pb-4 pr-16">
                        {position.accomplishments && position.accomplishments.length > 0 && (
                          <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 pl-5">
                            {position.accomplishments.map((accomplishment, index) => (
                              <li
                                key={index}
                                className="relative before:absolute before:content-['•'] before:left-[-1.25rem] before:text-zinc-500"
                                dangerouslySetInnerHTML={{
                                  __html: processHtmlWithAnimatedLinks(accomplishment),
                                }}
                              />
                            ))}
                          </ul>
                        )}
                      </AccordionContent>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </motion.div>
    </motion.section>
  )
}

