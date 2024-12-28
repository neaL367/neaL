import { cn } from "@/lib/utils"
import { ContentType } from "@/lib/mdx"

interface ContentLayoutProps {
  children: React.ReactNode
  type: ContentType
}

const typeStyles: Record<ContentType, string> = {
  p: "prose-pre:bg-[#0d1117]",
  n: "prose-blockquote:border-l-yellow-500",
  b: "prose-a:text-blue-500 hover:prose-a:text-blue-600"
}

export function ContentLayout({ children, type }: ContentLayoutProps) {
  return (
    <article 
      className={cn(
        "container py-6 lg:py-12 max-w-full flex justify-center",
        "prose prose-gray dark:prose-invert",
        "prose-headings:scroll-mt-28 prose-headings:font-bold prose-headings:tracking-tight",
        "prose-lead:text-muted-foreground",
        "prose-a:font-medium prose-a:underline prose-a:underline-offset-4",
        "prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic",
        "prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc",
        "prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal",
        "prose-hr:my-4 prose-hr:border-border",
        typeStyles[type]
      )}
    >
      <div className="max-w-3xl">
        {children}
      </div>
    </article>
  )
}

