'use client'

export default function VideoSkeleton() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-700" />
    </div>
  )
}
