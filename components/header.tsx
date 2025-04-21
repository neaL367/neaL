'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

import { TextEffect } from '@/components/ui/text-effect'
import { TextLoop } from '@/components/ui/text-loop'

export function Header() {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <Link href="/">
          <motion.div
            className="relative h-[85px] w-[85px] cursor-pointer"
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 1 }}
          >
            <Image
              src="/avatar.png"
              alt="Atichat Thongnak"
              width={85}
              height={85}
              className={`avatar-image aspect-square rounded-full object-cover transition-all duration-700 ${
                imageLoaded
                  ? 'blur-0 scale-100 opacity-100'
                  : 'scale-95 opacity-0 blur-sm'
              }`}
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={75}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        </Link>
        <div>
          <Link
            href="/"
            className="text-lg font-medium text-black dark:text-white"
          >
            <TextLoop transition={{ duration: 0.3 }} interval={3}>
              <span>Atichat Thongnak</span>
              <span>neaL367</span>
            </TextLoop>
          </Link>
          <TextEffect
            as="p"
            preset="fade"
            per="char"
            className="text-zinc-600 dark:text-zinc-500"
            delay={0.5}
          >
            Front-end developer
          </TextEffect>
        </div>
      </div>
    </header>
  )
}
