import { cn } from '@/lib/utils'

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p className={cn(
      "mb-4 text-zinc-700 dark:text-zinc-400", 
      className
    )}>
      {children}
    </p>
  );
}