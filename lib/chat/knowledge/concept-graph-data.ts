import type { ConceptNode, ConceptEdge } from '@/lib/chat/types';

export const CONCEPT_NODES: ConceptNode[] = [
  // Languages & Core
  {
    id: 'javascript',
    label: 'JavaScript',
    aliases: ['js', 'ecmascript', 'es6', 'es2020', 'vanilla js'],
    description: 'The dynamic scripting language powering web clients and servers.',
    category: 'languages',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    aliases: ['ts', 'tsc', 'static typing', 'type-safety'],
    description: 'A strongly typed superset of JavaScript that compiles to plain JS.',
    category: 'languages',
  },
  {
    id: 'closure',
    label: 'Closures',
    aliases: ['closure', 'lexical scope', 'variable capture'],
    description: 'Functions that preserve access to their enclosing lexical scope.',
    category: 'languages',
  },
  {
    id: 'event-loop',
    label: 'Event Loop',
    aliases: ['eventloop', 'microtask', 'macrotask', 'call stack'],
    description: 'The concurrency coordinator handling asynchronous I/O in JS runtimes.',
    category: 'languages',
  },
  {
    id: 'promises',
    label: 'Promises & Async/Await',
    aliases: ['promise', 'promises', 'thenable'],
    description: 'Modern asynchronous programming patterns in JavaScript.',
    category: 'languages',
  },

  // React Ecosystem
  {
    id: 'react',
    label: 'React',
    aliases: ['reactjs', 'react.js', 'react 19', 'react 18'],
    description: 'Declarative component-based UI library using a Virtual DOM and hooks.',
    category: 'frameworks',
  },
  {
    id: 'rsc',
    label: 'React Server Components',
    aliases: ['rsc', 'server components', 'server actions'],
    description: 'Components that render strictly on the server with 0 client bundle cost.',
    category: 'architecture',
  },
  {
    id: 'hooks',
    label: 'React Hooks',
    aliases: ['hooks', 'react hooks', 'usestate', 'useeffect', 'usememo', 'usecallback', 'usecontext', 'custom hooks'],
    description: 'Functions letting function components tap into state and lifecycles.',
    category: 'frameworks',
  },
  {
    id: 'hydration',
    label: 'Hydration',
    aliases: ['hydrate', 'rehydration', 'hydration mismatch'],
    description: 'Attaching browser event listeners to server-rendered static HTML.',
    category: 'performance',
  },
  {
    id: 'virtual-dom',
    label: 'Virtual DOM & Fiber',
    aliases: ['vdom', 'reconciliation', 'fiber engine', 'diffing'],
    description: 'In-memory UI representation diffed to apply minimal real DOM changes.',
    category: 'performance',
  },

  // Next.js & Fullstack
  {
    id: 'nextjs',
    label: 'Next.js',
    aliases: ['next', 'next.js', 'nextjs 16', 'nextjs 15', 'app router'],
    description: 'The React framework for production with SSR, RSC, and routing.',
    category: 'frameworks',
  },
  {
    id: 'ssr',
    label: 'Server-Side Rendering (SSR)',
    aliases: ['ssr', 'dynamic rendering', 'server render'],
    description: 'Generating HTML dynamically on the server for each request.',
    category: 'architecture',
  },
  {
    id: 'ssg',
    label: 'Static Site Generation (SSG)',
    aliases: ['ssg', 'static generation', 'prerendering'],
    description: 'Compiling pages to static assets at build time for instant CDN delivery.',
    category: 'architecture',
  },
  {
    id: 'streaming',
    label: 'Streaming & Suspense',
    aliases: ['streaming ssr', 'suspense streaming', 'chunked transfer'],
    description: 'Progressively streaming UI chunks from the server to client.',
    category: 'performance',
  },

  // Styling & UI
  {
    id: 'css',
    label: 'Modern CSS',
    aliases: ['css3', 'cascading style sheets', 'styles'],
    description: 'The styling language of the web with modern layout and animation APIs.',
    category: 'frameworks',
  },
  {
    id: 'tailwind',
    label: 'Tailwind CSS',
    aliases: ['tailwind', 'tailwindcss', 'utility classes'],
    description: 'Utility-first CSS framework for rapid, maintainable design systems.',
    category: 'tools',
  },
  {
    id: 'flexbox',
    label: 'CSS Flexbox',
    aliases: ['flexbox', 'flex layout', 'justify-content', 'align-items'],
    description: '1D layout system for distributing items along a single axis.',
    category: 'frameworks',
  },
  {
    id: 'grid',
    label: 'CSS Grid',
    aliases: ['css grid', 'grid layout', 'grid-template'],
    description: '2D layout system for controlling columns and rows concurrently.',
    category: 'frameworks',
  },

  // Web Standards & Security
  {
    id: 'cors',
    label: 'CORS',
    aliases: ['cors', 'cross-origin', 'preflight request'],
    description: 'Browser HTTP header mechanism restricting cross-origin resource access.',
    category: 'architecture',
  },
  {
    id: 'jwt',
    label: 'JSON Web Tokens (JWT)',
    aliases: ['jwt', 'bearer token', 'claims', 'auth token'],
    description: 'Stateless signed JSON payload for authentication and API tokens.',
    category: 'architecture',
  },
  {
    id: 'xss',
    label: 'Cross-Site Scripting (XSS)',
    aliases: ['xss', 'script injection', 'content-security-policy'],
    description: 'Security vulnerability where malicious scripts run in client context.',
    category: 'architecture',
  },
  {
    id: 'a11y',
    label: 'Web Accessibility (a11y)',
    aliases: ['accessibility', 'a11y', 'screen reader', 'aria', 'wai-aria'],
    description: 'Designing inclusive software accessible to users with diverse abilities.',
    category: 'architecture',
  },

  // Neal's Personal & Portfolio Domain
  {
    id: 'neal',
    label: 'Neal (Atichat)',
    aliases: ['neal', 'atichat', 'portfolio author', 'developer', 'creator'],
    description: 'Frontend engineer, UI architect, and creator of this portfolio.',
    category: 'personal',
  },
  {
    id: 'sripatum',
    label: 'Sripatum University',
    aliases: ['sripatum', 'spu', 'university', 'degree', 'education'],
    description: 'Neal’s university where he studies Software Engineering.',
    category: 'personal',
  },
  {
    id: 'tqm',
    label: 'TQM Internship & Co-op',
    aliases: ['tqm', 'tqm alpha', 'co-op', 'internship', 'insurance work'],
    description: 'Neal’s 4-month co-op engineering scalable web applications at TQM.',
    category: 'personal',
  },
  {
    id: 'vibe-coding',
    label: 'Vibe Coding Essay',
    aliases: ['vibe coding', 'vibe code', 'speed without comprehension'],
    description: 'Neal’s essay on finding balance between generative AI speed and engineering rigour.',
    category: 'personal',
  },
  {
    id: 'interstellar',
    label: 'Interstellar & Nolan Cinema',
    aliases: ['interstellar', 'christopher nolan', 'nolan', 'gargantua', 'sci-fi'],
    description: 'Christopher Nolan’s sci-fi masterpiece, a key cultural passion of Neal.',
    category: 'personal',
  },
];

