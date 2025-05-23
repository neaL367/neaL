import type { MDXComponents } from 'mdx/types'
import CoverImage from './components/ui/cover-image'
import { AccessibleLink } from './components/ui/accessible-link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children }) => (
      <h1 className="mb-6 text-xl font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 scroll-m-20 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="mb-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-zinc-500 dark:text-zinc-400">{children}</p>
    ),
    a: ({ href, children }) => (
      <AccessibleLink
        href={href || '#'}
        className="text-zinc-900 no-underline dark:text-zinc-100"
      >
        {children}
      </AccessibleLink>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 ml-4 list-outside list-disc text-zinc-600 dark:text-zinc-400">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-6 list-decimal text-zinc-600 dark:text-zinc-400">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-l-2 border-zinc-300 pl-4 text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        {children}
      </pre>
    ),
    hr: () => (
      <hr className="relative my-8 h-px w-full overflow-hidden border-0 bg-transparent before:absolute before:left-1/2 before:h-px before:w-[99vw] before:-translate-x-1/2 before:bg-zinc-100 before:content-[''] dark:before:bg-zinc-800" />
    ),
    strong: ({ children }) => <strong className="font-base">{children}</strong>,
    Cover: ({
      src,
      alt,
      caption,
    }: {
      src: string
      alt: string
      caption: string
    }) => {
      return (
        <figure className="my-8">
          <CoverImage src={src} alt={alt} />
          <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {caption}
          </figcaption>
        </figure>
      )
    },
  }
}
