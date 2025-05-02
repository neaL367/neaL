import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AnimatedUnderline } from './animated-underline'

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
        <AnimatedUnderline />
      </a>
    );
  }
  
  return (
    <Link href={href} className={linkClasses}>
      {children}
      <AnimatedUnderline />
    </Link>
  );
}
