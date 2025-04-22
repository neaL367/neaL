import { cn } from "@/lib/utils"

interface HorizontalRuleProps {
  className?: string
}

export function HorizontalRule({ className }: HorizontalRuleProps) {
  return (
    <hr 
      className={cn(
        "relative h-px w-full overflow-visible border-0 bg-transparent before:absolute before:left-1/2 before:h-px before:w-[99vw] before:-translate-x-1/2 before:bg-zinc-200 before:content-[''] dark:before:bg-zinc-800 before:transition-all before:ease-out before:duration-1000",
        className
      )} 
    />
  )
}