'use client'
import { EMAIL, SOCIAL_LINKS } from '@/app/data'
import { motion } from 'framer-motion'
import { Magnetic } from './ui/magnetic'

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

function MagneticSocialLink({
  children,
  link,
}: {
  children: React.ReactNode
  link: string
}) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </a>
    </Magnetic>
  )
}

export function Connect() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
    >
      <h3 className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Connect
      </h3>
      <p className="mb-5 text-zinc-600 dark:text-zinc-400">
        Feel free to contact me at{' '}
        <a
          className="group relative inline-block text-zinc-900 dark:text-zinc-300"
          href={`mailto:${EMAIL}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {EMAIL}
          <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
        </a>
      </p>
      <div className="flex items-center justify-start space-x-3">
        {SOCIAL_LINKS.map((link) => (
          <MagneticSocialLink key={link.label} link={link.link}>
            {link.label}
          </MagneticSocialLink>
        ))}
      </div>
    </motion.section>
  )
}
