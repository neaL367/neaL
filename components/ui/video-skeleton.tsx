export default function VideoSkeleton() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"></div>
      </div>
    </div>
  )
}
