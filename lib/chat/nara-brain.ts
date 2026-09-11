/**
 * Nara Brain — Fluid Compositional AI-Style Chatbot Engine
 * Token scoring, knowledge templates, web fallback. No external LLM.
 */

import { queryKnowledgeGraph } from '@/lib/search/knowledge-graph';
import { fetchWebAnswer } from '@/lib/search/web-search';
import { searchSite } from '@/lib/search/extractive-qa';

export interface HistoryMessage { sender: 'user' | 'assistant'; text: string; }
export interface NaraResponse { text: string; sources?: Array<{ title: string; heading: string; url: string; excerpt: string; }>; }

function tok(s: string) { return s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(t=>t.length>=2); }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random()*a.length)]; }
function hits(qt: string[], kw: string[]) { return qt.filter(t=>kw.some(k=>k===t||k.startsWith(t)||t.startsWith(k))).length; }

const OP = {
  n: ['','','Sure! ','Of course! '],
  t: ['','Great question! ','Here\'s the picture: ','Love this topic — '],
  f: ['','','Here you go: ','Right — '],
};
const CL = {
  g: ['', '\n\nAnything to dig into?', '\n\nFeel free to ask a follow-up!'],
  t: ['', '\n\nWant a quiz on this?', '\n\nShould I show a hands-on example?'],
};

// ── Quiz ────────────────────────────────────────────────────────────────────
interface QuizItem { id:string; topic:string; question:string; options:string[]; correctIndex:number; explanation:string; }
const QUIZZES: QuizItem[] = [
  { id:'js-nan', topic:'JavaScript', question:'What does `typeof NaN` evaluate to?', options:['"undefined"','"number"','"NaN"','"object"'], correctIndex:1, explanation:'`NaN` is technically type "number" per IEEE 754. Use `Number.isNaN(val)` to check.' },
  { id:'react-keys', topic:'React', question:'Why does React require a unique `key` prop on list items?', options:['For CSS styling','To identify changed items during Reconciliation','To sort alphabetically','To prevent leaks'], correctIndex:1, explanation:'React\'s Reconciliation algorithm uses `key` to match virtual DOM nodes between renders.' },
  { id:'interstellar', topic:'Interstellar', question:'How much Earth time passes per 1 hour on Miller\'s planet?', options:['1 month','1 year','7 years','25 years'], correctIndex:2, explanation:'Extreme gravitational time dilation from Gargantua makes 1 hour = ~7 Earth years.' },
  { id:'css-axis', topic:'CSS', question:'In `display:flex; flex-direction:row`, which property aligns items vertically?', options:['justify-content','align-items','align-content','place-self'], correctIndex:1, explanation:'`justify-content` = Main Axis. `align-items` = Cross Axis (vertical in a row).' },
  { id:'js-float', topic:'JavaScript', question:'Result of `0.1 + 0.2 === 0.3` in JavaScript?', options:['true','false','undefined','TypeError'], correctIndex:1, explanation:'false! Binary float can\'t represent 0.1 exactly. Use `Math.abs(a+b-c) < Number.EPSILON`.' },
  { id:'nextjs-rsc', topic:'Next.js', question:'Primary benefit of React Server Components?', options:['120 FPS','Zero client bundle contribution','Auto-writes tests','Removes CSS'], correctIndex:1, explanation:'RSC execute server-side, add 0 KB to the browser JS bundle.' },
];

function findActiveQuiz(h: HistoryMessage[]): QuizItem|null {
  for(let i=h.length-1;i>=0;i--) {
    const m=h[i]; if(m.sender!=='assistant') continue;
    if(!m.text.includes('Quiz Question')||m.text.includes('Spot on')||m.text.includes('Not quite')) return null;
    for(const q of QUIZZES) if(m.text.includes(q.question)) return q;
    return null;
  }
  return null;
}

function evalQuiz(ans: string, q: QuizItem): string {
  const c=ans.trim().toLowerCase(), L=String.fromCharCode(65+q.correctIndex).toLowerCase(), opt=q.options[q.correctIndex].toLowerCase();
  const ok=c===L||c.startsWith(L+'.')||c.startsWith(L+')')||c===String(q.correctIndex+1)||(c.length>4&&(c.includes(opt.slice(0,12))||opt.includes(c)));
  const at=`**${L.toUpperCase()}) ${q.options[q.correctIndex]}**`;
  return ok
    ? `🎉 **Spot on! That's correct!** ✨\n\n**Answer:** ${at}\n\n💡 **Why:** ${q.explanation}\n\nSay *"quiz me"* for another round!`
    : `Not quite — but great try! ✨\n\nThe correct answer is ${at}.\n\n💡 **Why:** ${q.explanation}\n\nSay *"quiz me"* whenever you\'re ready!`;
}

