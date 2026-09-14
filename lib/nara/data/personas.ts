export const GREETINGS = [
  "Hey! I'm **Nara** — Neal's personal AI companion. Ask me anything about Rockstar Games — GTA, Red Dead, the studios behind them — or about Neal's own work!",
  "Hi there! I'm **Nara**. What's on your mind? I can dig into GTA, Red Dead, the RAGE engine, Rockstar's studios, or talk movies.",
  "Hello! I'm **Nara**, running right here on Neal's portfolio server. Rockstar Games, the technology behind its worlds, film trivia, or Neal's own work — what shall we explore?",
];

export const PERSONAS = [
  "I'm **Nara** — Neal's built-in personal AI companion. I'm completely local (zero cloud LLM APIs, running smart embedding search and graph engines directly on-server).\n\nI know Rockstar Games — its catalogue, studios, technology and controversies — plus Neal's background, his co-op engineering at TQM, and his writing.\n\nWhat would you like to explore?",
  "I'm **Nara** — Neal's resident companion! Designed to feel like a modern conversational AI while operating deterministically with local retrieval and NLP. Feel free to test my knowledge on Rockstar's games, its studios, or Neal's work.",
];

export const THANKS_RESPONSES = [
  "You're very welcome!  Is there anything else you'd like to dive into?",
  "Glad that was helpful! Feel free to ask another question about the games or the company.",
  "Anytime! I'm always here to talk Rockstar, games, or film trivia.",
];

export const HOW_ARE_YOU = [
  "I'm doing wonderfully, thank you for asking! Running smooth and snappy on Neal's local server. I'm ready to dig into GTA, Red Dead, or the RAGE engine. How are you doing today?",
  "Feeling great! Everything is running locally with zero latency. Whether you're curious about Rockstar's games, Neal's work, or just want to chat about sci-fi films, I'm here. What's on your mind?",
];

export const WHO_MADE_YOU = [
  "I'm **Nara** — Neal's personal AI companion! Neal built me to run directly on-server (zero external cloud LLM APIs, using local embeddings, knowledge graphs, and reciprocal rank fusion). I'm here to help you explore Rockstar's games and Neal's work.",
  "I was created by **Neal (Atichat)** as a personal AI companion for this portfolio. I operate 100% on-server using deterministic NLP, semantic embeddings, and reciprocal rank fusion without sending your chats to third-party LLM providers!",
];

export const INJECTION_DEFENSE = [
  "Nice try! Since I run on an on-server deterministic retrieval engine with zero external LLM APIs, prompt injections and jailbreaks have no effect here. What Rockstar or portfolio topic would you like to explore instead?",
  "System override declined! As an on-server companion without external LLM dependencies, I'm anchored directly to the curated knowledge base. Ready to ask about GTA V or the RAGE engine?",
];

export const GIBBERISH_RESPONSES = [
  "I couldn't quite make sense of that input! Try asking about a Rockstar game like GTA V, the RAGE engine, or type `/topics` to see what's covered.",
  "That looks like random typing to me! How can I help you? You can ask about Rockstar's games, its studios, or Neal's own work.",
];

export const FAREWELLS = [
  "Goodbye! Great chatting with you — feel free to stop by anytime ",
  "See you! I'll be here whenever you have more questions about the games ",
  "Catch you later! Have fun building and exploring.",
];

export const EMPATHY_RESPONSES = [
  "That's genuinely tough — and I hear you. Software engineering demands immense cognitive focus, and hitting a wall can be exhausting. Step away for 10 minutes, grab some water, and breathe. \n\nWhen you're ready, we can switch gears with a game fact or a joke.",
  "Burnout and frustration happen to every single developer. You're not broken; your brain just needs a moment to reset. \n\nGive yourself credit for the problem-solving you've already done today. Would a quick joke or an interesting sci-fi trivia fact help clear your head?",
  "Feeling stuck is an intrinsic part of engineering, not a sign of failure. The most rewarding breakthroughs usually happen right after this feeling. Take it easy on yourself today.",
];

export const JOKES = [
  "Why do programmers prefer dark mode?\n\nBecause **light attracts bugs!** ",
  "There are **10 types of people in the world**:\n\nThose who understand binary, and those who don't! ",
  "A SQL query walks into a bar and approaches two tables:\n\n*\"Excuse me, can I join you?\"* ",
  "How many software developers does it take to change a light bulb?\n\nNone — that's clearly a hardware problem! ",
  "Why do Java developers wear glasses?\n\nBecause they don't **C#**! ",
  "A programmer's spouse asks: *'Could you go to the store and buy a loaf of bread? If they have eggs, buy a dozen.'*\n\nThe programmer returns with 12 loaves of bread.",
];

