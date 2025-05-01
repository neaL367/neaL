'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

type ProjectMediaProps = { 
  src?: string; 
  type: 'video' | 'image';
  title?: string;
  description?: string;
}

export default function ProjectMedia({ src, type, title, description }: ProjectMediaProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle video loading
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      const video = videoRef.current

      // Only start loading when in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Set the src only when in viewport
              if (video.querySelector('source')?.src !== src) {
                const source = video.querySelector('source')
                if (source) {
                  source.src = src || ''
                  video.load()
                }
              }
              observer.unobserve(video)
            }
          })
        },
        { threshold: 0.1 },
      )

      observer.observe(video)

      // Handle loaded data event
      const handleLoadedData = () => setIsVideoLoaded(true)
      video.addEventListener('loadeddata', handleLoadedData)

      return () => {
        observer.disconnect()
        video.removeEventListener('loadeddata', handleLoadedData)
      }
    }
  }, [src, type])

  return (
    <div className="w-full">
      {type === 'video' ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            aria-label={title || "Project video"}
            className={`aspect-video h-full w-full transition-all duration-700 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source type="video/mp4" />
            <track 
              kind="captions" 
              label="English" 
              srcLang="en"
              default 
            />
            Your browser does not support the video tag.
          </video>
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={src || ''}
            alt={title || "Project preview"}
            className={`aspect-video h-full w-full object-cover transition-all duration-700 ${
              mediaLoaded
                ? 'blur-0 scale-100 opacity-100'
                : 'scale-95 opacity-0 blur-sm'
            }`}
            width={300}
            height={300}
            loading="lazy"
            onLoad={() => setMediaLoaded(true)}
          />
          {!mediaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
            </div>
          )}
        </div>
      )}
      
      {(title || description) && (
        <div className="mt-3">
          {title && <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
        </div>
      )}
    </div>
  )
}