// ── Topics ──────────────────────────────────────────────────────────────────
interface Topic { id:string; kw:string[]; title:string; def:string; detail?:string; }
const TOPICS: Topic[] = [
  { id:'closure', kw:['closure','closures','lexical'], title:'JavaScript Closures',
    def:'A closure is a function that retains access to its outer lexical scope even after the outer function returns.',
    detail:`### 🧠 Closures\n\nA closure gives an inner function access to its outer scope after the outer function finishes.\n\n\`\`\`javascript\nfunction createCounter(start = 0) {\n  let count = start;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    value: () => count,\n  };\n}\nconst c = createCounter(10);\nconsole.log(c.increment()); // 11\n\`\`\`\n\n**Why it matters:** Data privacy, factory functions, React Hooks (\`useState\`, \`useEffect\`) all rely on closures.` },
  { id:'event-loop', kw:['event','loop','eventloop','microtask','macrotask','settimeout','queue'], title:'Event Loop',
    def:'The event loop makes JavaScript non-blocking. It processes the call stack first, then microtasks (Promises), then macrotasks (setTimeout/setInterval).',
    detail:`### ⚙️ The Event Loop\n\n\`\`\`javascript\nconsole.log('1');\nsetTimeout(() => console.log('2'), 0); // macrotask\nPromise.resolve().then(() => console.log('3')); // microtask\nconsole.log('4');\n// Output: 1, 4, 3, 2\n\`\`\`\n\n💡 Microtasks (Promises) always drain before the next macrotask.` },
  { id:'prototype', kw:['prototype','prototypal','inheritance','proto','chain'], title:'Prototype Chain',
    def:'Every JS object has a [[Prototype]] link. Property lookups walk this chain until null. ES6 class is syntactic sugar over prototypes.' },
  { id:'async-await', kw:['async','await','promise','promises','then','catch','fetch'], title:'Promises & Async/Await',
    def:'Promises represent eventual values. async/await is syntactic sugar that makes async code read sequentially while remaining non-blocking.',
    detail:`### ⚡ Async/Await\n\n\`\`\`javascript\nasync function getUser(id) {\n  try {\n    const res = await fetch(\`/api/user/\${id}\`);\n    return await res.json();\n  } catch (err) {\n    console.error(err);\n  }\n}\n\`\`\`\n\n💡 \`async\` always returns a Promise. Wrap \`await\` in try/catch for error handling.` },
  { id:'null-undefined', kw:['null','undefined','nullish'], title:'null vs undefined',
    def:'undefined = declared but never assigned. null = intentional absence. typeof null = "object" (historic JS bug). Use ?? to handle both.' },
  { id:'equality', kw:['equality','equals','triple','double','strict','loose','coercion'], title:'== vs ===',
    def:'== performs type coercion (0 == false → true). === checks value AND type with no coercion (0 === false → false). Always prefer ===.' },
  { id:'var-let-const', kw:['var','let','const','hoisting','block','scope'], title:'var / let / const',
    def:'var is function-scoped and hoisted. let/const are block-scoped with temporal dead zones. const prevents reassignment. Use const by default.' },
  { id:'arrow', kw:['arrow','function','this','bind','lexical'], title:'Arrow Functions',
    def:"Arrow functions (() => {}) have no own 'this' — they inherit from the enclosing scope. Can't be constructors, no arguments object." },
  { id:'modules', kw:['module','esm','commonjs','import','export','require'], title:'ES Modules vs CommonJS',
    def:'ESM (import/export) is the standard — works in browsers, supports tree-shaking. CJS (require/module.exports) is older Node. Use ESM in Next.js.' },
  { id:'types-interfaces', kw:['type','interface','typescript','alias'], title:'TypeScript: Types vs Interfaces',
    def:'Both describe object shapes. Interfaces support declaration merging, better for OOP. Types support unions/intersections. Use interface for objects, type for unions.',
    detail:`### 🟦 Types vs. Interfaces\n\n\`\`\`typescript\ninterface User { name: string; age: number; }\ninterface User { email: string; } // merges!\n\ntype ID = string | number;\ntype AdminUser = User & { role: 'admin' };\n\`\`\`\n\n**Rule:** interface for objects and class contracts; type for unions and mapped types.` },
  { id:'generics', kw:['generic','generics','parameter','constraint'], title:'TypeScript Generics',
    def:"Generics write type-safe reusable code without losing type info. function identity<T>(val: T): T { return val; } — T adapts to whatever you pass in.",
    detail:`### 🧩 Generics\n\n\`\`\`typescript\nfunction first<T>(arr: T[]): T | undefined { return arr[0]; }\nconst n = first([1, 2, 3]);  // n: number\nconst s = first(['a', 'b']); // s: string\n\nfunction getKey<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\`\`\`` },
  { id:'utility-types', kw:['partial','required','pick','omit','record','readonly','utility'], title:'TypeScript Utility Types',
    def:'Built-in transformers: Partial<T> (all optional), Required<T> (all required), Pick<T,K> (select fields), Omit<T,K> (drop fields), Record<K,V>, Readonly<T>.' },
  { id:'usestate', kw:['usestate','setstate','state','hook'], title:'React useState',
    def:'useState adds local state to function components. Returns [value, setter]. Calling setter triggers re-render. In React 18+, updates are batched.' },
  { id:'useeffect', kw:['useeffect','effect','lifecycle','cleanup','dependency','mount'], title:'React useEffect',
    def:'Runs side effects after render. [] = once on mount. [a,b] = when a or b changes. Return cleanup function to prevent leaks.',
    detail:`### 🔄 useEffect\n\n\`\`\`tsx\nuseEffect(() => {\n  let cancelled = false;\n  fetch(\`/api/user/\${userId}\`)\n    .then(r => r.json())\n    .then(data => { if (!cancelled) setUser(data); });\n  return () => { cancelled = true; }; // cleanup\n}, [userId]);\n\`\`\`\n\n💡 Always return cleanup for subscriptions and fetches to prevent memory leaks.` },
  { id:'usecallback-usememo', kw:['usecallback','usememo','memo','memoize','optimisation','optimization'], title:'useCallback & useMemo',
    def:'useMemo caches expensive computed values. useCallback caches function references. Both recompute only when deps change. Use with React.memo() to prevent child re-renders.' },
  { id:'useref', kw:['useref','ref','dom','mutable','focus','imperative'], title:'React useRef',
    def:"useRef returns a mutable .current object that doesn't trigger re-renders when changed. Use to access DOM nodes, persist values between renders, and store timer IDs." },
  { id:'context', kw:['context','usecontext','provider','prop','drilling'], title:'React Context API',
    def:'Shares values globally without prop drilling. createContext + <Context.Provider> + useContext. Best for theme, auth, locale — not high-frequency state.' },
  { id:'virtual-dom', kw:['virtual','dom','vdom','reconciliation','diffing','fiber'], title:'Virtual DOM & Reconciliation',
    def:'React keeps a JS copy of the DOM. On re-render, diffs new vs old (reconciliation) and surgically updates only changed nodes. React Fiber enables concurrent features.' },
  { id:'rsc', kw:['server','component','rsc','streaming','hydration'], title:'React Server Components vs Client Components',
    def:'Server Components run server-side, contribute 0 KB to bundle, can access databases. Client Components ("use client") run in browser with hooks, events, browser APIs.',
    detail:`### 🌐 RSC vs. Client Components\n\n| | Server | Client |\n|---|---|---|\n| **JS Bundle** | **0 KB** | Shipped |\n| **Hooks/State** | ❌ | ✅ |\n| **Browser APIs** | ❌ | ✅ |\n| **Direct DB** | ✅ | ❌ |\n\n\`\`\`tsx\n// Server Component\nexport async function Page() {\n  const data = await db.query();\n  return <div>{data.title}</div>;\n}\n// Client Component\n'use client';\nexport function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n+1)}>{n}</button>;\n}\n\`\`\`\n\n💡 Keep most of your tree as Server Components. Push 'use client' to the smallest interactive leaves.` },
  { id:'flexbox', kw:['flexbox','flex','justify','align'], title:'CSS Flexbox',
    def:'Flexbox is 1D layout. justify-content aligns the main axis; align-items the cross axis. Perfect for navbars, centering, and wrapping lists.',
    detail:`### 🎨 Flexbox\n\n\`\`\`css\n.center { display:flex; justify-content:center; align-items:center; }\n.nav { display:flex; justify-content:space-between; align-items:center; gap:1rem; }\n.cards { display:flex; flex-wrap:wrap; gap:1.5rem; }\n.cards > * { flex: 1 1 280px; }\n\`\`\`` },
  { id:'grid', kw:['grid','css-grid','grid-template','columns','rows','auto-fit'], title:'CSS Grid',
    def:'CSS Grid is 2D — rows AND columns simultaneously. Ideal for page layouts, dashboards, galleries.',
    detail:`### 📐 CSS Grid\n\n\`\`\`css\n.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem; }\n.layout {\n  display:grid;\n  grid-template-areas:"header header" "sidebar main" "footer footer";\n  grid-template-columns:240px 1fr;\n}\n\`\`\`\n\n💡 Grid for macro layout, Flexbox for micro components inside.` },
  { id:'specificity', kw:['specificity','cascade','selector','important','weight'], title:'CSS Specificity',
    def:'Specificity score (A,B,C): A=inline, B=IDs, C=classes. Higher wins. !important overrides all — use sparingly.' },
  { id:'custom-props', kw:['custom','properties','variables','var','token'], title:'CSS Custom Properties',
    def:'CSS variables (--name: value) are scoped, inherited, and live-updateable with JS. Access via var(--name). Essential for design tokens, theming, dark mode.' },
  { id:'position', kw:['position','relative','absolute','fixed','sticky'], title:'CSS Positioning',
    def:'static (default), relative (offset, creates stacking context), absolute (relative to positioned ancestor), fixed (viewport-anchored), sticky (sticks after scroll threshold).' },
  { id:'big-o', kw:['bigo','complexity','notation','algorithm'], title:'Big O Notation',
    def:'Describes worst-case growth rate. O(1) constant, O(log n) binary search, O(n) linear, O(n log n) merge sort, O(n²) nested loops. Choose lower O for large inputs.' },
  { id:'recursion', kw:['recursion','recursive','base'], title:'Recursion',
    def:'A function that calls itself on a smaller subproblem until a base case stops it. Used for tree traversal, divide-and-conquer, dynamic programming.' },
  { id:'http-methods', kw:['http','method','get','post','put','patch','delete'], title:'HTTP Methods',
    def:'GET reads (idempotent). POST creates. PUT replaces. PATCH partially updates. DELETE removes. OPTIONS describes allowed methods (CORS preflight).' },
  { id:'cors', kw:['cors','cross','origin','preflight'], title:'CORS',
    def:'Cross-Origin Resource Sharing. Browsers block cross-origin requests by default. Server adds Access-Control-Allow-Origin headers. Preflight OPTIONS checks permissions first.' },
  { id:'cookies-storage', kw:['cookie','localstorage','sessionstorage','storage'], title:'Cookies vs localStorage',
    def:'Cookies: sent with every request, HttpOnly prevents JS access (best for auth tokens). localStorage: persists across sessions, JS-only, ~5MB. sessionStorage: cleared on tab close.' },
  { id:'rest-graphql', kw:['rest','graphql','trpc','overfetch','endpoint'], title:'REST vs GraphQL',
    def:'REST: fixed endpoints returning fixed shapes — may over/under-fetch. GraphQL: single endpoint, client specifies exact fields needed in one request, no over-fetching.' },
  { id:'websockets', kw:['websocket','realtime','socket','sse'], title:'WebSockets',
    def:'Persistent bidirectional TCP channel. Both client and server push data freely. Ideal for chat, live collaboration, gaming, dashboards. SSE for server-only push.' },
  { id:'jwt', kw:['jwt','token','bearer','claims','signature'], title:'JWT',
    def:'Self-contained tokens: header (algorithm) + payload (claims) + signature. Server verifies without DB lookup. Store in HttpOnly cookies (not localStorage) to prevent XSS.' },
  { id:'xss', kw:['xss','scripting','injection','sanitize'], title:'XSS (Cross-Site Scripting)',
    def:'Attacker injects scripts rendered by other users. Prevention: escape input, Content-Security-Policy headers, avoid dangerouslySetInnerHTML, validate server-side.' },
  { id:'testing', kw:['testing','test','unit','integration','e2e','playwright'], title:'Testing Strategies',
    def:'Unit: test functions in isolation (fast). Integration: test units together. E2E: full user flows in browser (slow). Follow the pyramid: many unit, fewer integration, minimal E2E.' },
  { id:'git', kw:['git','commit','branch','merge','rebase'], title:'Git',
    def:'Distributed version control. commit = snapshot, branch = parallel line, merge/rebase = combine branches, stash = shelve changes, cherry-pick = apply specific commits.' },
  { id:'docker', kw:['docker','container','image','dockerfile'], title:'Docker',
    def:'Packages apps with all dependencies into isolated containers. Dockerfile defines the image; docker-compose.yml orchestrates multi-service apps. Runs identically everywhere.' },
];

