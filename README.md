# Neal — Portfolio Site

A Next.js 16 App Router personal portfolio and blog.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Content**: MDX via `@next/mdx`
- **Typography & Font**: Faculty Glyphic (`next/font/google`)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)

## Getting Started

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
bun run lint
```

## Structure

- `app/` — Next.js App Router layout, pages, RSS feed, sitemap, and metadata.
- `app/writing/posts/` — MDX articles and blog posts.
- `components/` — Reusable UI and layout components (smooth scroll provider, custom links, code blocks).
