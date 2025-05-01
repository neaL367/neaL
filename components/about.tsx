import { motion } from 'motion/react'
import { Paragraph } from './ui/paragraph'
import { AccessibleLink } from './ui/accessible-link'

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

export function About() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.section}
      transition={ANIMATION_TRANSITION}
      className="mt-[3rem] flex-1"
    >
      <Paragraph>
        I design and build intuitive, high-performance web experiences.
      </Paragraph>

      <Paragraph>
        Leveraging tools like{' '}
        <AccessibleLink href="https://react.dev/" external>
          React
        </AccessibleLink>
        ,{' '}
        <AccessibleLink href="https://nextjs.org/" external>
          Next.js
        </AccessibleLink>
        ,{' '}
        <AccessibleLink href="https://tailwindcss.com/" external>
          Tailwind CSS
        </AccessibleLink>
        , and{' '}
        <AccessibleLink href="https://ui.shadcn.com/" external>
          shadcn/ui
        </AccessibleLink>{' '}
        to deliver pixel-perfect solutions.
      </Paragraph>
      
      <Paragraph>
        studying at{' '}
        <AccessibleLink href="https://www.spu.ac.th/" external>
          Sripatum University
        </AccessibleLink>
        , and volunteering with{' '}
        <AccessibleLink href="https://goodgeek.club" external>
          GoodGeekClub
        </AccessibleLink>{' '}
        to empower our local tech community.
      </Paragraph>

      <Paragraph>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          Specialties:
        </span>{' '}
        TypeScript, server components, multilingual sites,
        <br /> clean, responsive interfaces, and a focus on craft and detail.
      </Paragraph>

      <Paragraph>
        I deploy my projects on{' '}
        <AccessibleLink href="https://vercel.com" external>
          Vercel
        </AccessibleLink>{' '}
        and{' '}
        <AccessibleLink href="https://aws.amazon.com" external>
          AWS
        </AccessibleLink>
        , and I regularly host workshops to share best practices in web
        development.
      </Paragraph>

      <Paragraph>
        off-screen, i play{' '}
        <AccessibleLink href="https://www.rockstargames.com/" external>
          Rockstar Games
        </AccessibleLink>{' '}
        and dream about making pixel-art games.
      </Paragraph>
    </motion.section>
  )
}