const CONCEPTS: Record<string, string> = {
  accessibility: '**Web Accessibility (a11y)** — Semantic HTML, alt text, keyboard navigation, colour contrast, ARIA labels. Makes content usable by everyone including screen reader users.',
  semantic: '**Semantic HTML** — Elements with meaning: <header>, <nav>, <main>, <article>, <footer>. Improves SEO, accessibility, and code clarity vs generic <div> soup.',
  ssr: '**SSR (Server-Side Rendering)** — HTML rendered per request on the server. Great for SEO and dynamic content. Next.js supports SSR via dynamic routes.',
  ssg: '**SSG (Static Site Generation)** — HTML pre-built at compile time. Fastest load; ideal for content that does not change per request (blogs, docs).',
  hydration: '**Hydration** — React attaches event listeners to server-rendered HTML in the browser. Until complete, page is visual-only. RSC minimises this overhead.',
  tailwind: '**Tailwind CSS** — Utility-first framework. Compose styles from classes (flex, px-4, text-sm) in JSX. No context switching; tiny CSS bundles via PurgeCSS.',
  shadcn: '**shadcn/ui** — Accessible React components on Radix UI + Tailwind. Code lives in your repo — copy-paste, not a package dependency.',
  zustand: '**Zustand** — Minimal global state for React. No providers, no boilerplate — a simple store with hooks. Great Redux alternative for most apps.',
  swr: '**SWR / React Query** — Data-fetching with stale-while-revalidate. Handle loading/error/success, background revalidation, caching — replacing manual useEffect fetching.',
  monorepo: '**Monorepo** — Single repo with multiple projects. Turborepo (build caching + task orchestration) + pnpm workspaces (shared deps) = atomic commits and shared code.',
  graphql: '**GraphQL** — Query language for APIs. Client requests exactly the fields it needs in one request, eliminating over/under-fetching.',
  trpc: '**tRPC** — TypeScript-first fully type-safe API. Define procedures server-side, call client-side with complete type inference — no code generation needed.',
  cicd: '**CI/CD** — Continuous Integration (auto-run tests on push) + Continuous Delivery (auto-deploy passing builds). GitHub Actions, GitLab CI. Ship small, frequent changes safely.',
  memoization: '**Memoization** — Cache function results so identical inputs return cached output. Foundation of dynamic programming and React useMemo/useCallback.',
  hashmap: '**Hash Map** — Key-value store with O(1) average lookup/insert/delete. JS Map and plain objects are hash maps.',
};

