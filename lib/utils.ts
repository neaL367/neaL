import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Processes HTML strings to add animated underline styling to links
 */
export function processHtmlWithAnimatedLinks(html: string): string {
  return html.replace(
    /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
    '<a href="$1" class="group relative text-zinc-900 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">$2<span class="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100"></span></a>'
  );
}