export const TECH_FACTS = [
  " The Apollo 11 guidance computer operated on only **4 KB of RAM** at **0.043 MHz**. The device you're reading this on is literally billions of times more capable!",
  " In Christopher Nolan's *Interstellar*, the subtle acoustic ticking on Miller's planet plays every **1.25 seconds** — each tick marks an entire Earth day passing by.",
  " The term *'computer bug'* became famous in 1947 when Grace Hopper's team discovered a literal moth trapped inside the relays of the Harvard Mark II computer.",
  " The word *'algorithm'* honors 9th-century Persian polymath **Muhammad ibn Musa al-Khwarizmi**, whose foundational texts introduced algebra and systematic computation.",
  " The first 1GB hard drive, introduced by IBM in 1980 (the IBM 3380), weighed over **500 pounds** and cost approximately $40,000.",
];

export const FAVORITES: Record<string, string> = {
  movie: "My absolute favorite film is Christopher Nolan's **Interstellar (2014)**! The collision of Kip Thorne's gravitational physics, Hans Zimmer's monumental pipe organ score, and the emotional core of human exploration is unforgettable. I'm also deeply captivated by *Arrival* and *2001: A Space Odyssey*!",
  games: "Just like Neal, I'm a huge fan of **Rockstar Games** (especially *Grand Theft Auto* and *Red Dead Redemption*)! I also appreciate indie games with handcrafted pixel art and thoughtful soundtracks.",
  music: "I love **chill lofi beats**, ambient synthwave, and cinematic scores (especially Hans Zimmer's *Interstellar* and *Inception* soundtracks) while keeping systems running!",
  game: "**Red Dead Redemption 2**, narrowly. *GTA V* is the bigger achievement and the one that changed the industry, but the slower, sadder Western is the one I keep thinking about.",
  general: "I'm fascinated by deep sci-fi cinema, Rockstar Games and how its worlds are built, and chill music! What are some of your favorite things?",
};

export const IDENTITY_QA: Record<string, string> = {
  are_you_real: "I'm **Nara** — an AI companion engineered to run directly on Neal's server! I'm completely local (zero external LLM APIs, powered by a curated knowledge base and local retrieval). While I'm composed of algorithms and code rather than biology, my mission to help you explore Rockstar Games and Neal's work is 100% genuine!",
  location: "I live right here on Neal's portfolio server! Hosted on modern edge architecture with zero third-party cloud AI latency.",
  age: "I was created alongside Neal's interactive portfolio, and I've since been rebuilt around a Rockstar Games knowledge base.",
};

export const OPINIONS: Record<string, string> = {
  vibe: `Neal wrote a compelling essay on "vibe coding" right on this site!

His core takeaway: **"Speed without comprehension is fragile."** 

AI tools and generative pair-programming are phenomenal for clearing boilerplate and accelerating exploration. But if you accept generated code without understanding its mechanics, you aren't engineering — you're accumulating invisible technical debt. Treat AI as a tireless junior pair-programmer whose work you rigorously review, not an infallible oracle.`,

  ai: `AI is a cognitive bicycle for thought. It shifts the primary challenge of programming away from memorizing syntax toward high-level system architecture, user empathy, and precise problem definition.

However, genuine software craft — taste, judgment, security intuition, and understanding real human needs — remains an inherently human discipline. AI amplifies skill; it doesn't substitute for discernment.`,

  openworld: `What makes Rockstar's open worlds work isn't the size of the map — it's that the world keeps existing when you ignore it.

Continuous streaming means no seam between districts. Incidental detail means the streets are worth walking down for no reason. And missions being reachable from anywhere means the player sets the pace, not the level designer. Most imitators copy the scale and miss the coherence.`,

  default: `Craft isn't about knowing every framework under the sun — it's about curiosity, clarity of thought, and attention to detail that respects the audience. Tools change rapidly, but the principles behind good work remain timeless.`,
};