type Intent = 'greeting'|'persona'|'thanks'|'bye'|'quiz'|'quiz_eval'|'teaching'|'define'|'empathy'|'humor'|'opinion'|'recommend'|'neal'|'general';
const IKW: Record<Intent,string[]> = {
  greeting:['hi','hello','hey','howdy','greetings','morning','afternoon','evening','sup','yo','hiya'],
  persona:['nara','yourself','capable','gender','girl','creator','created','purpose','bot','chatbot','assistant'],
  thanks:['thank','thanks','appreciate','wonderful','helpful','amazing','perfect','thx'],
  bye:['bye','goodbye','cya','later','farewell','night'],
  quiz:['quiz','test','challenge','trivia'],
  quiz_eval:[],
  teaching:['explain','teach','difference','between','compare','how','step','guide','tutorial','learn','understand','work','works','vs','versus','when','should','center','centering'],
  define:['what','define','definition','meaning','concept','overview','describe','is','are'],
  empathy:['tired','exhausted','burnout','burned','stressed','overwhelmed','frustrated','stuck','lost','confused','struggling','difficult','hard','hate','sucks','demotivated','depressed','sad','anxious','hopeless'],
  humor:['joke','funny','humor','laugh','entertain','fun','fact','random','cool'],
  opinion:['think','opinion','thoughts','favorite','favourite','prefer','feel','believe','view','perspective','worth'],
  recommend:['recommend','suggestion','movie','film','watch','similar','suggest'],
  neal:['neal','atichat','stack','university','sripatum','tqm','internship','co-op','coop','contact','hire','email','github','writing'],
  general:[],
};

