'use client'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export function Header() {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="relative h-[85px] w-[85px]">
          <Image
            src="/avatar.png"
            alt="Atichat Thongnak"
            width={85}
            height={85}
            className={`aspect-square rounded-full object-cover transition-all duration-700 ${
              imageLoaded 
                ? 'opacity-100 scale-100 blur-0' 
                : 'opacity-0 scale-95 blur-sm'
            }`}
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={75}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div>
          <Link href="/" className="font-medium text-lg text-black dark:text-white">
            Atichat Thongnak
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
