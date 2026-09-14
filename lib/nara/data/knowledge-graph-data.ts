import type { KnowledgeTriple } from './types';

/**
 * Curated Entity-Attribute-Value (EAV) facts extracted directly from the website.
 * Provides deterministic 100% exact answers for core questions without any fuzzy guessing.
 */
export const SITE_KNOWLEDGE_TRIPLES: KnowledgeTriple[] = [
  // Identity & Education
  {
    subject: 'Neal',
    predicate: 'studies_at',
    aliases: [
      'where do you study',
      'where does neal study',
      'what university',
      'which university',
      'university',
      'education',
      'college',
      'school',
      'study',
    ],
    object:
      'Neal is currently studying Information and Technology at Sripatum University.',
    url: '/',
    sourceTitle: 'Home',
    contextSentence:
      'I am currently pursuing my studies in information and technology at Sripatum University.',
  },
  {
    subject: 'Neal',
    predicate: 'name_identity',
    aliases: [
      'who is neal',
      'who are you',
      'what is your name',
      'real name',
      'about neal',
      'who is neal367',
      'tell me about yourself',
    ],
    object:
      'Neal (also known as Atichat / Art / Neal367) is a developer, volunteer speaker, and student pursuing IT at Sripatum University.',
    url: '/',
    sourceTitle: 'Home',
    contextSentence:
      "I'm a developer and volunteer. I am currently pursuing my studies in information and technology at Sripatum University. Hi this writing talk about me, Atichat (art).",
  },
  {
    subject: 'Neal',
    predicate: 'dream_goal',
    aliases: [
      'what is your dream',
      'what is your goal',
      'what do you want to be',
      'dream job',
      'ambition',
      'game developer',
    ],
    object:
      'Neal’s dream is to become a game developer by creating his own games.',
    url: '/',
    sourceTitle: 'Home',
    contextSentence:
      'My dream is to be a game developer by making my own. at last I am a Rockstar Games fan.',
  },
  {
    subject: 'Neal',
    predicate: 'contact_info',
    aliases: [
      'how to contact you',
      'what is your email',
      'how to hire you',
      'twitter',
      'github',
      'contact neal',
      'reach neal',
    ],
    object:
      'You can reach Neal via email at atichatbusiness@gmail.com, on Twitter/X at @NL367, or check his code on GitHub at github.com/Neal367.',
    url: '/',
    sourceTitle: 'Home',
    contextSentence:
      'You can visit my code on GitHub or follow me online on Twitter @NL367 or email atichatbusiness@gmail.com.',
  },

  // Co-op & Experience
  {
    subject: 'TQM Co-op',
    predicate: 'dates_timeline',
    aliases: [
      'when was your co-op',
      'when did you work at tqm',
      'co-op dates',
      'how long was the internship',
      'internship timeline',
      'coop duration',
    ],
    object:
      'Neal worked as a software developer at TQM for four months, from January 5 to April 24, 2026.',
    url: '/writing/co-op',
    sourceTitle: 'Co-op at TQM',
    contextSentence:
      'From January 5 to April 24, 2026, I spent four months working as a software developer at TQM through my university’s Co-operative Education Program.',
  },
  {
    subject: 'TQM Co-op',
    predicate: 'company_role',
    aliases: [
      'where did you do your co-op',
      'where did neal do his co-op',
      'neal co-op experience',
      'where was your internship',
      'what company did you work for',
      'where did neal work',
      'where did you work at tqm',
      'work at tqm',
      'tqm role',
      'co-op role',
    ],
    object:
      'Neal completed a 4-month co-operative education internship at TQM Insurance Broker (January 5 to April 24, 2026) as a Software Developer working on enterprise production software.',
    url: '/writing/co-op',
    sourceTitle: 'Co-op at TQM',
    contextSentence:
      'I spent four months working as a software developer at TQM through my university’s Co-operative Education Program.',
  },
  {
    subject: 'TQM Co-op',
    predicate: 'learnings',
    aliases: [
      'what did you learn at tqm',
      'what did you learn from co-op',
      'what did neal learn at tqm',
      'tqm experience',
      'software engineering lifecycle',
      'co-op experience',
    ],
    object:
      'At TQM, Neal gained end-to-end enterprise engineering experience across the full software lifecycle:\n\n- Investigation & Requirements Design\n- Implementation with Angular and ASP.NET Core\n- Automated Unit Testing & QA Verification\n- User Acceptance Testing (UAT) and Production Deployment\n\nHe worked under senior mentorship and participated in daily 15-minute Agile standups to build mission-critical enterprise features.',
    url: '/writing/co-op',
    sourceTitle: 'Co-op at TQM',
    contextSentence:
      'At TQM, I experienced the complete end-to-end engineering cycle: Investigation, Requirements & Design, Implementation, Automated & Manual Testing, UAT, and Production Deployment.',
  },

  // Vibe Coding
  {
    subject: 'Vibe Coding',
    predicate: 'ai_philosophy',
    aliases: [
      'what is vibe coding',
      'vibe coding',
      'vibecoding',
      'vibe code',
      'ai assisted development',
      'coding with ai',
      'thoughts on vibe coding',
      'vibe coding article',
    ],
    object:
      'In his article "Vibe Coding", Neal reflects on months of AI-assisted engineering. While generative tools provide incredible initial velocity, Neal emphasizes that "speed without comprehension is fragile"—if you do not read and understand the code you commit, you are merely outsourcing your judgment.\n\nHis core philosophy is to treat AI as an interactive learning partner rather than a ghostwriter: reading every line before committing, owning the system architecture, and documenting key insights to build durable mental models.',
    url: '/writing/vibecoding',
    sourceTitle: 'Vibe Coding',
    contextSentence:
      'If you do not read and comprehend the code you commit, you are not developing software—you are simply outsourcing your judgment. The real breakthrough came when I began treating AI as an interactive learning partner and research assistant.',
  },

  // Tech Stack & Frameworks
  {
    subject: 'Primary Framework',
    predicate: 'nextjs',
    aliases: [
      'what frontend framework do you use',
      'primary framework',
      'why do you use nextjs',
      'why does neal use nextjs',
      'favorite framework',
      'do you use next.js',
    ],
    object:
      'Next.js is Neal’s primary framework for full-stack web applications, favored for React Server Components, reduced client JavaScript, simplified data fetching, and TypeScript synergy.',
    url: '/writing/stack',
    sourceTitle: 'My Stack',
    contextSentence:
      'Next.js is my primary tool for building full-stack web applications. React Server Components changed how we architect web apps by reducing client-side JavaScript.',
  },
  {
    subject: 'Tech Stack Overview',
    predicate: 'all_tools',
    aliases: [
      'what is neal’s tech stack',
      'what is neals tech stack',
      'what is neal tech stack',
      'what is your tech stack',
      'what is your stack',
      'what is the tech stack',
      'neal tech stack',
      'neals tech stack',
      'neal’s tech stack',
      'tech stack',
      'what stack',
      'what tools do you use',
      'what technologies do you use',
      'what tools and libraries do you code with',
      'what do you code with',
      'what libraries do you use',
      'technologies',
      'programming stack',
      'tools and libraries',
      'stack',
    ],
    object:
      'Neal specializes in modern full-stack web development with TypeScript. His core stack includes:\n\n- Frameworks: Next.js (React) as his primary tool, alongside Angular for enterprise systems and Astro for content-driven sites.\n- Styling & UI: Tailwind CSS for compiled utilities, shadcn/ui for accessible Radix primitives, and Motion for fluid animations.\n- Backend: Node.js with Express for lightweight APIs, and ASP.NET Core (C#) for high-throughput enterprise services.\n- AI Pairing: Hermes paired with GLM 5.3 Flash for fast, low-latency coding assistance.\n- Infrastructure: Deployed on Vercel with AWS (CloudFront, S3, EC2) for cloud storage and compute.',
    url: '/writing/stack',
    sourceTitle: 'My Stack',
    contextSentence:
      'Frameworks: Next.js, Angular, Astro. Backend: Node.js/Express, ASP.NET Core. Styling: Tailwind CSS, shadcn/ui, Motion. Hosting: Vercel, AWS.',
  },
  {
    subject: 'Styling Stack',
    predicate: 'styling_ui',
    aliases: [
      'how do you style websites',
      'what css do you use',
      'styling tools',
      'do you use tailwind',
      'shadcn',
    ],
    object:
      'For UI styling and interactions, Neal uses Tailwind CSS for compiled utility styles, shadcn/ui for accessible Radix primitives, and Motion for smooth micro-animations.',
    url: '/writing/stack',
    sourceTitle: 'My Stack',
    contextSentence:
      'Tailwind CSS co-locates styles with markup. shadcn/ui provides accessible primitives. Motion provides fluid animations without degrading performance.',
  },
  {
    subject: 'Backend Stack',
    predicate: 'backend_apis',
    aliases: [
      'what backend do you use',
      'what do you use for apis',
      'backend stack',
      'express',
      'asp.net',
      'dotnet',
    ],
    object:
      'For lightweight microservices and REST APIs, Neal uses Node.js & Express. For enterprise-grade, high-throughput mission-critical services, he uses ASP.NET Core with C#.',
    url: '/writing/stack',
    sourceTitle: 'My Stack',
    contextSentence:
      'When I need a lightweight, flexible REST API in JavaScript, Express remains a dependable choice. For mission-critical backend services, ASP.NET Core with C# is exceptional.',
  },
  {
    subject: 'Hosting & Cloud',
    predicate: 'infrastructure',
    aliases: [
      'where do you host',
      'how do you deploy',
      'what cloud do you use',
      'hosting',
      'vercel',
      'aws',
    ],
    object:
      'Neal deploys Next.js applications on Vercel with automatic edge routing and preview environments. For advanced cloud infrastructure, he uses AWS (CloudFront for CDN, S3 for object storage, and EC2 for dedicated compute).',
    url: '/writing/stack',
    sourceTitle: 'My Stack',
    contextSentence:
      'Vercel is my default deployment target for Next.js applications. When projects require fine-grained cloud architecture, I use AWS (CloudFront, S3, EC2).',
  },

  // AI & Vibe Coding
  {
    subject: 'AI & Vibe Coding',
    predicate: 'vibe_coding_definition',
    aliases: [
      'what is vibe coding',
      'explain vibe coding',
      'what do you think of vibe coding',
      'vibe coding thoughts',
      'coding with ai',
    ],
    object:
      'Vibe coding is relying on LLMs and prompt-driven workflows to scaffold features and iterate quickly. Neal emphasizes that while initial velocity is high, developers must not outsource judgment—they must read every line, comprehend the architecture, and use AI as an active learning partner rather than a blind generator.',
    url: '/writing/vibecoding',
    sourceTitle: 'Vibe Coding',
    contextSentence:
      'If you do not read and comprehend the code you commit, you are not developing software—you are simply outsourcing your judgment.',
  },
  {
    subject: 'AI Tools',
    predicate: 'ai_models',
    aliases: [
      'what ai do you use',
      'which ai model',
      'hermes',
      'glm',
      'ai pairing',
    ],
    object:
      'Rather than relying on oversized models, Neal pairs Hermes with GLM 5.3 Flash for fast inference speed, sharp reasoning, and low-latency coding assistance.',
    url: '/writing/stack',
    sourceTitle: 'My Stack',
    contextSentence:
      'Rather than relying on oversized, sluggish models, I use Hermes paired with GLM 5.3 Flash for day-to-day coding, debugging, and ideation.',
  },

  // Volunteering
  {
    subject: 'Volunteering',
    predicate: 'community_work',
    aliases: [
      'what volunteering do you do',
      'tell me about volunteering',
      'community service',
      'volunteer speaker',
      'mentorship',
    ],
    object:
      'Neal regularly organizes IT workshops and volunteers as a speaker to share technology knowledge with beginners and underprivileged students.',
    url: '/',
    sourceTitle: 'Home',
    contextSentence:
      'I have been sharing knowledge about IT for people who are underprivileged as a volunteer speaker.',
  },

  // Rockstar exact answers — verified 2026-09-14, offline copy (no runtime web).
  // Aliases are deliberately EXACT phrasings; the topic lane remains the
  // fallback so a paraphrase still answers from prose. Objects carry as-of
  // stamps because every figure here moves.
  {
    subject: 'GTA VI',
    predicate: 'release_date',
    aliases: [
      'when does gta vi release',
      'gta vi release date',
      'when is gta 6 coming out',
      'gta 6 release date exact',
    ],
    object:
      'Grand Theft Auto VI is scheduled for 19 November 2026 on PlayStation 5 and Xbox Series X/S, after delays from 2025 to 26 May 2026. No PC version is scheduled at launch. (As of 14 September 2026.)',
    url: '/',
    sourceTitle: 'Rockstar Games',
    contextSentence: 'Coming November 19, 2026. Pre-Order Now.',
  },
  {
    subject: 'GTA VI',
    predicate: 'price_editions',
    aliases: [
      'how much does gta 6 cost',
      'gta vi price editions',
      'gta 6 ultimate edition price',
    ],
    object:
      'GTA VI costs $79.99 standard with a $100 Ultimate Edition; pre-orders opened 25 June 2026 and Sensor Tower reported 89% of pre-orders chose Ultimate. (As of 14 September 2026.)',
    url: '/',
    sourceTitle: 'GamesIndustry.biz',
    contextSentence: 'GTA 6 will launch at $79.99; 89% of pre-orders are for the $100 ultimate edition.',
  },
  {
    subject: 'GTA V',
    predicate: 'units_sold_exact',
    aliases: [
      'how many units did gta v sell',
      'gta v 230 million units',
      'gta 5 units sold number',
    ],
    object:
      'GTA V has sold-in over 230 million units as of 7 August 2026 (Take-Two Q1 FY27), with the GTA franchise near 475 million. (As of 14 September 2026.)',
    url: '/',
    sourceTitle: 'Take-Two earnings',
    contextSentence: 'GTA V has now sold-in over 230 million units; the franchise has sold almost 475 million.',
  },
  {
    subject: 'Red Dead Redemption 2',
    predicate: 'units_sold_exact',
    aliases: [
      'how many copies did rdr2 sell',
      'rdr2 87 million copies',
      'red dead 2 units sold',
    ],
    object:
      'Red Dead Redemption 2 has sold over 87 million copies as of June 2026, the third best-selling game ever behind Minecraft and GTA V. (As of 14 September 2026.)',
    url: '/',
    sourceTitle: 'Take-Two earnings',
    contextSentence: 'Red Dead Redemption 2 has now sold over 87 million units.',
  },
  {
    subject: 'Rockstar Games',
    predicate: 'founded_exact',
    aliases: [
      'when was rockstar founded',
      'rockstar founding year exact',
      'rockstar founded date',
    ],
    object:
      'Rockstar Games was founded in December 1998 as a Take-Two Interactive label, built from BMG Interactive assets, by Sam Houser, Dan Houser, Terry Donovan, Jamie King and Gary Foreman.',
    url: '/',
    sourceTitle: 'Rockstar Games',
    contextSentence: 'The Rockstar Games label was founded in 1998 to create innovative interactive entertainment.',
  },
  {
    subject: 'Max Payne remake',
    predicate: 'status_exact',
    aliases: [
      'is the max payne remake still happening',
      'max payne remake release date status',
      'max payne 1 2 remake production stage',
    ],
    object:
      'The Max Payne 1 & 2 remake is in full production as of 11 August 2026 at Remedy on Northlight for PC, PS5 and Xbox Series X/S, funded and published by Rockstar, with no release date announced.',
    url: '/',
    sourceTitle: 'Remedy',
    contextSentence: 'Max Payne 1 and 2 remake remains in full production with Rockstar Games.',
  },
];