function classify(q: string, h: HistoryMessage[]): { intent: Intent; topicId?: string; quiz?: QuizItem } {
  const tokens=tok(q), ql=q.toLowerCase().trim();
  const aq=findActiveQuiz(h);
  if(aq) {
    const isCmd=/^(teach|explain|quiz|what|who|how|why|tell|help|hi|hello|hey|recommend)\b/i.test(q.trim());
    const isAns=!isCmd&&(/^[a-d1-4][\s.)]/i.test(q.trim())||q.trim().length<=18||aq.options.some(o=>ql.includes(o.toLowerCase().slice(0,10))));
    if(isAns) return { intent:'quiz_eval', quiz:aq };
  }
  const sc: Partial<Record<Intent,number>>={};
  for(const [k,kw] of Object.entries(IKW) as [Intent,string[]][]) { if(kw.length) sc[k]=hits(tokens,kw); }
  if(tokens.includes('neal')||tokens.includes('atichat')||ql.includes('your')) sc.neal=(sc.neal??0)+2;
  if(tokens.length<=3&&(sc.greeting??0)>=1) return { intent:'greeting' };
  if((sc.empathy??0)>=1) return { intent:'empathy' };
  if((sc.quiz??0)>=1&&!ql.includes('question is')) return { intent:'quiz' };
  if((sc.humor??0)>=1&&(ql.includes('joke')||ql.includes('fun fact')||ql.includes('random')||ql.includes('entertain'))) return { intent:'humor' };
  if((sc.neal??0)>=2) return { intent:'neal' };
  if((sc.thanks??0)>=1&&tokens.length<=6) return { intent:'thanks' };
  if((sc.bye??0)>=1&&tokens.length<=5) return { intent:'bye' };
  if((sc.persona??0)>=1) return { intent:'persona' };
  if((sc.recommend??0)>=2||(ql.includes('movie')&&(sc.recommend??0)>=1)) return { intent:'recommend' };
  if((sc.opinion??0)>=2&&tokens.length>=4) return { intent:'opinion' };
  const topicId=findTopic(tokens,ql);
  if(topicId) { const te=(sc.teaching??0),de=(sc.define??0); return { intent:te>=de&&te>=1?'teaching':'define', topicId }; }
  if((sc.teaching??0)>=2) return { intent:'teaching' };
  return { intent:'general' };
}