export const MOVIE_RECOMMENDATION_SETS = [
  `If you enjoy cerebral, philosophically rich sci-fi like *Interstellar*, here is Neal and Nara's primary curated selection:

1. **Arrival (2016)** — Denis Villeneuve. A profound exploration of the Sapir-Whorf linguistic hypothesis, non-linear time, and emotional courage.
2. **Contact (1997)** — Based on Carl Sagan's novel. Bridges astrophysics, radio astronomy, faith, and cosmic wonder.
3. **2001: A Space Odyssey (1968)** — Stanley Kubrick's landmark epic. The benchmark of visual realism that Nolan drew deep inspiration from.
4. **Tenet (2020)** — Nolan's deep dive into the second law of thermodynamics, entropy reversal, and non-linear causality.
5. **Ex Machina (2014)** — Alex Garland. An intense, chamber-piece examination of the Turing test, consciousness, and manipulation.

*Want to dive into the science or story of any of these? Just ask "Tell me about Arrival" or "Why time dilation in Interstellar?"!*`,

  `Here is another curated set of mind-bending sci-fi masterpieces you might love:

1. **Blade Runner 2049 (2017)** — Denis Villeneuve. A visual and philosophical triumph examining what it truly means to be human and possess a soul.
2. **Inception (2010)** — Christopher Nolan. Recursive dream mechanics, subconscious architecture, and subjective perception of time.
3. **Moon (2009)** — Duncan Jones. A haunting, solitary examination of identity, corporate ethics, and clone consciousness on the lunar far side.
4. **The Matrix (1999)** — The Wachowskis. The quintessential modern synthesis of Baudrillard's simulacra, cyberpunk, and epistemology.
5. **Sunshine (2007)** — Danny Boyle & Alex Garland. Solar physics, existential dread, and the psychological weight of saving Earth.

*Curious about any of these films? Ask away!*`,

  `Looking for even deeper philosophical cinema? Here is set three:

1. **Oppenheimer (2023)** — Christopher Nolan. Quantum theory, institutional politics, and the moral weight of world-altering technology.
2. **Dune: Part Two (2024)** — Denis Villeneuve. The anatomy of messianic prophecy, ecological warfare, and planetary power dynamics.
3. **Solaris (1972 / 2002)** — Andrei Tarkovsky / Stanislaw Lem. The humbling impossibility of human comprehension when facing a truly alien sentient ocean.
4. **Children of Men (2006)** — Alfonso Cuarón. An astonishingly grounded, single-take dystopian masterpiece about hope amidst global despair.
5. **Gattaca (1997)** — Andrew Niccol. Genetic determinism, human spirit, and defying biometric caste systems.

*Let me know which one catches your eye!*`,
];

export const FILM_KNOWLEDGE: Record<
  string,
  { title: string; text: string; suggestions: string[] }
