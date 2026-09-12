import type { DetailedTopic } from './types';

export const WEB_FRAMEWORK_TOPICS: DetailedTopic[] = [
  {
    id: 'usestate',
    keywords: ['usestate', 'setstate', 'state', 'hook', 'batching', 'updater function'],
    title: 'React useState & State Batching',
    summary: 'useState adds reactive local state to function components. In React 18 and 19, multiple state updates are automatically batched across all event handlers and microtasks.',
    detail: `### React useState

\`\`\`tsx
const [count, setCount] = useState(0);

// Updater function pattern for consecutive updates:
function handleClick() {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  // count increments by 2 safely
}
\`\`\`

**React 18+ Batching:** Automatic batching groups state updates inside Promises, setTimeout, and native events into a single re-render pass for maximum UI performance.`,
    level: 'beginner',
    relatedConcepts: ['useeffect', 'virtual-dom'],
    category: 'react',
  },
  {
    id: 'useeffect',
    keywords: ['useeffect', 'effect', 'lifecycle', 'cleanup', 'dependency', 'mount', 'subscription'],
    phrases: ['side effects', 'side effect', 'render', 'after render', 'synchronize with external systems', 'run after render'],
    title: 'React useEffect & Lifecycle Management',
    summary: 'useEffect synchronizes a component with an external system. Dependency arrays dictate re-execution, and returned cleanup functions prevent memory leaks on unmount.',
    detail: `### React useEffect

\`\`\`tsx
useEffect(() => {
  let isCancelled = false;

  async function loadData() {
    const data = await api.fetchItem(id);
    if (!isCancelled) setItem(data);
  }

  loadData();

  // Cleanup runs before next effect execution and on component unmount
  return () => {
    isCancelled = true;
  };
}, [id]);
\`\`\`

**Golden Rule:** Don't use \`useEffect\` for computing derived state from props or handling user events; use pure expressions or event handlers instead.`,
    level: 'beginner',
    relatedConcepts: ['usestate', 'usecallback-usememo'],
    category: 'react',
  },
  {
    id: 'usecallback-usememo',
    keywords: ['usecallback', 'usememo', 'memo', 'memoize', 'optimization', 'referential equality'],
    title: 'useCallback, useMemo & Referential Equality',
    summary: 'useMemo caches computationally heavy values; useCallback stabilizes function references across renders to prevent unnecessary re-renders in memoized children.',
    detail: `### Performance: useMemo & useCallback

\`\`\`tsx
// Caches expensive calculation:
const filteredList = useMemo(() => {
  return items.filter(item => heavyFilter(item, query));
}, [items, query]);

// Preserves referential equality of callback passed to memoized child:
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
\`\`\`

*Note:* React 19's React Compiler automates much of this memoization by analyzing component graphs at build time!`,
    level: 'intermediate',
    relatedConcepts: ['virtual-dom'],
    category: 'react',
  },
  {
    id: 'useref',
    keywords: ['useref', 'ref', 'dom', 'mutable', 'focus', 'instance variable'],
    title: 'React useRef & Escape Hatches',
    summary: 'useRef creates a mutable object whose .current property persists across re-renders without triggering a re-render when mutated. Used for DOM access and mutable instance values.',
    detail: `### React useRef

\`\`\`tsx
function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return <input ref={inputRef} placeholder="Search..." />;
}
\`\`\``,
    level: 'beginner',
    relatedConcepts: ['usestate'],
    category: 'react',
  },
  {
    id: 'context',
    keywords: ['context', 'usecontext', 'provider', 'prop drilling', 'global state'],
    title: 'React Context API',
    summary: 'Context allows data to be passed down the component tree without prop drilling. Best suited for low-frequency global settings like themes, locale, and authentication.',
    detail: `### React Context API

\`\`\`tsx
const ThemeContext = createContext<'light' | 'dark'>('dark');

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

// In React 19, <Context value={...}> can be used directly without .Provider!
\`\`\``,
    level: 'intermediate',
    relatedConcepts: ['usestate'],
    category: 'react',
  },
  {
    id: 'virtual-dom',
    keywords: ['virtual', 'dom', 'vdom', 'reconciliation', 'diffing', 'fiber', 'react 19'],
    title: 'Virtual DOM & React Reconciliation',
    summary: 'React maintains an in-memory Virtual DOM tree. When state changes, reconciliation computes the minimal diff against the previous tree to surgically mutate the real DOM.',
    detail: `### Virtual DOM & React Fiber

1. **Render Phase:** Evaluates JSX components and generates a virtual DOM tree (pure, interruptible by Fiber in concurrent mode).
2. **Reconciliation:** Diffs the new tree against the old tree using heuristics (e.g. \`key\` attributes).
3. **Commit Phase:** Synchronously updates the real browser DOM with minimal DOM mutations.`,
    level: 'intermediate',
    relatedConcepts: ['rsc', 'usestate'],
    category: 'react',
  },
  {
    id: 'rsc',
    keywords: ['server component', 'rsc', 'client component', 'streaming', 'hydration', 'nextjs', 'suspense'],
    title: 'React Server Components (RSC) vs Client Components',
    summary: 'RSC run exclusively on the server, contributing 0 KB to client JavaScript bundles and allowing direct database/filesystem access. Client components handle browser interactivity.',
    detail: `### Server Components vs Client Components

| Metric | Server Component (Default) | Client Component (\`'use client'\`) |
|---|---|---|
| **Bundle Size** | **0 KB** shipped to browser | Included in client JS bundle |
| **Data Access** | Direct DB / filesystem access | Must fetch over network API |
| **React Hooks** |  None (\`useState\`, etc.) |  Full access |
| **Browser APIs** |  No \`window\` / \`document\` |  Full access |

\`\`\`tsx
// app/page.tsx (Server Component)
import { Suspense } from 'react';
import { InteractiveFilter } from './filter';

export default async function FeedPage() {
  const posts = await db.posts.findMany(); // Direct database query!
  return (
    <main>
      <h1>Portfolio Feed</h1>
      <InteractiveFilter /> {/* Interactive leaf node */}
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </main>
  );
}
\`\`\``,
    level: 'expert',
    relatedConcepts: ['virtual-dom', 'ssr'],
    category: 'react',
  },
  {
    id: 'flexbox',
    keywords: ['flexbox', 'flex', 'justify-content', 'align-items', 'flex-direction', 'gap'],
    title: 'CSS Flexbox Layout',
    summary: 'Flexbox is a one-dimensional layout model designed for distributing space and aligning items along a main axis and cross axis.',
    detail: `### CSS Flexbox

\`\`\`css
.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* Main axis */
  align-items: center;            /* Cross axis */
  gap: 1rem;
}
\`\`\`

**Rule of Thumb:** Use Flexbox for linear item distribution (toolbars, navigation bars, badge rows) and 1D alignment.`,
    level: 'beginner',
    relatedConcepts: ['grid'],
    category: 'css',
  },
  {
    id: 'grid',
    keywords: ['grid', 'css-grid', 'grid-template-columns', 'grid-template-areas', 'subgrid'],
    title: 'CSS Grid Layout',
    summary: 'CSS Grid is a two-dimensional layout system that handles both columns and rows simultaneously, ideal for complex application layouts and responsive card galleries.',
    detail: `### CSS Grid

\`\`\`css
/* Auto-responsive card gallery without media queries */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\`

**Synergy:** Use CSS Grid for the macro layout of the page, and Flexbox for micro-components within individual grid cells.`,
    level: 'beginner',
    relatedConcepts: ['flexbox'],
    category: 'css',
  },
  {
    id: 'cors',
    keywords: ['cors', 'cross-origin', 'preflight', 'access-control-allow-origin', 'options'],
    title: 'CORS (Cross-Origin Resource Sharing)',
    summary: 'CORS is a browser security mechanism that restricts cross-origin HTTP requests unless the server explicitly grants permission via HTTP response headers.',
    detail: `### CORS & Browser Security

Browsers enforce the Same-Origin Policy (Protocol + Domain + Port). When fetching across origins:
1. **Simple Requests (GET/POST with standard headers):** Sent directly; browser blocks reading response if \`Access-Control-Allow-Origin\` is missing.
2. **Preflighted Requests (PUT, DELETE, custom headers like Bearer):** Browser first sends an \`OPTIONS\` request to ask server permissions before executing the actual request.`,
    level: 'intermediate',
    relatedConcepts: ['http-methods', 'jwt'],
    category: 'web',
  },
  {
    id: 'jwt',
    keywords: ['jwt', 'json web token', 'token', 'bearer', 'claims', 'signature', 'httponly'],
    title: 'JWT (JSON Web Tokens) & Secure Auth',
    summary: 'JWTs are compact, cryptographically signed tokens containing claims. Best stored in HttpOnly, Secure, SameSite cookies to mitigate XSS and CSRF risks.',
    detail: `### JSON Web Tokens (JWT)

A JWT contains 3 base64url-encoded parts separated by dots:
\`Header.Payload.Signature\`

- **Header:** Algorithm & token type (e.g., HS256, RS256).
- **Payload:** User claims (e.g., \`userId\`, \`role\`, \`exp\`).
- **Signature:** Hash of Header + Payload verified by the server's private secret.

**Security Best Practice:** Store auth tokens in \`HttpOnly\`, \`Secure\`, \`SameSite=Lax/Strict\` cookies. Storing sensitive JWTs in \`localStorage\` exposes them to XSS exfiltration.`,
    level: 'intermediate',
    relatedConcepts: ['xss', 'cookies-storage'],
    category: 'web',
  },
  {
    id: 'xss',
    keywords: ['xss', 'cross-site scripting', 'sanitization', 'csp', 'security', 'dangerouslysetinnerhtml'],
    title: 'XSS (Cross-Site Scripting) Defense',
    summary: 'XSS occurs when malicious scripts are injected into trusted websites. Mitigated by context-aware escaping, Content Security Policy (CSP), and avoiding unsafe innerHTML injections.',
    detail: `### XSS Prevention Strategies

1. **Auto-Escaping:** React automatically escapes values embedded in JSX expressions \`{userInput}\`.
2. **Avoid Unsafe Injection:** Strictly avoid \`dangerouslySetInnerHTML\` unless sanitized with DOMPurify.
3. **Content Security Policy (CSP):** Restrict executable script sources in HTTP response headers.
4. **Cookie Flags:** Mark session cookies as \`HttpOnly\` so JavaScript cannot read session tokens even if an XSS flaw exists.`,
    level: 'intermediate',
    relatedConcepts: ['jwt', 'cors'],
    category: 'web',
  },
  {
    id: 'react-19',
    keywords: ['react 19', 'react19', 'latest features in react 19', 'react 19 features', 'useactionstate', 'useformstatus', 'react compiler', 'use hook'],
    title: 'React 19 New Features',
    summary: 'React 19 introduces the React Compiler for automatic memoization, Actions and async form handling, the new use hook, Server Components, and native document metadata.',
    detail: `### React 19 Overview

React 19 brings foundational improvements to frontend development:

- **React Compiler**: An automatic optimizing compiler that analyzes JavaScript semantics to memoize computations and components automatically, eliminating manual \`useMemo\` and \`useCallback\`.
- **Actions & Async Transitions**: Native support for handling async functions in transitions, with automatic pending states, optimistic updates, and error handling.
- **New Hooks**:
  - \`useActionState\`: Manages async action lifecycle with pending flags and return values.
  - \`useFormStatus\`: Allows child form components to read parent form submission status without prop drilling.
  - \`useOptimistic\`: Manages optimistic UI updates while async operations resolve.
- **The \`use\` Hook**: Dynamically reads resources like promises and context during render, including conditional usage inside loops and if-statements.
- **Native Document Metadata**: Built-in support for \`<title>\`, \`<meta>\`, and stylesheet link tags directly in components with automatic hoisting to \`<head>\`.
- **Server Components & Server Actions**: Stable, first-class primitives for running server-only code with zero client bundle impact.`,
    level: 'expert',
    relatedConcepts: ['rsc', 'usestate', 'virtual-dom'],
    category: 'react',
  },
  {
    id: 'angular',
    keywords: ['angular', 'angularjs', 'angular framework', 'dependency injection', 'opinionated framework'],
    title: 'Angular Framework',
    summary: 'Angular suits projects needing strict architectural discipline across large teams: opinionated structure, built-in dependency injection, and comprehensive tooling.',
    detail: `### Angular Framework

When a project requires strict architectural discipline across large distributed teams, Angular is a strong contender. Its opinionated structure, built-in dependency injection, and comprehensive tooling provide consistency right out of the box.

Reach for Angular when many teams must ship consistently against shared conventions; reach for React when you want a smaller core with a pick-your-own ecosystem.`,
    level: 'beginner',
    relatedConcepts: ['react', 'typescript'],
    category: 'web',
  },
];