function findTopic(tokens: string[], ql: string): string|undefined {
  for(const t of TOPICS) { if(hits(tokens,t.kw)>=1) return t.id; }
  for(const k of Object.keys(CONCEPTS)) {
    if(ql.includes(k)||tokens.some(t=>t===k||k.startsWith(t)||t.startsWith(k))) return 'c:'+k;
  }
}

function getContent(id: string, mode: 'def'|'detail'): string|null {
  if(id.startsWith('c:')) { const k=id.slice(2); return CONCEPTS[k]??null; }
  const t=TOPICS.find(x=>x.id===id); if(!t) return null;
  return mode==='detail'&&t.detail ? t.detail : '**'+t.title+'** — '+t.def;
}

const GREETS=[
  "Hey! I'm **Nara** ✨ — Neal's personal AI companion. Ask me anything about Neal's work, tech, movies, or just start a chat!",
  "Hi there! I'm **Nara**. What's on your mind? I can chat code, Neal's portfolio, films, or anything you're curious about.",
  "Hello! I'm **Nara**, Neal's built-in assistant. Tech concepts, co-op experience, movie facts, coding quizzes — what shall we explore?",
];
const PERSONAS=[
  "I'm **Nara** ✨ — Neal's personal AI companion built into this portfolio. I know Neal's tech stack, projects, co-op at TQM, and articles. I can also teach web development, quiz you on React or JavaScript, chat about *Interstellar*, or have a thoughtful conversation.\n\nWhat would you like to explore?",
  "Good question! I'm **Nara** — Neal's resident AI, running locally without cloud costs 😄 I know a lot about web dev, Neal's work, and quite a few other topics. Ask away!",
];
const THANKS_R=["You're welcome! ✨ What else can I help with?","Glad that helped! Feel free to ask more.","Anytime! Let me know if you'd like to explore anything further."];
const BYES=["Goodbye! Great chatting — come back anytime ✨","See you! I'll be here whenever you have more questions 😊","Later! Hope I was helpful today."];
const EMPATHY_R=[
  "That's genuinely tough — and I hear you. Programming demands intense focus and can be draining. Give yourself credit for how far you've come. 💙\n\nWant a fun fact to reset your brain, a joke, or to talk through what's frustrating you?",
  "Burnout is real, and it happens to the best engineers. You're not broken — you just need a reset. Step away for 10 minutes, drink some water. 🌿\n\nWhen you come back, I'm here — for a laugh, a quiz, or help with what you're stuck on.",
  "Feeling stuck is part of the process, not a sign you're failing. Every developer goes through this. 💙\n\nTake it easy on yourself. Want something cool and random to clear your head?",
];
const JOKES=[
  "Why do programmers prefer dark mode?\nBecause **light attracts bugs!** 🐛✨",
  "There are **10 types of people in the world:** those who understand binary, and those who don't! 😄",
  "A SQL query walks into a bar and asks two tables:\n*\"Can I join you?\"* 🍺",
  "How many programmers does it take to change a light bulb?\nNone — that's a hardware problem! 💡",
  "Why do Java developers wear glasses?\nBecause they don't C#! 👓",
];
const FACTS=[
  "🌌 The Apollo 11 guidance computer had only **4 KB of RAM** at **0.043 MHz**. Your phone is millions of times more powerful!",
  "🎬 In *Interstellar*, the ticking sound on Miller's planet plays every **1.25 seconds** — each tick represents one entire Earth day passing.",
  "💻 The first computer bug was a real insect! In 1947 Grace Hopper's team found a moth stuck in the Harvard Mark II computer.",
  "🔢 The word \"algorithm\" comes from Persian mathematician **Muhammad ibn Musa al-Khwarizmi**, who lived around 800 AD.",
];
const RECOMMEND_R=`If you love thought-provoking sci-fi like *Interstellar*, here are my top picks:

1. 🪐 **Arrival (2016)** — Villeneuve. Non-linear time, linguistics, emotional resonance.
2. 🚀 **Contact (1997)** — Carl Sagan's novel. Radio astronomy, wonder, and humility.
3. 🌌 **2001: A Space Odyssey (1968)** — Kubrick's masterpiece; directly inspired Nolan's style.
4. ⏳ **Tenet (2020)** — Nolan again, entropy inversion and inverted action.
5. 🤖 **Ex Machina (2014)** — Intimate AI thriller questioning consciousness.

Have you seen any of these? I can tell you more about any of them!`;
const OPINIONS: Record<string,string> = {
  vibe: "Neal has an essay on vibe coding on this very site! Core thesis: **\"Speed without comprehension is fragile.\"** ✨\n\nVibe coding is exhilarating — AI removes friction and you build fast. But if you don't understand what you commit, you're outsourcing your engineering judgement. Treat AI as an interactive pair-programmer, not a magic oracle.\n\nWhat's your experience with it?",
  ai: "AI is a cognitive bicycle for thought — it shifts programming from memorising syntax to high-level design and product craft.\n\nThat said: the curiosity, empathy, taste, and critical reasoning that make great software remain deeply human. AI amplifies those qualities; it can't replace them.\n\nHow do you use AI in your workflow?",
  typescript: "TypeScript is one of those tools where you wonder how you coded large codebases without it. The IDE feedback loop — catching type errors before runtime — is worth the learning curve.\n\nThe sweet spot: strict types for APIs and critical paths; pragmatic flexibility where type gymnastics don't add real safety.\n\nDo you use TS day-to-day?",
  def: "My instinct: the best engineers are perpetually curious — comfortable not knowing and excited by learning. Technology trends come and go, but careful, thoughtful engagement with systems? That's timeless.\n\nWhat made you think about this?",
};