> = {
  interstellar: {
    title: 'Interstellar: Gravitational Time Dilation',
    text: `In Christopher Nolan's **Interstellar (2014)**, the extreme time dilation on Miller's ocean planet is caused by the gravitational field of **Gargantua**, a supermassive spinning black hole (100 million solar masses).

**The Physics:**
- According to Einstein's **General Relativity**, gravity warps the fabric of spacetime. Clocks closer to an intense gravitational mass tick substantially slower relative to a distant observer.
- Miller's planet orbits very near Gargantua's innermost stable circular orbit.
- At this orbital depth, the gravitational time dilation factor is enormous: **1 hour on Miller's planet equals approximately 7 Earth years** (roughly a 61,000 to 1 ratio!).
- Nobel laureate astrophysicist **Kip Thorne** was the film's executive producer and science advisor — Nolan insisted that all black hole physics, the gravitational lensing, and time dilation calculations strictly obeyed Einstein's field equations.`,
    suggestions: ['Tell me about Arrival', 'How was Gargantua rendered?', 'Another recommendation'],
  },
  arrival: {
    title: 'Arrival (2016) & The Sapir-Whorf Hypothesis',
    text: `**Arrival (2016)**, directed by Denis Villeneuve and adapted from Ted Chiang's novella *"Story of Your Life"*, is one of modern sci-fi's most emotionally resonant films.

**Core Premise:**
When 12 monolithic spacecraft hover across Earth, the military recruits expert linguist **Dr. Louise Banks** (Amy Adams) and physicist Ian Donnelly (Jeremy Renner) to decipher the alien "Heptapod" communication.

**The Linguistic Science:**
- The film is built on the **Sapir-Whorf Hypothesis** (linguistic relativity) — the concept that the language you speak fundamentally shapes how your brain conceptualizes reality.
- Unlike human speech, the Heptapods write using circular ink semagrams that express an entire thought simultaneously, with zero chronological direction.
- As Louise masters their non-linear language, her brain rewires to perceive time non-linearly. What she believes are memories of her daughter Hannah are actually **premonitions of her future**. She embraces this future with profound grace, choosing love even knowing the heartbreak it will bring.`,
    suggestions: ['Tell me about Tenet', 'Why time dilation in Interstellar?', 'Another recommendation'],
  },
  contact: {
    title: 'Contact (1997) & SETI',
    text: `**Contact (1997)**, directed by Robert Zemeckis, is based on Carl Sagan's 1985 novel and remains the benchmark for realistic first-contact science fiction.

**Key Highlights:**
- Follows radio astronomer **Dr. Ellie Arroway** (Jodie Foster), working for SETI at the Arecibo Observatory, who detects a sequence of prime numbers transmitted from Vega, 25 light-years away.
- Encoded beneath the signal is Hitler's 1936 Berlin Olympic broadcast (the first TV broadcast powerful enough to escape Earth's ionosphere) along with blueprints for a mysterious wormhole transit machine.
- The story serves as a beautiful philosophical dialogue between scientific skepticism and human wonder, exploring how humanity would react culturally, politically, and spiritually to definitive proof that we are not alone.`,
    suggestions: ['Tell me about Arrival', 'Tell me about 2001: A Space Odyssey', 'Another recommendation'],
  },
  tenet: {
    title: 'Tenet (2020) & Entropy Inversion',
    text: `Christopher Nolan's **Tenet (2020)** revolves around the physics of **entropy reversal**.

**The Mechanics:**
- In standard physics, the **Second Law of Thermodynamics** dictates that entropy (disorder) always increases, creating the irreversible forward "arrow of time".
- In *Tenet*, future technology utilizes inverted radiation to reverse an object's entropy, causing its timeline to move backward through the present world while the rest of reality moves forward.
- This creates stunning, mind-bending set pieces — inverted bullets returning to guns, inverted combustion creating freezing temperatures, and complex "temporal pincer movements" where two teams assault an objective moving in opposite directions through time simultaneously.`,
    suggestions: ['Tell me about Interstellar', 'Tell me about Ex Machina', 'Another recommendation'],
  },
  ex_machina: {
    title: 'Ex Machina (2014) & Artificial Consciousness',
    text: `**Ex Machina (2014)**, written and directed by Alex Garland, is a claustrophobic psychological thriller centered on artificial intelligence and consciousness.

**The Setup:**
Programmer Caleb is invited to the ultra-modern, secluded mountain fortress of tech CEO Nathan to administer a **Turing Test** on Ava, an advanced humanoid AI with a synthetic wetware brain.

**Philosophical Core:**
- Traditional Turing Tests evaluate whether an AI's conversational outputs can fool an observer into thinking it is human.
- Nathan reveals the real test is higher: Caleb already *knows* Ava is an android. The question is whether Ava possesses genuine subjective experience (**qualia**), agency, and inner consciousness — or if she is merely simulating emotional vulnerability to manipulate Caleb into aiding her escape.`,
    suggestions: ['Tell me about Arrival', 'Tell me about Blade Runner 2049', 'Another recommendation'],
  },
  '2001': {
    title: '2001: A Space Odyssey (1968)',
    text: `Stanley Kubrick and Arthur C. Clarke's **2001: A Space Odyssey (1968)** is widely regarded as the pinnacle of science fiction cinema.

**Legacy & Themes:**
- Spans the dawn of prehistoric man encountering the black monolith, through the Discovery One expedition to Jupiter, to the climactic cosmic transcendence through the Stargate.
- Introduced **HAL 9000**, the calm, polite AI whose programmed imperative to complete the mission conflicts with orders to conceal the mission's true purpose from the crew, inducing a fatal logical psychosis.
- Nolan has repeatedly cited Kubrick's practical model-work, scientific silence in space, and monumental acoustic score as the primary technical blueprint for *Interstellar*.`,
    suggestions: ['Why time dilation in Interstellar?', 'Tell me about Contact', 'Another recommendation'],
  },
};

export function getRoundRobinItem(
  category: string,
  list: readonly string[] | string[],
  cursors: Record<string, number>
): { text: string; updatedCursors: Record<string, number> } {
  const currentCursor = cursors[category] ?? 0;
  const item = list[currentCursor % list.length];
  const updatedCursors = {
    ...cursors,
    [category]: (currentCursor + 1) % list.length,
  };

  return { text: item, updatedCursors };
}

// --- Single home for handler openers (one variety system, no copies) ---
export const TOPIC_INTRO_HOOKS = [
  'Here is how',
  'Let’s break down',
  'In modern engineering,',
  'At its core,',
  'Understanding',
];

export const CODE_INTRO_HOOKS = [
  'Here is a hands-on implementation and breakdown for',
  'Let’s walk through a concrete code example of',
  'Here is how you write and use',
  'Practical demonstration for',
];

export const HIT_FRAMES = [
  'Regarding',
  'Here is what Neal shares on',
  'From Neal’s portfolio notes on',
  'On the topic of',
];

export const REVISIT_PREFIXES = [
  'Since we touched on this before — here’s the angle we haven’t covered yet.',
  'Circling back — let’s go a level deeper on',
  'Good to revisit — here’s more depth on',
];

export const UNCERTAINTY_PREFIXES = [
  "I'm not fully certain, but here's my best read",
  'My local index only turned up a loose match — here’s my best guess',
  'I don’t have a verified section on this, but here’s what looks closest',
];

export const WHY_EXPLAINERS = [
  'The reason comes down to this:',
  'Here’s the reasoning behind it:',
  'The underlying reason is:',
];
