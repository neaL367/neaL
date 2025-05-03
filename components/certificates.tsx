import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { CERTIFICATES } from '@/app/data/certificates'

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

export function Certificates() {
  return (
    <motion.section
      variants={ANIMATION_VARIANTS.container}
      transition={ANIMATION_TRANSITION}
    >
      <h3 className="mb-6 text-xl font-medium text-zinc-900 dark:text-zinc-100">
        Certificates
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CERTIFICATES.map((certificate, index) => (
          <Link
            key={index}
            href={certificate.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 border border-zinc-200 p-4 transition-all ease-in-out duration-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full">
              {certificate.logo ? (
                <Image
                  src={certificate.logo}
                  alt={certificate.issuer}
                  width={24}
                  height={24}
                  className="size-6 invert-0 transition-all duration-500 ease-out dark:invert"
                />
              ) : (
                <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {certificate.issuer.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {certificate.title}
                </h4>
                <ExternalLink className="size-4 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                {certificate.issuer} • {certificate.date}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}

