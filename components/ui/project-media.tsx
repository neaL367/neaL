'use client'

import Image from 'next/image'
import { useState } from 'react'

type ProjectMediaProps = {
  src?: string
  title?: string
  description?: string
  hasLink?: boolean
}

export default function ProjectMedia({
  src,
  title,
  description,
  hasLink = true,
}: ProjectMediaProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt={title || 'Project preview'}
            className={`aspect-video h-full w-full object-cover transition-all duration-700 ${
              imageLoaded
                ? 'blur-0 scale-100 opacity-100'
                : 'scale-95 opacity-0 blur-sm'
            }`}
            width={300}
            height={300}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="flex aspect-video h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800/50">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {hasLink ? 'Image Not Available' : 'Coming Soon'}
            </p>
          </div>
        )}
      </div>

      {(title || description) && (
        <div className="mt-3">
          {title && (
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
