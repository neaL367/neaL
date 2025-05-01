'use client'
import { motion } from 'framer-motion'
import { Magnetic } from './ui/magnetic'
import { Paragraph } from './ui/paragraph'
import { AccessibleLink } from './ui/accessible-link'
import { EMAIL, SOCIAL_LINKS } from '@/app/data/social'

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
    <Magnetic>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {children}
      </a>
    </Magnetic>
  )
}

export function Connect() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.container}
      transition={ANIMATION_TRANSITION}
    >
      <h3 className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100 ">
        Connect
      </h3>
      <Paragraph>
        Feel free to contact me at{' '}
        <AccessibleLink href={`mailto:${EMAIL}`}>
          {EMAIL}
        </AccessibleLink>
      </Paragraph>
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


