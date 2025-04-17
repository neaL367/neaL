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
            As a dedicated front‑end developer and event organizer at
            GoodGeekClub, I drive community‑focused IT initiatives that both
            upskill participants and generate positive social impact.
          </p>

          <ul className="mb-4 ml-6 list-disc text-zinc-600 dark:text-zinc-400">
            <li>
              <span className="font-semibold dark:text-zinc-300/90 text-zinc-600">
                Led end‑to‑end web development
              </span>{' '}
              for{' '}
              <a
                href="https://qlhealthcarethailand.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block text-zinc-900 dark:text-zinc-300"
              >
                QL Healthcare Thailand
                <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
              </a>
              , architecting and deploying a WordPress site that enhanced
              visibility for healthcare providers and streamlined patient
              outreach.
            </li>
            <li>
              <span className="font-semibold dark:text-zinc-300/90 text-zinc-600">
                Co‑created “HopeIsApp”
              </span>{' '}
              a community‑driven social platform delivered in just two months. I
              implemented real‑time character interactions, dynamic quizzes, and
              a fully customizable UI powered by <code>daisyUI</code>, with
              client‑side progress persistence via local storage. (
              <a
                href="https://github.com/goodgeekclub/hopeisapp"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block text-zinc-900 dark:text-zinc-300"
              >
                GitHub
                <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
              </a>
              )
            </li>
            <li>
              <span className="font-semibold dark:text-zinc-300/90 text-zinc-600">
                Engineered and managed
              </span>{' '}
              the{' '}
              <a
                href="https://dseelin.co.th"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block text-zinc-900 dark:text-zinc-300"
              >
                dseelin.co.th
                <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
              </a>{' '}
              WordPress site on Plesk—integrating custom plugins and SEO best
              practices—and deployed a multilingual Next.js site for{' '}
              <a
                href="https://youthplusthailand.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block text-zinc-900 dark:text-zinc-300"
              >
                youthplusthailand.com
                <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span>
              </a>
              , leveraging <code>next‑intl</code> for seamless internationalization.
            </li>
            <li>
              <span className="font-semibold dark:text-zinc-300/90 text-zinc-600">
                Provisioned and maintained Amazon Linux 2 servers
              </span>
              —installed and configured LAMP stacks, set up SSL/TLS
              certificates, and hosted WordPress blogs on EC2 instances for
              secure, performant environments.
            </li>
            <li>
              <span className="font-semibold dark:text-zinc-300/90 text-zinc-600">
                Configured S3 static website hosting
              </span>
              —enabled website hosting on S3 buckets, specified index and custom
              error documents, implemented advanced JSON redirection rules, and
              validated endpoints via both the AWS console and CLI to deliver
              fast, reliable static sites.
            </li>
          </ul>
        </div>
      </div>
    </motion.section>
  )
}
