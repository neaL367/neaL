'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
} from '@/components/ui/morphing-dialog'

type ProjectMediaProps = { src?: string; type: 'video' | 'image' }

export default function ProjectMedia({ src, type }: ProjectMediaProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [modalMediaLoaded, setModalMediaLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

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

  // Handle modal video loading
  useEffect(() => {
    if (isOpen && type === 'video' && modalVideoRef.current && src) {
      modalVideoRef.current.load()
    }
  }, [isOpen, src, type])

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open)
  }

  // Use the context directly to monitor open state changes
  useEffect(() => {
    if (isOpen !== undefined) {
      handleDialogChange(isOpen)
    }
  }, [isOpen])

  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
      <MorphingDialogTrigger>
        {type === 'video' ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className={`aspect-video h-full w-full rounded-xl transition-all duration-700 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={src || ''}
              alt="Project preview"
              className={`aspect-video w-full cursor-zoom-in rounded-xl object-cover transition-all duration-700 ${
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
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          {type === 'video' ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl md:h-[70vh]">
              {isOpen && (
                <video
                  ref={modalVideoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="aspect-video h-full w-full rounded-xl transition-all duration-700"
                >
                  <source src={src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : (
            <div className="relative flex h-[50vh] w-full items-center justify-center overflow-hidden md:h-[70vh]">
              <Image
                src={src || ''}
                alt="Project preview"
                className={`max-h-full max-w-full rounded-xl object-cover transition-all duration-700 ${
                  modalMediaLoaded
                    ? 'blur-0 scale-100 opacity-100'
                    : 'scale-95 opacity-0 blur-sm'
                }`}
                width={1200}
                height={800}
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={90}
                onLoad={() => setModalMediaLoaded(true)}
              />
              {!modalMediaLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
                </div>
              )}
            </div>
          )}
        </MorphingDialogContent>
        <MorphingDialogClose
          className="fixed top-6 right-6 h-fit w-fit rounded-full bg-white p-1 dark:bg-zinc-800"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay: 0.3, duration: 0.1 } },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}