function synthWeb(raw: string): string {
  const cleaned=raw.replace(/^[🎬✨🌌]\s*\*\*[^*]+\*\*[:\s]*/,'').trim();
  const sents=cleaned.replace(/\n+/g,' ').split(/(?<=[.!?])\s+(?=[A-Z])/).slice(0,3).join(' ');
  const op=pick(['','Here\'s what I found: ','Great topic! ','Interesting — ']);
  const cl=pick(['','\n\nFeel free to ask follow-ups!','\n\nWant to explore any aspect further?']);
  return /\b(film|movie|directed|released)\b/i.test(raw) ? `🎬 ${op}${sents}${cl}` : `${op}${sents}${cl}`;
}
function graceful(q: string): string {
  const topic=q.replace(/^(what is|what are|who is|how does|explain|tell me about|define|how do i|can you)\s*/i,'').replace(/[?.,!]/g,'').trim().split(' ').slice(0,4).join(' ');
  return pick([
    `That's an interesting one — "${topic}"! I don't have specific details on that yet.\n\nTry rephrasing, or ask me about JavaScript, React, TypeScript, CSS, Next.js, Neal's portfolio, or movies!`,
    `Hmm, "${topic}" is outside my current knowledge — I'm honest about my limits 😊\n\nCan I help with something related? I'm strong on web dev and Neal's work.`,
    `I don't have enough context to answer about "${topic}" accurately — I'd rather admit that than guess. 🙏\n\nAsk me something more specific or explore web development, coding concepts, or Neal's portfolio!`,
  ]);
}

