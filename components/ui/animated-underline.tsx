import { cn } from '@/lib/utils'

interface AnimatedUnderlineProps {
  className?: string
}

export function AnimatedUnderline({ className }: AnimatedUnderlineProps) {
  return (
    <span 
      className={cn(
        "absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100",
        className
      )} 
    />
  )
}