import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
  container: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
}

const ANIMATION_TRANSITION = {
  duration: 0.2,
}

const positionIcons = {
  developer: <Code className="size-4" />,
  volunteer: <Heart className="size-4" />,
}

export function Work() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
      className="relative"
    >
      <h3 className="mb-6 text-xl font-medium text-zinc-900 dark:text-zinc-100">
        Work Experience
      </h3>
      <div className="flex flex-col gap-5">
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
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="eager"
                  />
                ) : (
                  <span className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                )}
              </span>

              {/* Company name link */}
              <Link
                href={experience.link || '#'}
                target={experience.link ? '_blank' : undefined}
                rel={experience.link ? 'noopener noreferrer' : undefined}
                className="group relative inline-flex max-w-max items-center text-lg font-medium text-zinc-900 dark:text-zinc-100"
              >
                {experience.company}
                <AnimatedUnderline />
              </Link>

              {/* Current job indicator */}
              {experience?.current && (
                <span className="relative flex items-center justify-center">
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
                  <div className="ml-1.5 flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {position.icon && positionIcons[position.icon]}
                    </span>

                    <div className="flex-1">
                      <AccordionTrigger className="space-y-3.5 p-0 hover:no-underline">
                        <div className="flex flex-col items-start">
                          <h4 className="text-left font-medium text-zinc-900 dark:text-zinc-100">
                            {position.title}
                          </h4>

                          <p className="flex items-center gap-2 font-mono text-xs text-zinc-700 dark:text-zinc-400">
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

                      <AccordionContent className="pt-2 pr-16 pb-4">
                        {position.accomplishments &&
                          position.accomplishments.length > 0 && (
                            <ul className="space-y-1.5 pl-5 text-sm text-zinc-700 dark:text-zinc-400">
                              {position.accomplishments.map(
                                (accomplishment, index) => (
                                  <li
                                    key={index}
                                    className="relative before:absolute before:left-[-1.25rem] before:text-zinc-500 before:content-['•']"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        processHtmlWithAnimatedLinks(
                                          accomplishment,
                                        ),
                                    }}
                                  />
                                ),
                              )}
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
      </div>
    </motion.section>
  )
}

