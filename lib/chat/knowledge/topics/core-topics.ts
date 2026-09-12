import type { DetailedTopic } from './types';

export const CORE_TOPICS: DetailedTopic[] = [
  {
    id: 'javascript',
    keywords: ['javascript', 'js', 'ecmascript', 'es6', 'es2020', 'vanilla js', 'v8 engine'],
    title: 'JavaScript',
    summary: 'JavaScript is the dynamic, multi-paradigm programming language powering web clients and servers, featuring first-class functions, prototypal inheritance, and an event-driven concurrency model.',
    detail: `### JavaScript: Core Engine & Runtime

JavaScript executes as a single-threaded, JIT-compiled language with an asynchronous event-driven concurrency model.

\`\`\`javascript
// Modern JavaScript highlights: first-class functions, closures, and async flow
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchUserData(userId) {
  const [profile, preferences] = await Promise.all([
    fetch(\`/api/users/\${userId}\`).then(r => r.json()),
    fetch(\`/api/users/\${userId}/prefs\`).then(r => r.json()),
  ]);
  return { ...profile, preferences };
}
\`\`\`

**Key Architectural Fundamentals:**
- **V8 / JavaScriptCore Engine:** Code is parsed into an Abstract Syntax Tree (AST), compiled by Ignition to bytecode, and optimized via TurboFan JIT into machine code.
- **Prototypal Inheritance:** Objects link directly to other prototype objects rather than inheriting through classical static class tables.
- **Non-blocking I/O:** The Event Loop coordinates the synchronous Call Stack, Microtask queue (Promises), and Macrotask queue (timers, I/O).`,
    level: 'intermediate',
    relatedConcepts: ['closure', 'event-loop', 'prototype', 'typescript'],
    category: 'javascript',
  },
  {
    id: 'typescript',
    keywords: ['typescript', 'ts', 'tsc', 'static typing', 'type-safety', 'type checker'],
    title: 'TypeScript',
    summary: 'TypeScript is a strongly typed superset of JavaScript that compiles to plain JS, providing static type-checking, structural subtyping, and compile-time correctness guarantees.',
    detail: `### TypeScript: Type-Safe Engineering

TypeScript eliminates an entire class of runtime errors by validating types ahead-of-time at compile time with zero runtime overhead.

\`\`\`typescript
// Structural subtyping and discriminated unions
type AsyncResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleResult<T>(result: AsyncResult<T>): T {
  if (result.status === 'success') {
    return result.data; // TypeScript narrows type to success
  }
  throw result.error;
}
\`\`\`

**Why Neal Uses TypeScript:**
- **Zero Runtime Cost:** All interfaces and type annotations are completely erased during compilation to standard JS.
- **Refactoring Confidence:** Large codebases can be refactored safely with instantaneous compiler verification.
- **Discriminated Unions & Generics:** Enables expressively modeling complex domain states and API contracts.`,
    level: 'intermediate',
    relatedConcepts: ['javascript', 'generics', 'type-narrowing'],
    category: 'typescript',
  },
  {
    id: 'react',
    keywords: ['react', 'reactjs', 'virtual dom', 'components', 'fiber', 'ui library'],
    title: 'React',
    summary: 'React is a declarative, component-based UI library that updates interfaces efficiently through a Virtual DOM and fiber reconciliation algorithm.',
    detail: `### React Component Architecture

React models web user interfaces as pure functions of state: \`UI = f(state)\`.

\`\`\`tsx
import { useState, useTransition } from 'react';

export function SearchFilter() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (val: string) => {
    setQuery(val);
    startTransition(() => {
      // Non-blocking UI transition
    });
  };

  return <input value={query} onChange={e => handleSearch(e.target.value)} />;
}
\`\`\`

**Core Architectural Tenets:**
- **Unidirectional Data Flow:** State flows down through props, while events flow up via callbacks, making state predictable and easy to debug.
- **Fiber Reconciliation:** The scheduler splits rendering work into incremental units that can be paused, prioritized, or aborted.
- **React 19 Server Components:** Unifies client interactivity with server-first rendering for zero client bundle bloat.`,
    level: 'intermediate',
    relatedConcepts: ['rsc', 'hooks', 'hydration', 'nextjs'],
    category: 'react',
  },
  {
    id: 'nextjs',
    keywords: ['next.js', 'nextjs', 'app router', 'server actions', 'pages router', 'ssr', 'ssg'],
    title: 'Next.js Framework',
    summary: 'Next.js is the full-stack React framework providing hybrid static and server rendering, App Router architecture, automatic code splitting, and server-side streaming.',
    detail: `### ▲ Next.js & App Router

Next.js provides the production infrastructure for modern React applications, integrating Server Components, streaming, and edge caching out of the box.

\`\`\`tsx
// App Router Server Component with dynamic data fetch
export default async function ProfilePage({ params }: { params: { id: string } }) {
  // Directly fetch on the server — 0 client JS bundle footprint
  const res = await fetch(\`https://api.example.com/users/\${params.id}\`, {
    next: { revalidate: 60 }, // Incremental Static Regeneration
  });
  const user = await res.json();

  return <section><h1>{user.name}</h1></section>;
}
\`\`\`

**Neal’s Core Next.js Stack Patterns:**
- **App Router Architecture:** Colocated layouts, loading states (\`loading.tsx\`), and error boundaries (\`error.tsx\`).
- **Server Actions:** Type-safe mutations directly from client forms to server functions without writing manual REST endpoints.
- **Partial Prerendering (PPR):** Statically prerender shells while dynamically streaming personalized content.`,
    level: 'intermediate',
    relatedConcepts: ['react', 'rsc', 'ssr', 'ssg'],
    category: 'architecture',
  },
  {
    id: 'hooks',
    keywords: ['hooks', 'react hooks', 'usestate', 'useeffect', 'usememo', 'usecallback', 'custom hooks'],
    title: 'React Hooks',
    summary: 'React Hooks let functional components encapsulate state and side effects through simple functions, replacing legacy class lifecycle methods.',
    detail: `### React Hooks Under the Hood

Hooks rely on an array (linked list) of memoized cells stored on the component’s internal fiber node, preserved across renders by call order.

\`\`\`tsx
import { useState, useEffect } from 'react';

export function useWindowDimensions() {
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  return dims;
}
\`\`\`

**The Golden Rules of Hooks:**
1. **Call Hooks Only at the Top Level:** Never call hooks inside loops, conditions, or nested functions to preserve execution index.
2. **Call Hooks Only from React Functions:** Call them from React functional components or custom hooks.`,
    level: 'intermediate',
    relatedConcepts: ['react', 'closure', 'memoization'],
    category: 'react',
  },
  {
    id: 'streaming',
    keywords: ['streaming', 'suspense', 'progressive rendering', 'chunked transfer', 'sse'],
    title: 'Streaming & Progressive Rendering',
    summary: 'Streaming breaks HTML and data responses into progressive chunks sent via HTTP chunked transfer encoding, dramatically reducing Time to First Byte (TTFB).',
    detail: `### Streaming & Progressive Hydration

Rather than waiting for the slowest database query to resolve before sending the initial HTML, streaming sends the fast static shell immediately and streams dynamic widgets as they resolve.

\`\`\`tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard Shell (Sent Immediately)</h1>
      <Suspense fallback={<Skeleton className="h-32" />}>
        <SlowAnalyticsWidget />
      </Suspense>
    </main>
  );
}
\`\`\`

**How Nara Uses Streaming:**
- The chat interface uses a native \`ReadableStream\` over Server-Sent Events (SSE), delivering tokens and citations with natural conversational cadence in real time.`,
    level: 'intermediate',
    relatedConcepts: ['nextjs', 'rsc', 'ssr'],
    category: 'architecture',
  },
  {
    id: 'css',
    keywords: ['css', 'modern css', 'flexbox', 'grid', 'subgrid', 'container queries', 'cascade'],
    title: 'Modern CSS',
    summary: 'Modern CSS provides powerful layout primitives (Grid, Flexbox, Subgrid), Container Queries, Custom Properties, and Cascade Layers directly without runtime overhead.',
    detail: `### Modern CSS Architecture

Modern CSS has evolved into a fully expressive styling engine with native nesting, container queries, and subgrid.

\`\`\`css
/* Container queries adapt cards based on parent container width */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
  }
}
\`\`\`

**Core Primitives:**
- **CSS Grid vs Flexbox:** Flexbox handles 1-dimensional axis distribution; Grid handles 2-dimensional coordinated matrix alignments.
- **Container Queries:** Replaces viewport-bound media queries with container-bound responsiveness for truly modular UI components.
- **Tailwind & Utility CSS:** Compiles modern CSS with zero runtime bundle overhead.`,
    level: 'intermediate',
    relatedConcepts: ['tailwind', 'semantic', 'accessibility'],
    category: 'css',
  },
  {
    id: 'promises',
    keywords: ['promises', 'async-await', 'async', 'await', 'thenable', 'microtask'],
    title: 'Promises & Async/Await',
    summary: 'Promises represent the eventual completion or failure of an asynchronous operation, executed on the microtask queue for non-blocking asynchronous programming.',
    detail: `### Asynchronous JavaScript: Promises & Async/Await

Async/await provides clean sequential syntax over underlying Promise state machines (\`pending\`, \`fulfilled\`, \`rejected\`).

\`\`\`javascript
async function executeWork() {
  try {
    const result = await Promise.race([
      fetch('/api/data').then(r => r.json()),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    return result;
  } catch (err) {
    console.error('Operation failed:', err);
  }
}
\`\`\`

**Key Execution Rules:**
- **Microtask Priority:** Promise resolution callbacks (\`.then()\`, \`await\`) drain on the microtask queue before the browser processes the next macrotask (\`setTimeout\`, DOM render).
- **Concurrency Combinators:** Use \`Promise.allSettled\` for resilient multi-request fetching that doesn't short-circuit on a single failure.`,
    level: 'intermediate',
    relatedConcepts: ['event-loop', 'javascript'],
    category: 'javascript',
  },
];
