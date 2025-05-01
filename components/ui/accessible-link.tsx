import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccessibleLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function AccessibleLink({ 
  href, 
  children, 
  className, 
  external = false 
}: AccessibleLinkProps) {
  const linkClasses = cn(
    "group relative inline-flex items-center gap-1 font-medium",
    "text-zinc-900 dark:text-zinc-200",
    "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2",
    "underline decoration-1 underline-offset-2 decoration-zinc-400/50 dark:decoration-zinc-500/50",
    "hover:decoration-zinc-900 dark:hover:decoration-zinc-200",
    className
  );
  
  if (external || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a 
        href={href}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link href={href} className={linkClasses}>
      {children}
    </Link>
  );
}