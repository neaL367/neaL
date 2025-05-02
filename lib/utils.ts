import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Processes HTML strings to add animated underline styling to links
 * Uses styling consistent with AccessibleLink component
 */
export function processHtmlWithAnimatedLinks(html: string): string {
  return html.replace(
    /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
    (_, href, text) => {
      const isExternal = href.startsWith('http') || href.startsWith('mailto:');
      const baseClasses = "group relative inline-flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-200";
      
      return `<a href="${href}" class="${baseClasses}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        ${text}
        <span class="absolute bottom-0 left-0 h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-100" aria-hidden="true"></span>
      </a>`;
    }
  );
}


