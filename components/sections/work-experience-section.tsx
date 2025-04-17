'use client'

import { motion } from 'framer-motion'
import { Spotlight } from '../ui/spotlight'

export function WorkExperienceSection() {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Work Experience
      </h3>
      <div className="flex flex-col space-y-2">
        <Spotlight
          className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
          size={64}
        />
        <div className="relative h-full w-full rounded-[15px] bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {/* Header: Company name and dates */}
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
              GoodGeekClub
            </h2>
            <small className="text-sm text-zinc-500 dark:text-zinc-400">
              Front-end developer, 2022 - Present
            </small>
          </div>
          {/* Detailed descriptions */}
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">
            I have been an active volunteer at GoodGeekClub, organizing various
            IT events to promote skill development and create a positive impact
            on society. My experience includes developing and deploying multiple
            websites using a range of technologies.
          </p>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">
            I built{' '}
            <a
              href="https://qlhealthcarethailand.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block text-zinc-900 dark:text-zinc-300"
            >
              QL Healthcare Thailand
              <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
            </a>
            , a healthcare-focused website on WordPress, providing an
            informative digital presence for healthcare services. Additionally,
            I contributed to{' '}
            <a
              href="https://hopeis.us/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block text-zinc-900 dark:text-zinc-300"
            >
              Hopeisapp
              <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
            </a>
            , a community-driven social platform developed by volunteers in just
            two months. This project features real-time character interactions,
            engaging quizzes, and a customizable theme system, leveraging
            daisyUI for an enhanced UI and local storage for saving progress.
            The source code is available on{' '}
            <a
              href="https://github.com/goodgeekclub/hopeisapp"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block text-zinc-900 dark:text-zinc-300"
            >
              GitHub
              <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
            </a>
            .
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Beyond these projects, I created a website with Plesk hosting and
            WordPress for{' '}
            <a
              href="https://dseelin.co.th"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block text-zinc-900 dark:text-zinc-300"
            >
              dseelin.co.th
              <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
            </a>{' '}
            and deployed a static web page using Next.js for{' '}
            <a
              href="https://youthplusthailand.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block text-zinc-900 dark:text-zinc-300"
            >
              youthplusthailand.com
              <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
            </a>
            , implementing an internationalization feature with next-intl. I
            also hosted static web pages on Amazon Web Services, utilizing
            CloudFront, S3, and EC2 to ensure scalability and performance.
          </p>
        </div>
      </div>
    </motion.section>
  )
}
