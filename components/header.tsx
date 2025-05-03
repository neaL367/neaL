'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export function Header() {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <>
      <header className="my-14 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <motion.div
            className="spect-square relative rounded-full cursor-pointer"
            whileHover={{
              scale: 1.075,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 1 }}
          >
            <Link href="/">
              <Image
                src="/avatar.png"
                alt="Atichat Thongnak"
                width={90}
                height={90}
                className={`avatar-image aspect-square object-cover rounded-full transition-all duration-700 ${
                  imageLoaded
                    ? 'blur-0 scale-100 opacity-100'
                    : 'scale-95 opacity-0 blur-sm'
                }`}
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                onLoad={() => setImageLoaded(true)}
              />
            </Link>
          </motion.div>
          <div>
            <div className="flex items-start gap-1.5">
              <Link
                href="/"
                className="group flex flex-col text-lg font-medium text-black transition-colors hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
              >
                <span className="font-semibold">Atichat Thongnak</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  @neaL367
                </span>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-1 h-5 w-5 text-yellow-500 dark:text-yellow-400"
                    aria-label="Verified"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.3393 0.582135C12.6142 -0.194045 11.3836 -0.194045 10.6584 0.582135L8.88012 2.48429C8.51756 2.8711 8.00564 3.0843 7.47584 3.06515L4.87538 2.97706C3.81324 2.94132 2.94259 3.81197 2.97834 4.87411L3.06642 7.47712C3.0843 8.00691 2.87238 8.51884 2.48429 8.88139L0.582135 10.6584C-0.194045 11.3836 -0.194045 12.6155 0.582135 13.3406L2.48429 15.1189C2.87238 15.4815 3.0843 15.9921 3.06642 16.5232L2.97706 19.1249C2.94259 20.1871 3.81324 21.0577 4.87538 21.022L7.47712 20.9339C8.00691 20.916 8.51884 21.1279 8.88139 21.5148L10.6584 23.4169C11.3848 24.1944 12.6155 24.1944 13.3419 23.4169L15.1202 21.5148C15.4815 21.1279 15.9934 20.9147 16.5232 20.9339L19.1249 21.022C20.1871 21.0577 21.059 20.1871 21.022 19.1249L20.9352 16.5219C20.916 15.9921 21.1292 15.4815 21.516 15.1189L23.4182 13.3406C24.1944 12.6155 24.1944 11.3836 23.4182 10.6584L21.516 8.88012C21.1292 8.51884 20.916 8.00691 20.9352 7.47584L21.022 4.87411C21.059 3.81197 20.1871 2.94132 19.1249 2.97706L16.5232 3.06642C15.9934 3.08302 15.4815 2.8711 15.1189 2.48429L13.3393 0.582135ZM5.91327 12.5402L10.2908 16.9164L17.5458 8.99374L15.8262 7.4018L10.2091 13.5232L7.56393 10.878L5.91327 12.5402Z"
                      fill="currentColor"
                    />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Official website of @neaL367</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
