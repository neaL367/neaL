import type { DocumentSection } from './types';

/**
 * Pre-compiled, structured sections of the website content.
 * Extracted from app/page.mdx and app/writing/posts/*.mdx.
 * Splitting by H2/H3 ensures fine-grained passage retrieval.
 */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

interface RawSectionConfig {
  id: string;
  slug: string;
  url: string;
  pageTitle: string;
  heading: string;
  level: number;
  summary?: string;
  publishedAt?: string;
  text: string;
}

const RAW_SECTIONS: RawSectionConfig[] = [
  // ─── Home Page ─────────────────────────────────────────────────────────────
  {
    id: 'home#intro',
    slug: 'home',
    url: '/',
    pageTitle: 'Home',
    heading: 'About Neal367',
    level: 1,
    summary: 'Developer, volunteer, student pursuing IT at Sripatum University.',
    text: "Hi, I'm Neal367. I'm a developer and volunteer. I am currently pursuing my studies in information and technology at Sripatum University. I've been sharing knowledge about IT for people who are underprivileged as a volunteer speaker. My dream is to be a game developer by making my own. It's interesting how every technology breakthrough improves DX much better with listening to chill music while working. At last I'm a Rockstar Games fan.",
  },
  {
    id: 'home#contact',
    slug: 'home',
    url: '/',
    pageTitle: 'Home',
    heading: 'Connect & Links',
    level: 2,
    summary: 'GitHub, Twitter, and hiring contact information for Neal.',
    text: 'Read my writing or look at some photos. You can visit my code on GitHub at github.com/Neal367 or follow me online on Twitter @NL367 or hire me by emailing atichatbusiness@gmail.com.',
  },

  // ─── Stack Post ────────────────────────────────────────────────────────────
  {
    id: 'stack#intro',
    slug: 'stack',
    url: '/writing/stack',
    pageTitle: 'My Stack',
    heading: 'Stack Philosophy',
    level: 1,
    summary: 'A look at the tools, frameworks, and infrastructure I use every day to build software.',
    publishedAt: '2024-04-07',
    text: 'Here is an overview of the tools, frameworks, and services I rely on to build web applications. Software choices evolve over time, but my criteria stay consistent: developer velocity, reliability, performance, and simplicity.',
  },
  {
    id: 'stack#nextjs',
    slug: 'stack',
    url: '/writing/stack#nextjs',
    pageTitle: 'My Stack',
    heading: 'Next.js Framework',
    level: 2,
    summary: 'Primary tool for full-stack web applications with React Server Components.',
    publishedAt: '2024-04-07',
    text: 'Next.js is my primary tool for building full-stack web applications. React Server Components changed how we architect web apps by reducing client-side JavaScript, simplifying data fetching, and giving us instant access to backend resources without writing boilerplate API layers. Combined with TypeScript, it provides the best balance of speed and reliability. If I am building a production web app today, Next.js is almost always my first choice.',
  },
  {
    id: 'stack#angular',
    slug: 'stack',
    url: '/writing/stack#angular',
    pageTitle: 'My Stack',
    heading: 'Angular Framework',
    level: 2,
    summary: 'Architectural discipline and consistency across large distributed teams.',
    publishedAt: '2024-04-07',
    text: 'When a project requires strict architectural discipline across large distributed teams, Angular is a strong contender. Its opinionated structure, built-in dependency injection, and comprehensive tooling provide consistency right out of the box.',
  },
  {
    id: 'stack#astro',
    slug: 'stack',
    url: '/writing/stack#astro',
    pageTitle: 'My Stack',
    heading: 'Astro Framework',
    level: 2,
    summary: 'Zero-JS content collections for marketing and documentation pages.',
    publishedAt: '2024-04-07',
    text: 'For content-driven websites, marketing pages, and documentation where performance is paramount, Astro excels. Its zero-JavaScript by default approach and built-in content collections make managing Markdown and MDX seamless.',
  },
  {
    id: 'stack#backend',
    slug: 'stack',
    url: '/writing/stack#backend',
    pageTitle: 'My Stack',
    heading: 'Backend & APIs: Node.js, Express, .NET & ASP.NET Core',
    level: 2,
    summary: 'Express for microservices and ASP.NET Core for enterprise-grade throughput.',
    publishedAt: '2024-04-07',
    text: 'When I need a lightweight, flexible REST API or microservice in JavaScript, Express remains a dependable choice. It stays out of your way and lets you compose middleware with minimal friction. For mission-critical backend services requiring enterprise-grade throughput and strict typing, ASP.NET Core with C# is exceptional. The runtime performance, native dependency injection, and asynchronous concurrency model handle high-traffic workloads effortlessly.',
  },
  {
    id: 'stack#styling',
    slug: 'stack',
    url: '/writing/stack#styling',
    pageTitle: 'My Stack',
    heading: 'Styling & Design: Tailwind CSS, shadcn/ui, Motion',
    level: 2,
    summary: 'Tailwind CSS for utility styling, shadcn/ui for accessible Radix primitives, Motion for micro-interactions.',
    publishedAt: '2024-04-07',
    text: 'Tailwind fundamentally changed how I approach UI design. Co-locating styles directly with component markup eliminates context-switching. shadcn/ui provides accessible, beautifully crafted component primitives built on Radix UI where code lives directly in your repository. Motion provides intuitive declarative APIs to build fluid micro-interactions and smooth layout transitions without degrading runtime performance.',
  },
  {
    id: 'stack#ai',
    slug: 'stack',
    url: '/writing/stack#ai',
    pageTitle: 'My Stack',
    heading: 'Artificial Intelligence: Hermes & GLM 5.3 Flash',
    level: 2,
    summary: 'Hermes paired with GLM 5.3 Flash for fast inference, coding, and architecture.',
    publishedAt: '2024-04-07',
    text: 'AI has become an indispensable part of my daily developer workflow. Rather than relying on oversized, sluggish models, I use Hermes paired with GLM 5.3 Flash for day-to-day coding, debugging, and ideation. The combination delivers incredible inference speed, sharp reasoning, and low latency without sacrificing accuracy. It acts as an instant pair programmer—excelling at breaking down complex functions, drafting types, and answering architecture questions in real time.',
  },
  {
    id: 'stack#hosting',
    slug: 'stack',
    url: '/writing/stack#hosting',
    pageTitle: 'My Stack',
    heading: 'Hosting & Cloud: Vercel & AWS',
    level: 2,
    summary: 'Vercel for frontend edge routing, AWS CloudFront, S3, and EC2 for cloud infrastructure.',
    publishedAt: '2024-04-07',
    text: 'Vercel is my default deployment target for Next.js applications with automatic preview environments, edge routing, and zero-config CI/CD pipelines. When projects require fine-grained cloud architecture, I use AWS: CloudFront for low-latency worldwide edge caching, S3 for durable object storage, and EC2 for dedicated compute workloads.',
  },
  {
    id: 'stack#community',
    slug: 'stack',
    url: '/writing/stack#community',
    pageTitle: 'My Stack',
    heading: 'Community & Mentorship',
    level: 2,
    summary: 'IT workshops and volunteering for beginners and students.',
    publishedAt: '2024-04-07',
    text: 'Beyond writing code, I regularly organize IT workshops and volunteer for programs that help beginners and underprivileged students learn technology. Teaching concepts to others forces you to understand them deeply and helps grow the community.',
  },

  // ─── Vibe Coding Post ──────────────────────────────────────────────────────
  {
    id: 'vibecoding#intro',
    slug: 'vibecoding',
    url: '/writing/vibecoding',
    pageTitle: 'Vibe Coding',
    heading: 'Reflections on AI-Assisted Development',
    level: 1,
    summary: 'Pitfalls of passive code generation and how to use LLMs to accelerate deep learning.',
    publishedAt: '2025-11-10',
    text: 'Over the past few months, I spent significant time experimenting with what many developers now call "vibe coding"—relying on large language models and prompt-driven workflows to scaffold features, resolve bugs, and iterate quickly. It is undeniable how empowering modern AI tools feel at first glance, but relying solely on intuition and generative AI comes with distinct tradeoffs that every developer needs to recognize.',
  },
  {
    id: 'vibecoding#illusion',
    slug: 'vibecoding',
    url: '/writing/vibecoding#the-illusion-of-instant-velocity',
    pageTitle: 'Vibe Coding',
    heading: 'The Illusion of Instant Velocity',
    level: 2,
    summary: 'Why speed without comprehension is fragile in software engineering.',
    publishedAt: '2025-11-10',
    text: 'When you prompt your way through an entire project without inspecting the generated code, your initial velocity skyrockets. However, speed without comprehension is fragile. When you delegate all problem-solving to an AI model, you gradually lose touch with how your application actually functions. If you do not read and comprehend the code you commit, you are not developing software—you are simply outsourcing your judgment. True engineering is about building mental models of how systems interact, fail, and scale.',
  },
  {
    id: 'vibecoding#learning-partner',
    slug: 'vibecoding',
    url: '/writing/vibecoding#reframing-ai-as-an-accelerated-learning-partner',
    pageTitle: 'Vibe Coding',
    heading: 'Reframing AI as an Accelerated Learning Partner',
    level: 2,
    summary: 'Asking critical questions on performance, data structures, and edge cases.',
    publishedAt: '2025-11-10',
    text: 'The real breakthrough came when I shifted how I interact with AI. Instead of using it as a ghostwriter to blindly generate code, I began treating it as an interactive pair-programmer and research assistant. Ask questions that challenge the model: Why is this specific pattern recommended? What are the performance implications? How does it behave under network failure? What are alternative architectural approaches? AI transforms into a tireless tutor that compresses learning time.',
  },
  {
    id: 'vibecoding#principles',
    slug: 'vibecoding',
    url: '/writing/vibecoding#principles-i-follow-when-coding-with-ai',
    pageTitle: 'Vibe Coding',
    heading: 'Principles for Coding with AI',
    level: 2,
    summary: '1. Read before committing, 2. Own the architecture, 3. Document what you learn.',
    publishedAt: '2025-11-10',
    text: 'Principles I follow when coding with AI: 1. Read before committing: trace execution paths, check variable scopes, and verify error boundaries. 2. Own the architecture: use AI for boilerplate, but keep ownership of data flow and high-level design. 3. Document what you learn: take active notes on new patterns and edge cases. Disciplined curiosity and clear thinking remain irreplaceable.',
  },

  // ─── Co-op at TQM Post ─────────────────────────────────────────────────────
  {
    id: 'co-op#intro',
    slug: 'co-op',
    url: '/writing/co-op',
    pageTitle: 'Co-op at TQM',
    heading: 'Internship Overview & Timeline',
    level: 1,
    summary: 'Reflections from my four-month co-operative education internship as a software developer at TQM.',
    publishedAt: '2026-04-24',
    text: 'From January 5 to April 24, 2026, I spent four months working as a software developer at TQM through my university’s Co-operative Education Program. It was my first in-depth experience working on production systems inside an enterprise engineering organization. The experience fundamentally shifted how I approach software engineering, team collaboration, and personal growth.',
  },
  {
    id: 'co-op#lifecycle',
    slug: 'co-op',
    url: '/writing/co-op#understanding-the-real-software-engineering-lifecycle',
    pageTitle: 'Co-op at TQM',
    heading: 'The Real Software Engineering Lifecycle',
    level: 2,
    summary: 'Investigation, Requirements, Implementation, Automated Testing, UAT, and Production Deployment.',
    publishedAt: '2026-04-24',
    text: 'At TQM, I experienced the complete end-to-end engineering cycle: 1. Investigation: breaking down business problems before writing code. 2. Requirements & Design: clarifying specs and data contracts. 3. Implementation: writing maintainable code. 4. Automated & Manual Testing: unit tests and edge cases. 5. User Acceptance Testing (UAT): validating with stakeholders. 6. Production Deployment & Monitoring: shipping safely. Writing code is often only a third of an engineer’s job; clear communication, thorough testing, and operational discipline are just as critical.',
  },
  {
    id: 'co-op#standups',
    slug: 'co-op',
    url: '/writing/co-op#engineering-cadence-and-daily-standups',
    pageTitle: 'Co-op at TQM',
    heading: 'Engineering Cadence and Daily Standups',
    level: 2,
    summary: '15-minute daily standups covering yesterday, today, and blockers.',
    publishedAt: '2026-04-24',
    text: 'Every morning began with a focused 15-minute standup meeting: what was completed yesterday, what is planned for today, and blockers or dependencies requiring cross-team help. These concise syncs kept everyone aligned and created an open environment where asking for assistance was encouraged.',
  },
  {
    id: 'co-op#mentorship',
    slug: 'co-op',
    url: '/writing/co-op#autonomy-and-senior-mentorship',
    pageTitle: 'Co-op at TQM',
    heading: 'Autonomy and Senior Mentorship at TQM',
    level: 2,
    summary: 'Balance of developer autonomy and guidance from senior engineers.',
    publishedAt: '2026-04-24',
    text: 'What I appreciated most about the engineering culture was the balance of autonomy and guidance. Whenever I ran into technical hurdles, senior engineers were always willing to dive in. Instead of simply dictating the solution, they walked me through why a particular architectural choice made sense in the broader system context. Those code reviews were masterclasses in software design.',
  },

  // ─── Me & Volunteer Posts ──────────────────────────────────────────────────
  {
    id: 'me#story',
    slug: 'me',
    url: '/writing/me',
    pageTitle: 'Me',
    heading: 'Personal Story',
    level: 1,
    summary: 'A story about my journey through tech, design, and dreaming of the next big thing.',
    text: 'Hi, this writing talks about me, Atichat (Art), known online as Neal367. A story about my journey through tech, design, and dreaming of the next big thing.',
  },
];

export const SITE_SECTIONS: DocumentSection[] = RAW_SECTIONS.map((raw) => {
  const titleTokens = tokenize(raw.pageTitle);
  const headingTokens = tokenize(raw.heading);
  const summaryTokens = tokenize(raw.summary || '');
  const bodyTokens = tokenize(raw.text);

  return {
    ...raw,
    sentences: splitSentences(raw.text),
    fieldTokens: {
      title: titleTokens,
      heading: headingTokens,
      summary: summaryTokens,
      body: bodyTokens,
    },
    fieldLengths: {
      title: titleTokens.length,
      heading: headingTokens.length,
      summary: summaryTokens.length,
      body: bodyTokens.length,
    },
  };
});