export const CONCEPT_EDGES: ConceptEdge[] = [
  // TypeScript & JavaScript
  { from: 'typescript', to: 'javascript', relation: 'built-on', annotation: 'Superset with static type analysis' },
  { from: 'javascript', to: 'closure', relation: 'enables', annotation: 'Lexical scoping foundation' },
  { from: 'javascript', to: 'event-loop', relation: 'uses', annotation: 'Asynchronous single-threaded execution' },
  { from: 'javascript', to: 'promises', relation: 'enables', annotation: 'Modern non-blocking abstraction' },

  // React & Next.js
  { from: 'nextjs', to: 'react', relation: 'built-on', annotation: 'Production fullstack framework for React' },
  { from: 'react', to: 'rsc', relation: 'enables', annotation: 'Separates server-only and client computation' },
  { from: 'react', to: 'hooks', relation: 'uses', annotation: 'State and lifecycle hooks in function components' },
  { from: 'react', to: 'virtual-dom', relation: 'uses', annotation: 'Reconciliation and Fiber rendering' },
  { from: 'rsc', to: 'streaming', relation: 'uses', annotation: 'Progressive HTML and UI serialization' },
  { from: 'ssr', to: 'hydration', relation: 'enables', annotation: 'Client-side event binding to server markup' },
  { from: 'nextjs', to: 'ssr', relation: 'uses', annotation: 'Dynamic per-request page generation' },
  { from: 'nextjs', to: 'ssg', relation: 'uses', annotation: 'Build-time static asset pre-rendering' },

  // CSS & Layout
  { from: 'tailwind', to: 'css', relation: 'built-on', annotation: 'Compiles down to optimized pure CSS' },
  { from: 'css', to: 'flexbox', relation: 'enables', annotation: '1D layout alignment' },
  { from: 'css', to: 'grid', relation: 'enables', annotation: '2D row and column layout' },
  { from: 'flexbox', to: 'grid', relation: 'relates-to', annotation: 'Complementary layout primitives' },

  // Framework comparisons
  { from: 'react', to: 'angular', relation: 'contrasts-with', annotation: 'Unopinionated library vs opinionated framework' },

  // Security & Web
  { from: 'jwt', to: 'cors', relation: 'relates-to', annotation: 'Cross-origin authenticated communication' },
  { from: 'jwt', to: 'xss', relation: 'relates-to', annotation: 'Mitigated by storing tokens in HttpOnly cookies' },

  // Neal's Personal Domain
  { from: 'neal', to: 'nextjs', relation: 'uses', annotation: 'Core framework for Neal portfolio and apps' },
  { from: 'neal', to: 'typescript', relation: 'uses', annotation: 'Primary language across frontend & backend' },
  { from: 'neal', to: 'tailwind', relation: 'uses', annotation: 'Design system styling' },
  { from: 'neal', to: 'tqm', relation: 'relates-to', annotation: 'Professional co-op software internship' },
  { from: 'neal', to: 'sripatum', relation: 'relates-to', annotation: 'Computer Science academic background' },
  { from: 'neal', to: 'vibe-coding', relation: 'enables', annotation: 'Author of the influential essay' },
  { from: 'neal', to: 'interstellar', relation: 'relates-to', annotation: 'Favorite film and source of trivia' },
];
