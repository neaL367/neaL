'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function CoverImage({ src, alt }: { src: string; alt: string }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  return (
    <div className="relative w-full h-auto overflow-hidden border">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        className={`w-full h-auto transition-all duration-700 brightness-85 ${
          imageLoaded
            ? 'blur-0 opacity-100'
            : 'sopacity-0 blur-sm'
        }`}
        onLoad={() => setImageLoaded(true)}
        priority={true}
        sizes="(max-width: 768px) 100vw, 33vw"      />
    </div>
  )
}