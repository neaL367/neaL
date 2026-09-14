import type { DetailedTopic } from './types';

/**
 * Rockstar Games — company, studios, technology and controversies.
 *
 * Same note as `rockstar-games-topics.ts`: the summaries and details here are
 * stubs written to be correct and short, not finished prose. Replace the text
 * freely; keep `id`, `keywords` and `relatedConcepts` intact unless you also
 * update `concept-graph-data.ts`.
 */
export const ROCKSTAR_COMPANY_TOPICS: DetailedTopic[] = [
  {
    id: 'rockstar-games',
    keywords: ['rockstar', 'rockstar games', 'rockstar north', 'take two', 'take-two', 'publisher'],
    phrases: ['rockstar games', 'the company rockstar'],
    title: 'Rockstar Games',
    summary:
      'Rockstar Games is a game publisher and developer founded in 1998 as a subsidiary of Take-Two Interactive, best known for Grand Theft Auto and Red Dead.',
    detail: `### Rockstar Games

Rockstar Games was founded in **1998** as a publishing label under **Take-Two Interactive**, built around the team behind *Grand Theft Auto* at DMA Design in Dundee, Scotland.

Structurally, "Rockstar" is a **label with many studios** rather than a single building. Games are credited to individual studios — Rockstar North, Rockstar San Diego, Rockstar Vancouver and others — while the parent label handles publishing, marketing and the shared technology and tools that let those studios work on the same engine.

Its two flagship franchises are **Grand Theft Auto** and **Red Dead**. Its brand is closely associated with a particular approach: large open worlds, heavy production values, and a satirical streak aimed at American consumer culture.`,
    level: 'beginner',
    relatedConcepts: ['rockstar-north', 'take-two', 'dma-design', 'gta-series', 'red-dead-series'],
    category: 'company',
  },
  {
    id: 'rockstar-north',
    keywords: ['rockstar north', 'north', 'edinburgh', 'dma design', 'dma', 'dundee', 'scotland'],
    phrases: ['rockstar north', 'the scottish studio'],
    title: 'Rockstar North',
    summary:
      'Rockstar North is Rockstar\u2019s Edinburgh studio, formerly DMA Design, and the lead developer of the Grand Theft Auto series.',
    detail: `### Rockstar North

Rockstar North is the studio that makes **Grand Theft Auto**. It began as **DMA Design** in Dundee, Scotland — the studio behind *Lemmings* and the original *Grand Theft Auto* — and was acquired by Take-Two in 1999, then renamed Rockstar North and moved to Edinburgh.

Its lineage matters for how the series is understood: GTA began as a British studio\u2019s satire of American crime and car culture, and that outsider perspective is a common explanation for the series\u2019 tone.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'dma-design', 'gta-series', 'take-two'],
    category: 'company',
  },
  {
    id: 'dma-design',
    keywords: ['dma design', 'dma', 'lemmings', 'dundee', 'david jones'],
    phrases: ['dma design', 'the lemmings studio'],
    title: 'DMA Design',
    summary:
      'DMA Design was the Dundee studio behind Lemmings and the original Grand Theft Auto; it became Rockstar North.',
    detail: `### DMA Design

DMA Design was a Scottish studio founded in Dundee, best known before GTA for **Lemmings** (1991).

It developed the original **Grand Theft Auto** (1997) and *GTA 2*, was acquired by Take-Two, and was renamed **Rockstar North**. Most of the core team continued into the 3D-era games, which is why GTA III, Vice City and San Andreas carry the same design voice as the top-down originals.`,
    level: 'expert',
    relatedConcepts: ['rockstar-north', 'rockstar-games', 'gta-series'],
    category: 'company',
  },
  {
    id: 'take-two',
    keywords: ['take two', 'take-two interactive', 'parent company', 'strauss zelnick', 'ttwo', 'zynga', '2k'],
    phrases: ['take two interactive', 'the parent company'],
    title: 'Take-Two Interactive',
    summary:
      'Take-Two Interactive is the parent company of Rockstar Games, 2K and Zynga, and the publisher that owns the Grand Theft Auto and Red Dead franchises.',
    detail: `### Take-Two Interactive

Take-Two Interactive is the publicly traded parent company that owns **Rockstar Games**, **2K** and **Zynga**, among other labels. It is headquartered in New York City. **Strauss Zelnick** became Chairman in March 2007 and CEO in January 2011.

Rockstar operates as a label within it: Take-Two reports the revenue and handles investor relations, while Rockstar controls its own development and publishing decisions. This distinction matters when reading financial news about GTA — the record-breaking sales figures are Rockstar\u2019s games reported through Take-Two\u2019s earnings.

As of 14 September 2026 the important acquisition is **Zynga**, completed May 2022 for about **$12.7 billion** — Take-Two\u2019s move into mobile, with Zynga operating as its own label. Take-Two reported **12,909 full-time employees** at 31 March 2026, including 9,998 in development studios. For fiscal 2027 it guides **$8–8.2 billion in net bookings**, driven by the 19 November 2026 launch of GTA VI.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'gta-v-sales', 'strauss-zelnick'],
    category: 'company',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Ownership, employee count and earnings guidance: acquisitions, headcount and FY27 bookings move this entry.',
    sources: [
      'https://www.businesswire.com/news/home/20220523005631/en/Take-Two-Interactive-Software-Inc.-Completes-Combination-with-Zynga-Inc.',
      'https://ir.take2games.com/static-files/31b9a69d-016e-4d72-9d91-b911f1313bed',
    ],
  },
  {
    id: 'rockstar-studios',
    keywords: ['rockstar studios', 'rockstar san diego', 'rockstar vancouver', 'rockstar leeds', 'rockstar london', 'rockstar toronto', 'rockstar india', 'studios', 'rockstar dundee', 'rockstar australia'],
    phrases: ['the rockstar studios', 'rockstar development studios'],
    title: 'Rockstar\u2019s studios',
    summary:
      'Rockstar operates as a group of studios — North, San Diego, Leeds, Lincoln, London, Toronto, New England, India, Dundee and Australia — which co-develop its largest titles.',
    detail: `### Rockstar\u2019s studios

Rockstar is a group of studios rather than one. The main ones:

- **Rockstar North** (Edinburgh) — Grand Theft Auto.
- **Rockstar San Diego** (Carlsbad, California) — formerly Angel Studios; the **RAGE** engine, *Red Dead Redemption*, *Midnight Club*.
- **Rockstar Leeds** (England) — the *Stories* games on PSP, and portable conversions.
- **Rockstar Lincoln** (England) — quality assurance.
- **Rockstar London**, **Rockstar Toronto**, **Rockstar New England** (formerly Mad Doc, acquired 2008) and **Rockstar India** (Bangalore, opened 2016) — support and co-development.
- **Rockstar Dundee** (formerly Ruffian Games, acquired 2020) and **Rockstar Australia** (formerly Video Games Deluxe, acquired March 2025) — support studios.

As of 14 September 2026 the list above is current: Dundee (2020) and Australia (2025) are the two most recent additions.

The largest releases are credited to "**Rockstar Studios**" collectively, because hundreds of people across several sites work on them at once.`,
    level: 'expert',
    relatedConcepts: ['rockstar-games', 'rockstar-north', 'rockstar-san-diego', 'rockstar-vancouver', 'rage-engine', 'rockstar-dundee'],
    category: 'company',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Studio list: acquisitions and rebrands (most recently Australia in March 2025) move this entry.',
    sources: [
      'https://en.wikipedia.org/wiki/Team_Bondi',
    ],
  },
  {
    id: 'rockstar-san-diego',
    keywords: ['rockstar san diego', 'san diego', 'angel studios', 'midnight club', 'red dead redemption'],
    phrases: ['rockstar san diego', 'the san diego studio'],
    title: 'Rockstar San Diego',
    summary:
      'Rockstar San Diego, formerly Angel Studios, created the RAGE engine and leads the Red Dead and Midnight Club series.',
    detail: `### Rockstar San Diego

Rockstar San Diego began as **Angel Studios**, was acquired by Rockstar, and became the studio responsible for two things that shaped everything else:

1. **RAGE** — the Rockstar Advanced Game Engine, first used on *Table Tennis* and then on every major title since.
2. **Red Dead** — *Red Dead Revolver*, *Red Dead Redemption* and, with the wider Rockstar group, *Red Dead Redemption 2*.

It also made the **Midnight Club** racing series.`,
    level: 'expert',
    relatedConcepts: ['rage-engine', 'red-dead-series', 'midnight-club-series', 'rockstar-studios'],
    category: 'company',
  },
  {
    id: 'rockstar-vancouver',
    keywords: ['rockstar vancouver', 'vancouver', 'bully', 'max payne 3', 'barking dog'],
    phrases: ['rockstar vancouver', 'the vancouver studio'],
    title: 'Rockstar Vancouver',
    summary:
      'Rockstar Vancouver, formerly Barking Dog Studios, developed Bully and Max Payne 3 before being merged into Rockstar Toronto.',
    detail: `### Rockstar Vancouver

Rockstar Vancouver was formerly **Barking Dog Studios**, acquired by Rockstar and renamed. It developed **Bully** (2006) and **Max Payne 3** (2012).

After *Max Payne 3* the studio was folded into **Rockstar Toronto**, which is why the Vancouver name stops appearing on credits.`,
    level: 'expert',
    relatedConcepts: ['bully', 'max-payne-series', 'rockstar-studios'],
    category: 'company',
  },
  {
    id: 'rage-engine',
    keywords: ['rage', 'rage engine', 'rockstar advanced game engine', 'engine', 'game engine'],
    phrases: ['the rage engine', 'rockstar game engine', 'rockstar engine'],
    title: 'RAGE engine',
    summary:
      'RAGE is Rockstar\u2019s in-house game engine, first used for Table Tennis in 2006 and the foundation of every major Rockstar title since.',
    detail: `### RAGE (Rockstar Advanced Game Engine)

**RAGE** is Rockstar\u2019s in-house engine, created at Rockstar San Diego. It was first used publicly on **Table Tennis** (2006), then became the foundation for *GTA IV*, *GTA V*, *Red Dead Redemption* and *Red Dead Redemption 2*.

Building its own engine gave Rockstar control over streaming a large open world, crowd and traffic simulation, and the specific look of its lighting and materials.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-san-diego', 'gta-iv', 'gta-v', 'red-dead-redemption-2', 'open-world-design', 'euphoria'],
    category: 'tech',
  },
  {
    // A separate topic rather than a section inside `rage-engine`, because a
    // concept that shares a topic with another concept has no identity of its
    // own: `euphoria` inherited this topic's title, so comparing RAGE against
    // Euphoria printed the comparison header twice. One topic per concept keeps
    // every label unambiguous.
    id: 'euphoria',
    keywords: ['euphoria', 'naturalmotion', 'procedural animation', 'physics middleware', 'ragdoll'],
    phrases: ['euphoria physics', 'the physics engine', 'procedural animation', 'naturalmotion'],
    title: 'Euphoria physics',
    summary:
      'Euphoria is procedural animation and physics middleware from NaturalMotion, licensed by Rockstar to make character reactions simulated rather than pre-animated.',
    detail: `### Euphoria physics

Euphoria is procedural animation middleware from **NaturalMotion**, licensed by Rockstar rather than written in-house.

Instead of playing a pre-baked animation, Euphoria simulates how a body reacts to being hit, pushed or falling. That is why characters in *GTA IV* and *Red Dead Redemption* stagger, grab at nearby objects and try to stay upright rather than repeating a fixed death animation.

It is a separate layer from **RAGE**: RAGE is the engine that renders and simulates the world, while Euphoria decides how a body behaves inside it.`,
    level: 'intermediate',
    relatedConcepts: ['rage-engine', 'gta-iv', 'red-dead-redemption-2'],
    category: 'tech',
  },
  {
    id: 'open-world-design',
    keywords: ['open world', 'sandbox', 'level design', 'world design', 'streaming', 'immersion'],
    phrases: ['open world design', 'how rockstar builds worlds'],
    title: 'Open-world design',
    summary:
      'Rockstar\u2019s open worlds are built around continuous streaming, dense incidental detail, and a world that stays coherent whether or not a mission is running.',
    detail: `### Open-world design

Rockstar\u2019s approach to open worlds has been consistent since GTA III, and the details matter for why the games feel the way they do:

- **Continuous streaming** — the city loads as you move rather than pausing at boundaries, so there is no loading screen between districts.
- **Incidental density** — pedestrians, traffic, radio and ambient conversation exist for their own sake, not as mission content.
- **Mission-from-anywhere** — a mission marker is a location in a world you can reach however you like, which is what distinguishes this from a level-based game.
- **Coherence under interruption** — the world keeps simulating when you ignore the story, which is why so much of the memorable experience happens between missions.

*Red Dead Redemption 2* pushed the same principles further toward deliberate slowness: long animations, physical travel, and systems that resist being rushed.`,
    level: 'intermediate',
    relatedConcepts: ['rage-engine', 'gta-iii', 'red-dead-redemption-2', 'gta-v'],
    category: 'tech',
  },
  {
    id: 'rockstar-controversies',
    keywords: ['controversy', 'controversies', 'criticism', 'violence in games', 'censorship', 'ratings', 'backlash'],
    phrases: ['rockstar controversies', 'criticism of rockstar'],
    title: 'Controversies',
    summary:
      'Rockstar has been the focus of recurring controversies over violence, sexual content and working conditions, from the GTA series through Hot Coffee and Manhunt 2.',
    detail: `### Controversies

Rockstar has been at the centre of games-industry controversy repeatedly, and the pattern is usually the same: a title draws political attention, a ratings board or retailer responds, and the dispute becomes a case study.

- **Violence and crime** — the GTA series has been cited in political campaigns against video games since the early 2000s, particularly after GTA III and San Andreas.
- **Hot Coffee** (2005) — a disabled sex minigame found in the *San Andreas* code led to an **Adults Only** re-rating in the United States, a recall, and a US Federal Trade Commission investigation into game marketing.
- **Manhunt 2** (2007) — refused classification in several countries and initially rated AO in the US.
- **Working conditions** — reporting around *Red Dead Redemption 2* drew sustained criticism about long overtime hours during development.

The recurring question in all of these is where responsibility sits between developer, publisher, ratings board and retailer.`,
    level: 'intermediate',
    relatedConcepts: ['hot-coffee', 'manhunt', 'gta-v-sales', 'rockstar-games'],
    category: 'impact',
  },
  {
    id: 'hot-coffee',
    keywords: ['hot coffee', 'san andreas mod', 'ao rating', 'jack thompson', 'sex minigame', 'adults only'],
    phrases: ['the hot coffee controversy', 'hot coffee mod', 'the hot coffee minigame'],
    title: 'Hot Coffee',
    summary:
      'Hot Coffee was an unfinished, unreachable sex minigame left in GTA: San Andreas. Unlocked by a mod in June 2005, it forced an Adults Only re-rating, a recall, a ban in Australia and an FTC settlement.',
    detail: `### Hot Coffee (2005)

"Hot Coffee" is the name given to an **unfinished, unreachable minigame** left in the shipped code of *GTA: San Andreas*. The content was Rockstar's own — built and then disabled, not created by modders.

#### How it surfaced

- **8 June 2005** — modder **Patrick Wildenborg** ("PatrickW") received video of the content.
- **9 June 2005** — he released a patch on GTAGarage.com that re-enabled it, naming it "Hot Coffee". It was downloaded over a million times in four weeks.
- San Andreas had released on PS2 in **October 2004**, with the Windows and Xbox versions in **June 2005** — so the mod arrived just as the PC version shipped.

Rockstar initially claimed the minigame was the work of "a determined group of hackers who have gone through significant trouble to alter scenes in the official version of the game". **That claim collapsed on 19 July 2005**, when GameSpot confirmed the content was already present in the shipped PS2 code.

#### The consequences

- **20 July 2005** — the **ESRB re-rated San Andreas from M to AO (Adults Only)**. Take-Two suspended production.
- **29 July 2005** — Australia's OFLC stripped the game's classification, effectively banning it until the content was removed.
- Rockstar re-released the game with the content removed and offered replacement discs.
- **8 June 2006** — the **FTC settled** over failing to disclose the extent of graphic content. This was a **warning, not a fine**: the order threatened penalties of up to **$11,000 per violation** only for future non-compliance. The FTC also pushed the ESRB to raise its own maximum fines for undisclosed content to **$1 million**.

#### Two separate lawsuits, often conflated

This is the detail most retellings get wrong — there were **two different cases**:

| Case | Filed | Outcome |
|---|---|---|
| **Consumer class action** (*Florence Cohen v. Take-Two*) | 27 July 2005 | Settled **28 January 2008**. Consumers could claim **up to $35** (or $10 without proof of purchase), plus **$1.3m in attorney fees** and an **$860,000 charitable donation**. The class was **decertified on 31 July 2008**. |
| **Shareholder securities class action** | — | Settled **2 September 2009** for a figure above **$20 million**. |

The widely-quoted "$20 million Hot Coffee settlement" is the **shareholder** action, not consumer compensation.

#### Why it still matters

Hot Coffee is the standard example of why **hidden-but-present content is treated as present**. The rating authorities regulate what ships on the disc, not what the developer intends players to reach — so an unfinished feature that nobody could access still triggered a recall, a re-rating, a national ban and two lawsuits.

Rockstar's response included an in-joke years later: a *GTA IV* Easter egg in which the Statue of Happiness resembles Hillary Clinton holding a coffee cup.`,
    level: 'expert',
    relatedConcepts: ['rockstar-controversies', 'gta-san-andreas', 'rockstar-games', 'esrb', 'jack-thompson'],
    category: 'impact',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The 2005\u20132009 events are settled. Nothing here drifts, but the settlement figures are frequently misreported, so re-check the case attribution if updating.',
    sources: [
      'https://www.gamespot.com/articles/confirmed-sex-minigame-in-ps2-san-andreas/1100-6129301/',
      'https://www.ftc.gov/news-events/news/press-releases/2006/06/ftc-video-game-maker-settles-charges-it-failed-disclose-material-content',
      'https://en.wikipedia.org/wiki/Hot_Coffee_(minigame)',
    ],
  },
  {
    id: 'gta-v-sales',
    keywords: ['sales', 'best selling', 'records', 'commercial success', 'revenue', 'billion', '230 million', '475 million', 'copies sold'],
    phrases: ['gta v sales', 'how much did gta v sell', 'sales records', 'how many copies did gta v sell'],
    title: 'GTA V sales and cultural impact',
    summary:
      'GTA V has sold over 230 million copies as of August 2026, with the GTA franchise near 475 million — one of the best-selling entertainment products ever released.',
    detail: `### GTA V sales and cultural impact

*GTA V* is the commercial outlier in the series and in the industry: it launched 17 September 2013 and was re-released across three console generations, so its sales accumulated across more than a decade rather than in one launch window.

As of 14 September 2026, using Take-Two\u2019s 7 August 2026 Q1 FY27 earnings:

- **GTA V: over 230 million units sold-in**, up from 225 million in February 2026 — still about 5 million a quarter. Take-Two calls it the best-selling title of the past decade by units and dollars.
- **GTA franchise: almost 475 million units** lifetime.
- **Red Dead Redemption 2: over 87 million** (third best-selling game ever, past Wii Sports); **Red Dead franchise: nearly 116 million**.

Two things are usually drawn from that:

- **Re-release strategy** — the same game sold again on new hardware, which is common now and was less so in 2013.
- **GTA Online** — a persistent multiplayer world whose ongoing revenue changed Rockstar\u2019s release cadence, since a live game competes for the attention that a single-player expansion would have had.

Its cultural presence is broad enough that references to Los Santos, Trevor or "GTA" as shorthand for open-world crime games are understood outside the audience that plays them.`,
    level: 'beginner',
    relatedConcepts: ['gta-v', 'gta-online', 'take-two', 'rockstar-controversies'],
    category: 'impact',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Sales totals move every quarter with Take-Two earnings; re-check against the latest 10-Q/earnings call.',
    sources: [
      'https://www.gamedeveloper.com/business/gta-v-surpasses-230-million-sales-months-before-gta-vi-touches-down',
      'https://ir.take2games.com/static-files/31b9a69d-016e-4d72-9d91-b911f1313bed',
    ],
  },
];
