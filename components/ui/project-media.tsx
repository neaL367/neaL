'use client'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
} from '@/components/ui/morphing-dialog'
import { XIcon } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'

type ProjectMediaProps = { src?: string; type: 'video' | 'image' }

export default function ProjectMedia({ src, type }: ProjectMediaProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [modalMediaLoaded, setModalMediaLoaded] = useState(false)
  const isOpen = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
      <MorphingDialogTrigger>
        {type === 'video' ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <video
              ref={videoRef}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video h-full w-full rounded-xl transition-all duration-700"
            />
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
              onLoad={() => setMediaLoaded(true)}
            />
          </div>
        )}
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          {type === 'video' ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl md:h-[70vh]">
              {isOpen && (
                <video
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="aspect-video h-full w-full rounded-xl transition-all duration-700"
                />
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