export async function naraAnswer(q: string, h: HistoryMessage[]): Promise<NaraResponse> {
  if(!q.trim()) return { text:'Go ahead — ask me anything!' };
  try {
    const { intent, topicId, quiz }=classify(q,h);
    const ql=q.toLowerCase();
    if(intent==='greeting') return { text:pick(GREETS) };
    if(intent==='persona') return { text:pick(PERSONAS) };
    if(intent==='thanks') return { text:pick(THANKS_R) };
    if(intent==='bye') return { text:pick(BYES) };
    if(intent==='empathy') return { text:pick(EMPATHY_R) };
    if(intent==='humor') {
      if(ql.includes('fact')||ql.includes('interesting')||ql.includes('random')||ql.includes('cool'))
        return { text:pick(FACTS)+'\n\nWant another? Or a coding challenge?' };
      return { text:pick(JOKES)+'\n\nWant another, or shall we try some trivia?' };
    }
    if(intent==='quiz') {
      let sel=QUIZZES[Math.floor(Math.random()*QUIZZES.length)];
      if(/\breact\b/i.test(q)) sel=QUIZZES.find(x=>x.topic==='React')??sel;
      else if(/\b(javascript|js)\b/i.test(q)) sel=QUIZZES.find(x=>x.topic==='JavaScript')??sel;
      else if(/\binterstellar\b/i.test(q)) sel=QUIZZES.find(x=>x.topic==='Interstellar')??sel;
      else if(/\bcss\b/i.test(q)) sel=QUIZZES.find(x=>x.topic==='CSS')??sel;
      else if(/\bnext/i.test(q)) sel=QUIZZES.find(x=>x.topic==='Next.js')??sel;
      const opts=sel.options.map((o,i)=>`${String.fromCharCode(65+i)}) ${o}`).join('\n');
      return { text:`🎯 **Quiz Question [${sel.topic}]:**\n\n**${sel.question}**\n\n${opts}\n\n*Type A, B, C, or D!*` };
    }
    if(intent==='quiz_eval'&&quiz) return { text:evalQuiz(q,quiz) };
    if(intent==='recommend') return { text:RECOMMEND_R };
    if(intent==='opinion') {
      if(/vibe\s*cod/i.test(q)) return { text:OPINIONS.vibe };
      if(/\b(ai|artificial)\b/i.test(q)) return { text:OPINIONS.ai };
      if(/typescript|ts\b/i.test(q)) return { text:OPINIONS.typescript };
      return { text:OPINIONS.def };
    }
    if(intent==='neal') {
      const kg=queryKnowledgeGraph(q);
      if(kg) return { text:pick(OP.f)+kg.object, sources:[{ title:kg.sourceTitle,heading:kg.subject,url:kg.url,excerpt:kg.contextSentence }] };
      const site=searchSite(q);
      if(site.directAnswer) return { text:pick(OP.f)+site.directAnswer+pick(CL.g), sources:site.sources };
    }
    if(intent==='teaching'&&topicId) {
      const c=getContent(topicId,'detail'); if(c) return { text:pick(OP.t)+c+pick(CL.t) };
    }
    if(intent==='define'&&topicId) {
      const c=getContent(topicId,'def'); if(c) return { text:pick(OP.n)+c+pick(['','\n\nWant code examples or a deeper dive?','']) };
    }
    const kg=queryKnowledgeGraph(q);
    if(kg) return { text:pick(OP.f)+kg.object, sources:[{ title:kg.sourceTitle,heading:kg.subject,url:kg.url,excerpt:kg.contextSentence }] };
    const site=searchSite(q);
    if(site.directAnswer) return { text:pick(OP.n)+site.directAnswer+pick(CL.g), sources:site.sources };
    const loose=findTopic(tok(q),ql);
    if(loose) { const c=getContent(loose,'detail')||getContent(loose,'def'); if(c) return { text:pick(OP.t)+c+pick(CL.t) }; }
    const web=await fetchWebAnswer(q).catch(()=>null);
    if(web?.found) return { text:synthWeb(web.answer), sources:[{ title:web.sourceTitle,heading:'Web Reference',url:web.sourceUrl,excerpt:web.answer.slice(0,120) }] };
    return { text:graceful(q) };
  } catch { return { text:'Something went wrong on my end — sorry! Try again in a moment.' }; }
}
