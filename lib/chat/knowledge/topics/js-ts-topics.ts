import type { DetailedTopic } from './types';

export const JS_TS_TOPICS: DetailedTopic[] = [
  {
    id: 'closure',
    keywords: ['closure', 'closures', 'lexical', 'scope', 'outer function', 'inner function'],
    title: 'JavaScript Closures',
    summary: 'A closure is a function bundled together with references to its lexical environment, allowing it to access outer variables even after the outer function has executed.',
    detail: `### Closures & Lexical Scoping

A closure gives an inner function persistent access to its outer enclosing scope, even after the outer function returns.

\`\`\`javascript
function createCounter(initialValue = 0) {
  let count = initialValue; // Private variable encapsulated in closure
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count,
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.get());       // 12
\`\`\`

**Why this matters in modern development:**
- **Data Encapsulation:** Emulates private state without class fields.
- **Factory Functions & Currying:** Enables reusable, parameterized functions.
- **React Hooks Architecture:** Hooks like \`useState\` and \`useEffect\` fundamentally rely on closures over render scopes.`,
    level: 'intermediate',
    relatedConcepts: ['var-let-const', 'arrow', 'usestate'],
    category: 'javascript',
  },
  {
    id: 'event-loop',
    keywords: ['event', 'loop', 'eventloop', 'microtask', 'macrotask', 'settimeout', 'queue', 'call stack', 'concurrency'],
    title: 'JavaScript Event Loop & Concurrency',
    summary: 'The event loop enables JavaScript to be non-blocking on a single thread by continuously orchestrating the Call Stack, Microtask Queue (Promises, queueMicrotask), and Macrotask Queue (setTimeout, I/O).',
    detail: `### The JavaScript Event Loop

JavaScript executes code in a single-threaded runtime with an event-driven concurrency model.

\`\`\`javascript
console.log('1 - Sync Call Stack');

setTimeout(() => {
  console.log('2 - Macrotask (Timer)');
}, 0);

Promise.resolve().then(() => {
  console.log('3 - Microtask (Promise)');
});

console.log('4 - Sync Call Stack');
// Execution order: 1 -> 4 -> 3 -> 2
\`\`\`

**Core Execution Rules:**
1. **Call Stack:** Synchronous code executes immediately until completion.
2. **Microtask Queue:** Drained completely after every tick of the call stack (Promises, \`queueMicrotask\`, MutationObserver).
3. **Macrotask Queue:** Next item dequeued only when the microtask queue is entirely empty (\`setTimeout\`, \`setImmediate\`, I/O, UI rendering).`,
    level: 'intermediate',
    relatedConcepts: ['async-await', 'websockets'],
    category: 'javascript',
  },
  {
    id: 'prototype',
    keywords: ['prototype', 'prototypes', 'prototypal', 'inheritance', 'proto', 'chain', '__proto__', 'object.create'],
    title: 'Prototype Chain & Inheritance',
    summary: 'Every JavaScript object maintains an internal link to another object called its prototype. Property lookups traverse this chain until finding a match or reaching null.',
    detail: `### Prototypal Inheritance

Rather than classical class-based inheritance, JavaScript uses prototype delegation:

\`\`\`javascript
const animal = {
  makeSound() { return this.sound; }
};

const dog = Object.create(animal);
dog.sound = 'Woof!';
console.log(dog.makeSound()); // "Woof!" (delegated up the prototype chain)
\`\`\`

*Note:* ES6 \`class\` syntax is syntactic sugar over prototype chains, making syntax clean while preserving prototypal dispatch under the hood.`,
    level: 'intermediate',
    relatedConcepts: ['closure', 'arrow'],
    category: 'javascript',
  },
  {
    id: 'async-await',
    keywords: ['async-await', 'async/await', 'async await', 'async', 'await', 'promise', 'promises', 'catch', 'finally', 'asynchronous'],
    title: 'Promises & Async/Await',
    summary: 'Promises represent eventual completion or failure of asynchronous operations. Async/await provides sequential, synchronous-looking syntax over Promise chains without blocking the thread.',
    detail: `### Promises and Async / Await

\`async/await\` simplifies asynchronous flows with native language ergonomics:

\`\`\`typescript
async function fetchUserData(userId: string): Promise<User | null> {
  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return (await res.json()) as User;
  } catch (err) {
    console.error('Failed to load user:', err);
    return null;
  }
}
\`\`\`

**Key Takeaways:**
- An \`async\` function always returns a \`Promise\`.
- Use \`Promise.all()\` or \`Promise.allSettled()\` for concurrent independent tasks to avoid waterfall delays.`,
    level: 'beginner',
    relatedConcepts: ['event-loop', 'http-methods'],
    category: 'javascript',
  },
  {
    id: 'null-undefined',
    keywords: ['null', 'undefined', 'nullish', 'coalescing', 'optional chaining'],
    title: 'Null vs Undefined & Modern Operators',
    summary: 'undefined signifies a variable declared without an assigned value, while null represents intentional absence. Modern JS uses the nullish coalescing operator (??) to treat only these two as falsy.',
    detail: `### Null vs. Undefined

- **\`undefined\`**: Default state of uninitialized variables, missing object properties, or functions without a return statement.
- **\`null\`**: Deliberate assignment representing "no object" or intentional absence.
- **Historic Quirk:** \`typeof null === "object"\` (a legacy C-level tag check from 1995).

\`\`\`typescript
// The Nullish Coalescing Operator (??) only checks null/undefined:
const count = 0 ?? 10;   // 0  (0 is kept!)
const countOld = 0 || 10; // 10 (falsy bug)

// Optional chaining (?.) safely navigates deep paths:
const street = user?.address?.street ?? 'Unknown';
\`\`\``,
    level: 'beginner',
    relatedConcepts: ['equality', 'var-let-const'],
    category: 'javascript',
  },
  {
    id: 'equality',
    keywords: ['equality', 'equals', 'triple', 'double', 'strict', 'loose', 'coercion'],
    title: 'Strict (===) vs Loose (==) Equality',
    summary: 'Loose equality (==) performs implicit type coercion according to complex abstract equality rules, while strict equality (===) checks value and type without conversion.',
    detail: `### Equality & Type Coercion

Loose equality (\`==\`) invokes the Abstract Equality Comparison algorithm, leading to notorious counter-intuitive results:

\`\`\`javascript
0 == false        // true
'' == false       // true
[] == false       // true
null == undefined // true
null === undefined// false (different types)
\`\`\`

**Production Rule:** Always use \`===\` (strict equality) and \`!==\` to avoid unintentional implicit coercion bugs.`,
    level: 'beginner',
    relatedConcepts: ['null-undefined'],
    category: 'javascript',
  },
  {
    id: 'var-let-const',
    keywords: ['var', 'let', 'const', 'hoisting', 'block', 'scope', 'temporal dead zone', 'tdz'],
    title: 'Variable Declarations & Scoping',
    summary: 'var is function-scoped and hoisted with undefined initialization. let and const are block-scoped with a Temporal Dead Zone (TDZ). Prefer const by default, let when reassigning.',
    detail: `### Scoping: var vs let vs const

| Feature | \`var\` | \`let\` | \`const\` |
|---|---|---|---|
| Scope | Function | Block \`{}\` | Block \`{}\` |
| Hoisting | Initialized to \`undefined\` | Temporal Dead Zone (Error) | Temporal Dead Zone (Error) |
| Reassignable | Yes | Yes | No (Reference is locked) |

\`\`\`javascript
// const locks the binding, not mutation of object contents:
const person = { name: 'Alex' };
person.name = 'Sam'; //  Valid mutation
// person = {};           //  TypeError
\`\`\``,
    level: 'beginner',
    relatedConcepts: ['closure'],
    category: 'javascript',
  },
  {
    id: 'arrow',
    keywords: ['arrow', 'arrow function', 'function', 'bind', 'lexical', 'arguments'],
    title: 'Arrow Functions & Lexical This',
    summary: 'Arrow functions do not bind their own this, arguments, super, or new.target. They lexically capture this from the surrounding outer scope.',
    detail: `### Arrow Functions

Arrow functions provide compact syntax and solve common \`this\` binding pitfalls:

\`\`\`javascript
class Timer {
  seconds = 0;
  start() {
    // Lexical this: references the Timer instance automatically
    setInterval(() => {
      this.seconds++;
    }, 1000);
  }
}
\`\`\`

**Constraints:**
- Cannot be invoked as constructors with \`new\`.
- Do not possess an \`arguments\` object (use rest parameters \`...args\` instead).`,
    level: 'beginner',
    relatedConcepts: ['closure', 'prototype'],
    category: 'javascript',
  },
  {
    id: 'modules',
    keywords: ['module', 'esm', 'commonjs', 'import', 'export', 'require', 'tree shaking'],
    title: 'ES Modules (ESM) vs CommonJS (CJS)',
    summary: 'ES Modules use static declarative import/export syntax analyzed at compile time, enabling tree-shaking and browser support. CommonJS is runtime dynamic loading historically used in Node.',
    detail: `### Module Systems: ESM vs CJS

- **ESM (ECMAScript Modules):**
  - Syntax: \`import x from 'x'\`, \`export default x\`
  - Static analysis: bundlers can prune unused code (tree-shaking).
  - Native in browsers and modern Node.js runtimes (Bun, Node 18+).
- **CommonJS (CJS):**
  - Syntax: \`const x = require('x')\`, \`module.exports = x\`
  - Dynamic at runtime: cannot easily be tree-shaken.`,
    level: 'intermediate',
    relatedConcepts: ['monorepo'],
    category: 'architecture',
  },
  {
    id: 'types-interfaces',
    keywords: ['types vs interfaces', 'type vs interface', 'type', 'interface', 'alias', 'declaration merging', 'union', 'intersection'],
    title: 'TypeScript: Types vs Interfaces',
    summary: 'Interfaces excel at object shapes and support declaration merging. Type aliases represent any type including unions, tuples, primitives, and conditional mapped types.',
    detail: `### Types vs. Interfaces in TypeScript

\`\`\`typescript
// Interfaces: declaration merging (ideal for extensible libraries)
interface User {
  id: string;
}
interface User {
  name: string; // Merged with User above!
}

// Type Aliases: unions, intersections, primitives, tuples
type Role = 'admin' | 'editor' | 'viewer';
type FullUser = User & { role: Role; createdAt: Date };
\`\`\`

**Convention:** Use \`interface\` for public object APIs and class contracts; use \`type\` for unions, primitives, tuples, and utility compositions.`,
    level: 'intermediate',
    relatedConcepts: ['generics', 'utility-types'],
    category: 'typescript',
  },
  {
    id: 'generics',
    keywords: ['generic', 'generics', 'parameter', 'constraint', 'extends', 'type argument'],
    title: 'TypeScript Generics & Type Constraints',
    summary: 'Generics introduce type variables that enable building flexible, reusable components while preserving exact type information rather than collapsing to any.',
    detail: `### TypeScript Generics

\`\`\`typescript
// Generic function with constraints:
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const developer = { name: 'Alex', stack: ['React', 'Next.js', 'TypeScript'] };
const stack = getProperty(developer, 'stack'); // Type is string[], guaranteed
\`\`\``,
    level: 'intermediate',
    relatedConcepts: ['types-interfaces', 'utility-types'],
    category: 'typescript',
  },
  {
    id: 'utility-types',
    keywords: ['partial', 'required', 'pick', 'omit', 'record', 'readonly', 'utility', 'returntype'],
    title: 'TypeScript Utility Types',
    summary: 'Built-in type transformers that derive new types from existing ones: Partial, Required, Pick, Omit, Record, Readonly, ReturnType, and Parameters.',
    detail: `### Essential TypeScript Utility Types

\`\`\`typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

type ArticlePreview = Pick<Article, 'id' | 'title'>;
type UpdateArticleInput = Partial<Omit<Article, 'id'>>;
type ArticleCache = Record<string, Article>;
\`\`\``,
    level: 'intermediate',
    relatedConcepts: ['types-interfaces', 'generics'],
    category: 'typescript',
  },
];
