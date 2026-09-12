export interface ConceptInfo {
  label: string;
  definition: string;
  category: string;
}

export const CONCEPTS: Record<string, ConceptInfo> = {
  accessibility: {
    label: 'Web Accessibility (a11y)',
    definition: 'Inclusive web design ensuring semantic HTML, proper contrast, keyboard navigability, and ARIA landmarks for screen readers.',
    category: 'web',
  },
  semantic: {
    label: 'Semantic HTML',
    definition: 'Using tags like <header>, <nav>, <main>, <article>, and <section> to provide meaningful structural hierarchy for browsers, screen readers, and search crawlers.',
    category: 'web',
  },
  ssr: {
    label: 'Server-Side Rendering (SSR)',
    definition: 'Generating HTML on the server dynamically per request. Improves first contentful paint and ensures full search engine indexing.',
    category: 'architecture',
  },
  ssg: {
    label: 'Static Site Generation (SSG)',
    definition: 'Compiling pages to static HTML at build time, served directly via global CDNs for minimal latency and cost.',
    category: 'architecture',
  },
  hydration: {
    label: 'Hydration',
    definition: 'The browser phase where React attaches event listeners and runtime state to pre-rendered HTML received from the server.',
    category: 'react',
  },
  tailwind: {
    label: 'Tailwind CSS',
    definition: 'A utility-first CSS framework enabling rapid composition of design systems directly within JSX markup with zero runtime overhead.',
    category: 'css',
  },
  zustand: {
    label: 'Zustand',
    definition: 'A lightweight, un-opinionated state management library for React using simple hooks without boilerplate context providers.',
    category: 'react',
  },
  trpc: {
    label: 'tRPC',
    definition: 'End-to-end type safety between client and server without code generation by sharing TypeScript type definitions directly.',
    category: 'architecture',
  },
  cicd: {
    label: 'CI/CD Pipelines',
    definition: 'Automated continuous integration (testing, linting) and continuous deployment workflows (e.g. GitHub Actions, Vercel) that validate and ship code reliably.',
    category: 'tools',
  },
  memoization: {
    label: 'Memoization',
    definition: 'An optimization technique that caches the return values of expensive pure functions keyed by input parameters.',
    category: 'performance',
  },
};
