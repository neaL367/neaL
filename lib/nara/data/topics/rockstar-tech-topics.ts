import type { DetailedTopic } from './types';

/**
 * Rockstar's technology: engine, middleware, and the production reality.
 *
 * WHY THIS FILE IS SEPARATE
 * -------------------------
 * These nine entries answer "how are Rockstar's games actually built" rather
 * than "what happened in this game". They cluster around RAGE and the third-
 * party middleware layered into it, so they are kept together and cross-link
 * each other heavily.
 *
 * ATTRIBUTION IS THE POINT OF THIS FILE
 * -------------------------------------
 * The engine answers from `detail` verbatim, so every sentence has to survive
 * being quoted out of context. Three qualities of evidence appear here and are
 * never blended:
 *
 *   - Established fact (RAGE's first title, Bullet's licence, Bink's owner).
 *   - REPORTED CLAIM, named at the point of use (Digital Foundry's frame-rate
 *     measurements, Pavlovich's stem system, Rockstar's own clarifications).
 *   - COMMUNITY SPECULATION, labelled as such (the Euphoria rewrite rumour, the
 *     GTA IV swing-set mechanism, "RAGE 9").
 *
 * Where the research ran out — the three-protagonist camera transition, GTA
 * Online's network model, RDR2's development cost — the entry says the question
 * is open instead of answering it plausibly. A confident wrong answer is worse
 * than an honest gap in a knowledge base that quotes itself as a source.
 */
export const ROCKSTAR_TECH_TOPICS: DetailedTopic[] = [
  {
    id: 'rage-engine',
    keywords: [
      'rage', 'rockstar advanced game engine', 'rockstar engine', 'game engine',
      'rage technology group', 'age engine', 'angel studios', 'graphics engine',
      'renderer', 'directx', 'vulkan', 'engine version',
    ],
    phrases: [
      'rage engine',
      'the rage engine',
      'rockstar advanced game engine',
      'rockstars engine',
    ],
    title: 'RAGE engine',
    summary:
      'RAGE is Rockstar\u2019s in-house game engine, built from 2004 by the RAGE Technology Group at Rockstar San Diego and used by every major Rockstar game since Table Tennis in 2006.',
    detail: `### RAGE (Rockstar Advanced Game Engine)

**RAGE** — the Rockstar Advanced Game Engine — is Rockstar's own game engine. It is proprietary: Rockstar owns it and does not license it out. It is maintained by the **RAGE Technology Group**, a division of **Rockstar San Diego**.

Its lineage runs through that studio. Rockstar San Diego was formerly **Angel Studios**, whose **AGE** engine descended from an earlier in-house engine called **ARTS**, used for *Major League Baseball Featuring Ken Griffey Jr.* (1998) and *Midtown Madness* (1999); *Midtown Madness 2* (2000) was the first game on AGE. Angel Studios was sold to Take-Two in **2002**, rebranded Rockstar San Diego, and the sale carried AGE with it. AGE was later renamed RAGE.

#### Why it exists

RAGE was **created from 2004**, and the trigger is industry history rather than an engineering one. Rockstar's PlayStation 2-era games ran on **RenderWare**, middleware owned by Criterion. When **EA acquired Criterion in 2004**, Rockstar's core technology was suddenly owned by a competitor, so Rockstar built its own and opened the RAGE Technology Group.

The first shipped RAGE title is **Rockstar Games Presents Table Tennis**, released on **Xbox 360 on 23 May 2006** — a deliberately small first project for a brand-new engine.

#### What has shipped on it

- *Table Tennis* (2006) — first release.
- *Grand Theft Auto IV* (2008), plus the episodes *The Lost and Damned* and *The Ballad of Gay Tony* (2009).
- *Midnight Club: Los Angeles* (2008).
- *Red Dead Redemption* (2010) and *Undead Nightmare*.
- *Max Payne 3* (2012).
- *Grand Theft Auto V* (2013).
- *Red Dead Redemption 2* (2018).
- *Grand Theft Auto VI* (2026).

#### Graphics and rendering milestones

- **Max Payne 3 (2012)** was RAGE's move to **DirectX 11** on PC, with stereoscopic 3D support. It was also the first RAGE title to render the **same 720p resolution on both PlayStation 3 and Xbox 360**, after a generation of ports that did not.
- **Seventh-generation resolution disparity**, as measured by Digital Foundry: *GTA IV* ran at **640p on PS3** against **720p on Xbox 360**; *Midnight Club: Los Angeles* at **960x720 on PS3** against **1280x720 on 360**; *Red Dead Redemption* at **640p on PS3** against **720p on 360**. By *GTA V* (2013) both consoles reached **720p**.
- **Eighth generation (2014):** RAGE was reworked for PlayStation 4 and Xbox One at **1080p**. The 2015 PC release of *GTA V* added **4K at 60fps**, greater draw distance, improved shadow mapping and tessellation.
- **Red Dead Redemption 2** added **physically based rendering**, **volumetric clouds and fog**, and **pre-calculated global illumination**. **HDR** followed in **May 2019 (patch 1.09)**; **DLSS** in **July 2021**, with Nvidia claiming roughly a **45% boost at 4K**; **AMD FSR 2.0** in **September 2022 (Title Update 1.31)**.

#### The one authoritative Rockstar engine talk

Rockstar rarely presents its technology in public. The exception found in this research is **SIGGRAPH 2019**, in the "Advances in Real-Time Rendering in Games" course: **Fabian Bauer of Rockstar**, *"Creating the Atmospheric World of Red Dead Redemption 2: A Complete and Integrated Solution"*, **Monday 29 July 2019**. The course page at advances.realtimerendering.com/s2019/ confirms the session, the speaker and the abstract. The exact slide-deck filename was not recovered, so treat any specific deck URL as unverified.

#### Two things to be careful about

**RAGE's internal module decomposition is unverified.** Claims that RAGE "handles rendering, streaming, physics and animation as modules X, Y and Z" are not sourced to Rockstar. A 2009 IGN assessment described its strengths — large streaming worlds, complex AI, weather, fast network code, and support for multiple gameplay styles — but that is journalism, not a specification.

**The name is ambiguous.** "RAGE" is also the title of id Software's 2011 game *RAGE*, whose engine is **id Tech 5** — a different engine entirely. There is no Asobo clash: Asobo's engine is called **Zouna**. And **"RAGE 9" for GTA VI is community nomenclature, not an official Rockstar version number**; Rockstar has never published engine version numbers.`,
    level: 'expert',
    relatedConcepts: [
      'rockstar-san-diego', 'renderware', 'euphoria', 'open-world-design',
      'table-tennis', 'gta-iv', 'max-payne-3', 'gta-v',
      'red-dead-redemption-2', 'gta-vi', 'rockstar-games',
    ],
    category: 'tech',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The GTA VI entry in the shipped-titles list and the engine\u2019s newest features. Any future GTA VI technical detail, and any further renderer or upscaling addition, changes this entry.',
    sources: [
      'https://advances.realtimerendering.com/s2019/',
      'https://en.wikipedia.org/wiki/Rockstar_Advanced_Game_Engine',
      'https://en.wikipedia.org/wiki/Rockstar_San_Diego',
    ],
  },

  {
    id: 'renderware',
    keywords: [
      'renderware', 'criterion', 'criterion games', 'middleware', 'ps2 engine',
      'gta iii engine', 'xbox engine', 'ea criterion', 'third party engine',
    ],
    phrases: ['renderware', 'the renderware engine', 'criterion renderware'],
    title: 'RenderWare',
    summary:
      'RenderWare was Criterion\u2019s middleware engine, used by Rockstar for the PlayStation 2-era Grand Theft Auto games until EA bought Criterion in 2004 and Rockstar moved to its own RAGE engine.',
    detail: `### RenderWare

**RenderWare** was a game engine and middleware suite from **Criterion Games**, and it is the technology Rockstar's PlayStation 2-era games were built on — including **Grand Theft Auto III**, **Vice City** and **San Andreas**, along with their Windows and Xbox ports.

It mattered commercially as much as technically: **IGN reported in January 2003 that RenderWare had "grossed $2 billion"**, which is what a widely licensed middleware engine looked like before large studios moved to in-house technology.

The decisive event is the ownership change. **In 2004, EA acquired Criterion**, which meant the middleware underneath Rockstar's most valuable franchise was owned by a direct competitor. Rockstar switched off RenderWare and opened the **RAGE Technology Group**, building its own engine from 2004; the first RAGE title shipped in 2006, and *GTA IV* in 2008 was the first *Grand Theft Auto* built on it.

**Attribute this carefully.** The *sequence* — EA buys Criterion, Rockstar stops using RenderWare, Rockstar builds RAGE — is solid. The *motivation* — avoiding a dependency on a competitor-owned engine — is reported and inferred rather than stated. **No first-person Rockstar statement explaining the decision was found**, so it should be presented as the obvious reading of the timeline, not as a documented reason.`,
    level: 'intermediate',
    relatedConcepts: [
      'gta-iii', 'gta-vice-city', 'gta-san-andreas', 'gta-era-3d',
      'rage-engine', 'rockstar-north', 'dma-design', 'gta-series',
    ],
    category: 'tech',
    sources: [
      'https://en.wikipedia.org/wiki/RenderWare',
      'https://en.wikipedia.org/wiki/Criterion_Games',
    ],
  },

  {
    id: 'euphoria',
    keywords: [
      'euphoria', 'naturalmotion', 'dynamic motion synthesis', 'dms', 'endorphin',
      'ragdoll', 'procedural animation', 'character animation', 'animation middleware',
      'motor control', 'zynga naturalmotion', 'harry denholm',
    ],
    phrases: [
      'euphoria physics',
      'the euphoria engine',
      'naturalmotion euphoria',
      'dynamic motion synthesis',
    ],
    title: 'Euphoria physics',
    summary:
      'Euphoria is NaturalMotion\u2019s animation middleware, which drives a simulated character with active motor control so it braces, grabs and staggers instead of collapsing like a ragdoll.',
    detail: `### Euphoria physics

**Euphoria** is character animation middleware from **NaturalMotion**, built on **Dynamic Motion Synthesis (DMS)** — animating 3D characters on the fly, in NaturalMotion's own wording, "based on a full simulation of the 3D character, including body, muscles and motor nervous system".

#### The three-way distinction that actually explains it

- **Pre-baked animation** plays authored clips back. It looks good and costs little, but it is state-independent: the character performs the same motion no matter what is happening around it.
- **Ragdoll** is a passive rigid-body response with no motor control at all. The character collapses, and it cannot *try* anything.
- **DMS/Euphoria** is **active motor control driving a physical body**. The character attempts things — brace, grab, stagger, protect a wound — and the physics decides whether the attempt succeeds.

That last point is the whole idea, and it is why *GTA IV* pedestrians appear to *try* to stay upright while falling, and why the same knockdown does not replay identically.

Two engineering consequences follow. Euphoria layers behaviour and motor control **over** an existing physics solver; it is not itself the rigid-body solver, and it was compatible with all commercial physics engines. And because actions are synthesised in real time, they differ on every replay.

It is derived from **Endorphin**, NaturalMotion's offline "virtual stuntman" tool, reinvented for real time. **Harry Denholm**, NaturalMotion's engineering lead, joined in 2004 as part of a **six-person incubatory team**.

#### Rockstar's involvement

Denholm has said the discussions began around **Red Dead Redemption**: a small NaturalMotion team integrated Euphoria with **RAGE**, iterating with the gameplay and animation teams in **San Diego**. Denholm was technical lead for the RAGE integration, the runtime engineering and the engine-specific tools.

- **27 February 2007** — a formal NaturalMotion/Rockstar partnership was announced.
- **28 June 2007** — Euphoria's use in *GTA IV* was announced by press release enclosed with the second GTA IV trailer. *GTA IV* (2008) was the **first commercially released Euphoria title**.

Rockstar titles that use Euphoria: **GTA IV**, **Red Dead Redemption**, **Max Payne 3**, **GTA V** and **Red Dead Redemption 2**. Rockstar described Euphoria as **"radically overhauled"** for RDR2 — that is a Rockstar statement relayed by GamingBolt in October 2018, so attribute it as relayed. In a VG247 interview, Rockstar's Phil Hooker said the studio "completely reworked its AI and animation systems" for RDR2.

Other licensees were few: *Star Wars: The Force Unleashed* 1 and 2, *Backbreaker*, the cancelled LucasArts Indiana Jones game, *BioShock Infinite*, *Horizon Zero Dawn*, and NaturalMotion's own *Clumsy Ninja* (2013, the first mobile Euphoria title). That scarcity is part of why Euphoria reads as a Rockstar signature even though Rockstar never owned it.

#### Ownership and the end of licensing

**In 2014, Zynga acquired NaturalMotion** in a deal reported at about **$527 million** — the figure is press-level rather than audited, so present it as reported. **In 2017, NaturalMotion announced it would stop licensing Euphoria** and its other technology in order to focus on mobile games.

#### What is not established

- **The claim that Rockstar had to rewrite Euphoria itself after the Zynga acquisition is community speculation with no credible sourcing**, and it sits awkwardly with the documented fact that Euphoria is integrated into RAGE's source code. Treat it as unsourced.
- **Whether Euphoria uses finite state machines or behaviour trees is unverified.** Neither NaturalMotion nor Rockstar documentation states it, and the "behaviour sets" phrasing traces only to a low-quality blog. Describe Euphoria as exposing authored, context-reactive **behaviours** without claiming an implementation.
- **The GTA IV swing-set glitch has no technical explanation.** The phenomenon — a swing set in Broker/Firefly Projects launching vehicles at extreme velocity — is community-documented, but the usual "unintended physics spring with enormous restitution" account is community speculation, not a finding.
- **Euphoria in GTA VI is unverified.** No Rockstar or NaturalMotion statement says it is used.`,
    level: 'expert',
    relatedConcepts: [
      'rage-engine', 'gta-iv', 'red-dead-redemption', 'red-dead-redemption-2',
      'max-payne-3', 'gta-v', 'rockstar-san-diego', 'gta-vi',
    ],
    category: 'tech',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Euphoria\u2019s licensing status (ended in 2017) and whether it appears in GTA VI, which is currently unverified. Both can change with a single Rockstar or NaturalMotion statement.',
    sources: [
      'https://en.wikipedia.org/wiki/Euphoria_(software)',
      'https://en.wikipedia.org/wiki/NaturalMotion',
    ],
  },

  {
    id: 'open-world-design',
    keywords: [
      'open world', 'streaming', 'asset streaming', 'loading screens', 'no loading screens',
      'level streaming', 'lod', 'draw distance', 'pop in', 'seamless world',
      'streaming budget', 'renderdoc',
    ],
    phrases: [
      'open world design',
      'open world streaming',
      'asset streaming',
      'no loading screens',
    ],
    title: 'Open-world design and streaming',
    summary:
      'Rockstar\u2019s open worlds stream assets continuously so the player can cross a whole map without a loading screen, trading memory and streaming budget for uninterrupted travel.',
    detail: `### Open-world design and streaming

Rockstar's open worlds are built so that the player can traverse an entire map **without a loading screen**. Everything the world needs is streamed in and out while you play, which is why the games feel continuous — and also why they are so memory-constrained on old hardware.

#### The best technical evidence for the claim

Independent graphics programmer **Adrian Courrèges** analysed the PC (DirectX 11) build of *GTA V* with RenderDoc and concluded: "in GTA V you can play for hours, drive hundreds of kilometers into a huge open-world without a single interruption... considering the heavy streaming of assets going on and the specs of the PS3 (256MB RAM and 256MB of video memory) it's quite amazing the game doesn't crash after 20 minutes, it's a real technical prowess."

Two concrete mechanics come out of that teardown:

- A frame begins with tasks like "creating and deleting textures, shader resource views, unordered access views, updating descriptors, buffers" — a continuous, **per-frame asset residency and eviction manager** rather than a discrete load step.
- The **realtime environment cubemap is regenerated every frame from a thin, low-detail representation of the world** — terrain, sky and certain buildings, with no characters or cars. That is an explicit level-of-detail trick for reflections: cheap geometry, correct large-scale lighting.

*Red Dead Redemption 2* likewise "streams data constantly".

#### What "a good open world" actually means

Digital Foundry's framing is useful: the best open worlds mix "a large sense of scale with vast swathes of terrain... with a high volume of granular, close-range detail and a rich simulation". RDR2 ships aggressive **TAA**, which DF calls "a must" given its long draw distances, and **per-object motion blur** — for perhaps the first time in Rockstar history.

#### Loading

DF measured the difference on *GTA V*: **menu to story mode takes about 20 seconds on PS5 versus 2 minutes 8 seconds on PS4**, and the PS4's post-download installation took "over an hour". The gap is not only faster hardware — it is a change in how the game gets into memory.

#### The AI behind the world

On the record in VG247, **Phil Hooker** (director of technology at Rockstar North) and **David Hynd** (lead AI programmer) described RDR2's approach. Rockstar "completely reworked its AI and animation systems" for the game's interaction space. Hooker said the pedestrian interactions still surprise the developers — dialogue they have not heard before — and that a reaction "can be entirely contextual to the person you are interacting with and what they are doing", with "a huge amount of subtle gestures and animations".

Hynd's example is barging into a saloon: the AI might "stop and look", or "the music may stop playing — the AI will weigh you up for a brief moment before going back about their business. Or not, if they see you as a threat." Whether an NPC reacts depends on "your clothes, blood stains, mud, location, what the NPC is doing, your Honor rating, how much alcohol you've consumed", and interactions happen in-world by aiming rather than through a dialogue menu.

#### One caveat on the "deliberate slowness" thesis

RDR2's slow movement and animation-driven pacing are widely discussed critically, but **no Rockstar developer interview articulating that as a stated design philosophy was found in this research**. Treat the thesis as critical analysis, not as a Rockstar statement.

#### What is not explained

The streaming system itself has never been documented by Rockstar. The mechanics above are reverse-engineered from a shipped PC build by an independent researcher, which makes them strong evidence but not a specification — and no equivalent teardown exists for RDR2.`,
    level: 'expert',
    relatedConcepts: [
      'gta-v', 'red-dead-redemption-2', 'rage-engine', 'three-protagonist',
      'rockstar-north', 'gta-san-andreas',
    ],
    category: 'tech',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The per-console loading figures and any future streaming or load-time changes; the quoted Digital Foundry measurements describe specific 2013-2022 builds.',
    sources: [
      'https://www.adriancourreges.com/blog/2015/11/02/gta-v-graphics-study/',
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_V',
    ],
  },

  {
    id: 'radio-stations',
    keywords: [
      'radio stations', 'gta radio', 'soundtrack', 'licensed music', 'in game radio',
      'talk radio', 'self radio', 'original score', 'music supervisor', 'dj',
      'ivan pavlovich', 'flying lotus', 'tangerine dream', 'dj shadow', 'music licensing',
    ],
    phrases: [
      'gta radio stations',
      'gta radio',
      'the radio stations',
      'gta soundtrack',
      'self radio',
    ],
    title: 'GTA radio stations',
    summary:
      'GTA\u2019s radio stations are the series\u2019 in-car soundtrack: 18 stations including two talk stations in GTA V, built from licensed music, hired DJs and, from GTA V onward, an original interactive score.',
    detail: `### GTA radio stations

Radio is the soundtrack of *Grand Theft Auto*: music plays inside vehicles, framed as broadcast from in-world stations with DJs and adverts. Rockstar's music supervisor for *GTA V*, **Ivan Pavlovich**, is the key named source on how it is assembled (Polygon, 3 October 2013; The Hollywood Reporter, 26 October 2013).

#### How many stations, and how many tracks

The published counts disagree, so the honest answer reports the disagreement rather than picking a number:

- Wikipedia's *GTA V* lead says **16 stations with 441+ licensed tracks plus two talk stations**; the body of the same article says tracks are shared across **18 stations including two talk stations**, with an initial plan for **900+ tracks refined to 241**.
- *Rolling Stone* says **18 stations**.

The defensible sentence is: **18 stations including two talk-radio stations, and the licensed-track count is inconsistently reported.**

#### Design intent

The stations exist to place the player in the setting. Pavlovich on the pop station Non-Stop-Pop FM: "the first time you get off an airplane in L.A. and you hear the radio and the pop just seeps out... We wanted that. It really connects you to the world." The station "reflects the environment in which the game is set". Licensing for *GTA V* needed more discernment than *GTA IV* because the music carried more of the Californian atmosphere — tracks were chosen for a "Cali feel".

#### DJs

The process is deliberate rather than incidental: the team developed an understanding of where a station's music was going, then would "select a DJ to host the station", chosen to match the genre. The concrete example is **Los Santos Rock Radio**, where Rockstar licensed classic rock and chose **Kenny Loggins**.

#### Original music written for the game

**GTA V was the first GTA with an original score** — earlier entries used licensed music only. The composers were **Tangerine Dream**, **Woody Jackson**, **The Alchemist** and **Oh No**, with **DJ Shadow** layering, mixing and arranging the interactive in-game score into the album version. The team produced **over twenty hours of music** across several years.

- **Edgar Froese**, Tangerine Dream's founder, initially turned the video-game offer down; after being flown to the studio and shown the game, he changed his mind. **His first eight months produced 62 hours of music.**
- Division of labour: **Jackson scored Trevor's missions**, influenced by The Mars Volta and Queens of the Stone Age; **Froese interpolated funk into Jackson's hip-hop influences**. Froese and Jackson sent their work to **The Alchemist and Oh No**, who heavily sampled it — "We pitched stuff up, chopped it, tweaked it" — and **DJ Shadow** then mixed it and matched it to gameplay.
- **Flying Lotus** hosts **FlyLo FM**, including original work he composed for the game. **Self Radio** is a PC-exclusive station that lets PC players add their own music files.

#### The technical part: stems

The most concrete mechanism Pavlovich describes is a **"stem-based" system used to make music fit dynamic game factors** — composing music that can underscore whatever outcome the player produces immediately after a mission. The pipeline ran through individual stems: each stem pack included **up to 62 five-minute WAV files**, sent to Pavlovich in New York, who "created, very professionally, a mix down for each of the eight stems needed for a mission".

That is the reason the score reacts instead of looping: the game is not choosing between finished tracks, it is mixing the components of one.

#### Red Dead Redemption 2 and GTA Online

RDR2's score was composed by **Woody Jackson** and described as an "interactive, dynamic score"; the vocal soundtrack was produced by **Daniel Lanois**, who collaborated with D'Angelo, Willie Nelson, Rhiannon Giddens and Josh Homme. Lanois wrote "Cruel World" for Willie Nelson; a hurricane prevented Nelson from recording in time, so it went to **Josh Homme, who recorded the vocals in an Australian studio while on tour**; Nelson later recorded it in Los Angeles, and **both versions were included**. **No dedicated technical breakdown of RDR2's interactive-score implementation was found**, so its exact mechanism should not be described.

GTA Online's music has kept being added: ***Arena War (Official Soundtrack)*** by **HEALTH** (1 March 2019); ***DāM-FunK Presents The Music of Grand Theft Auto Online Original Score*** (15 December 2023); and **Dr. Dre**, who contributed new music in The Contract update (December 2021), released as a digital EP in February 2022 via Aftermath/Interscope.`,
    level: 'intermediate',
    relatedConcepts: [
      'gta-v', 'gta-iv', 'red-dead-redemption-2', 'gta-online',
      'woody-jackson', 'lazlow-jones', 'gta-series',
    ],
    category: 'tech',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The station and track counts, which are inconsistently reported and were revised during development, and GTA Online\u2019s music releases, which are still being added.',
    sources: [
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_V',
      'https://en.wikipedia.org/wiki/Red_Dead_Redemption_2',
    ],
  },

  {
    id: 'three-protagonist',
    keywords: [
      'three protagonists', 'character switching', 'protagonist switching',
      'character wheel', 'michael franklin trevor', 'gta v characters',
      'switching characters', 'multiple protagonists',
    ],
    phrases: [
      'three protagonist switching',
      'character switching',
      'switching protagonists',
      'the character wheel',
    ],
    title: 'Three-protagonist switching',
    summary:
      'Three-protagonist switching lets GTA V\u2019s player jump between three characters at almost any moment, the camera flying across the map to land on the next character already mid-behaviour.',
    detail: `### Three-protagonist switching

*GTA V* has **three playable protagonists** — Michael, Franklin and Trevor — and lets the player switch between them at almost any moment outside missions, using a character wheel. It is a design feature as much as a technical one: three lives in one city let the story move between different tones and different parts of Los Santos without separate campaigns.

#### What the switch looks like

The observable behaviour is well documented. The camera pulls up and away from the current character, travels across the world — using an aerial view rather than a hard cut — and descends on the destination character, who is **already in the middle of doing something**: walking, driving, arguing, being thrown out of a bar. The point of the transition is that the world keeps running while you are not looking at it.

#### What is not established

**This is where the sourcing runs out.** The feature itself is clearly documented, but **no Rockstar talk, Digital Foundry breakdown or engineering article explaining the camera-transition implementation was found**, and **Rockstar has never explained it publicly**. Specifically unsourced:

- whether the destination character's surroundings are streamed *during* the flight or were already resident;
- whether off-screen protagonists run a simplified simulation, a full one, or are effectively scripted until selected;
- how the game guarantees the destination is a valid, unoccupied state to hand control back in.

Those are reasonable questions and there are plausible answers, but no primary source states one. Describe the behaviour, and say plainly that the mechanism is unexplained rather than asserting a design.`,
    level: 'intermediate',
    relatedConcepts: [
      'gta-v', 'open-world-design', 'rage-engine', 'los-santos', 'rockstar-north',
    ],
    category: 'tech',
  },

  {
    id: 'rockstar-tech-pipeline',
    keywords: [
      'middleware', 'technology pipeline', 'bullet physics', 'bink video', 'scaleform',
      'facefx', 'face capture', 'facial animation', 'tick rate', 'frame rate',
      'animation tick', 'physics engine', 'ui middleware', 'video codec',
    ],
    phrases: [
      'rockstar technology pipeline',
      'rockstar middleware',
      'bullet physics',
      'bink video',
      'scaleform ui',
      'tick rate decoupling',
    ],
    title: 'Rockstar\u2019s technology pipeline and middleware',
    summary:
      'Rockstar\u2019s games combine its own RAGE engine with third-party middleware — Bullet for physics, Euphoria for character behaviour, Bink for video, Scaleform for UI — around animation decoupled from the render frame rate.',
    detail: `### Rockstar's technology pipeline and middleware

RAGE is Rockstar's own engine, but it is not built alone: the games are assembled from RAGE plus third-party middleware, and the way those parts interact explains a lot about how the games actually behave.

#### Bullet — rigid-body physics

**Bullet** is an open-source 3D physics engine by **Erwin Coumans**, released under the zlib licence. It covers collision detection plus soft-body and rigid-body dynamics, with discrete and continuous collision detection, GJK-based convex shapes, triangle mesh support, constraints with limits and motors, COLLADA physics import, and optional PlayStation 3 Cell SPU, CUDA and OpenCL optimisations. Coumans received a **Scientific and Technical Academy Award for Bullet in 2015**.

The per-title claim that Rockstar uses Bullet traces to **vendor-side and community sources** — Bullet and AMD were *claiming* RAGE as a customer, which is not the same as a Rockstar statement — so treat the specific game list as reported rather than confirmed.

**The distinction that matters most:** Bullet is the rigid-body solver, while **Euphoria is the behaviour and motor-control layer on top of it**. The popular framing of "GTA IV uses Bullet *versus* Euphoria" is a category error; they occupy different layers of the same character.

#### Bink Video — cutscene and video playback

**Bink Video** is a proprietary video codec from **RAD Game Tools**, now part of **Epic Games Tools** after **Epic acquired RAD's technology and business on 7 January 2021**. It first shipped on **22 March 1999**.

Technically it is a hybrid block-transform (DCT) and wavelet codec using **16 encoding techniques**, optimised for **low decode cost rather than compression ratio**, with per-console optimisations, multithreaded and SIMD decode, and an optional alpha channel for compositing video over 3D. Games use it for FMV and cutscenes and for video textures played inside the engine. Its original format was reverse-engineered by FFmpeg, though the newer **bk2** container is not yet supported there. Bink was inducted into Game Developer's Front Line Awards Hall of Fame in **2009**. It is listed as RAGE middleware, but **per-title usage is not authoritatively confirmed**.

#### Scaleform — the UI layer

**Scaleform** is hardware-accelerated UI middleware built on Flash/Adobe AIR: vector interfaces and ActionScript menus and HUDs drawn by the GPU. **Autodesk acquired it in 2011.** The evidence for *GTA V* specifically is artifact-level — the shipped game contains Scaleform **.gfx** files and a community decompilation of the GTA V Scaleform index exists — which is reasonably strong, but community-sourced rather than a Rockstar confirmation.

#### Face capture, and one middleware claim to reject

**FaceFX** (from OC3 Entertainment, audio-driven facial and lip-sync animation) is sometimes listed as Rockstar middleware. **This is unverified.** No credible source ties it to any Rockstar title.

What RDR2's face pipeline actually is, as documented: **face cameras recorded performers' facial reactions**, and the resulting **facial animation was then refined through manual animation**. A purely audio-driven pipeline is in tension with that, which is a further reason not to assert FaceFX.

#### Tick-rate decoupling — why the games can feel heavy

The single most useful technical detail for explaining input feel comes from Digital Foundry. On *GTA V* for PC, **"60fps was easily achievable, but character animation wasn't running at 60fps, even when the renderer was"**, and camera pans stuttered as well. On the 2022 console builds, "**character movement is much improved**", but "**cloth effects still run at a lower frame-rate along with other incidental animations**".

That is decoupling: the renderer and the simulation do not tick together, so the image can be smooth while character motion and cloth update at a lower rate. DF also described *GTA V*'s input lag before 2022 as "very high" and "unacceptably high" — the same design choice showing up as controller feel rather than as a frame counter.`,
    level: 'expert',
    relatedConcepts: [
      'rage-engine', 'euphoria', 'red-dead-redemption-2', 'gta-v',
      'max-payne-3', 'rockstar-san-diego',
    ],
    category: 'tech',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Middleware ownership and versions — Bink moved to Epic Games Tools in 2021, and any change in what Rockstar licenses (or in the tick-rate behaviour) invalidates parts of this entry.',
    sources: [
      'https://en.wikipedia.org/wiki/Bullet_(software)',
      'https://en.wikipedia.org/wiki/Bink_Video',
      'https://en.wikipedia.org/wiki/Scaleform',
    ],
  },

  {
    id: 'rdr2-production-scale',
    keywords: [
      'rdr2 production', 'red dead redemption 2 cost', 'rdr2 budget', 'mocap',
      'motion capture', 'dialogue lines', 'voice actors', 'development team size',
      '100 hour weeks', 'crunch', 'dan houser interview', 'vulture interview',
      'development time',
    ],
    phrases: [
      'rdr2 production scale',
      'red dead redemption 2 production',
      'rdr2 development',
      'rdr2 mocap',
      'the 100 hour weeks',
    ],
    title: 'Red Dead Redemption 2\u2019s production scale',
    summary:
      'Red Dead Redemption 2 was made by roughly 1,600 people over eight years and carries about 500,000 lines of dialogue, 300,000 animations and 2,200 days of motion capture.',
    detail: `### Red Dead Redemption 2's production scale

The figures here trace to **Dan Houser's Vulture interview** with Harold Goldberg, published **14 October 2018** — with one important exception, noted below, from reporting a week later.

#### The numbers Houser gave

- Main-story script: **about 2,000 pages**. Counting everything, Houser estimated the stacked pages **"would be eight feet high"**.
- **1,200 actors, all SAG-AFTRA; 700 of them with voice lines.**
- **500,000 lines of dialogue.**
- **300,000 animations.**
- **2,200 days of motion capture**, with sessions beginning in **2013** — against **five days** of mocap for *GTA III*.
- A development team of **about 1,600 people** across all Rockstar studios, co-opted into one team, over roughly **eight years**.
- Iteration was extreme even on marketing: on trailers, "we probably made 70 versions, but the editors may make several hundred".

Rockstar owns a **motion capture studio in Bethpage, New York**, which is part of how a figure like 2,200 days is possible at all.

#### A number to refuse

**Development cost is unverified.** No credible sourced figure exists, and Take-Two has never published one. The widely circulated numbers are analyst estimates. Do not state a dollar figure for this game.

#### The crunch episode, attributed properly

In the same Vulture interview, Houser said the team had been "**working 100-hour weeks**" several times in 2018. Rockstar clarified the next day that this referred **only to the narrative and dialogue work** — specifically the **senior writing team of four: Michael Unsworth, Rupert Humphries, Lazlow Jones and Houser** — over **three weeks** at the end of a seven-year project, and that the company does not expect or force anyone to work that way.

**Jason Schreier's Kotaku investigation, published 23 October 2018 and based on 34 current and former employees**, reported something broader: that the crunch "has lasted for months or even years". It also identified a specific cause — a late decision to add **black bars to every non-interactive cutscene**, which required **reframing** existing cinematics and added **weeks** to many schedules with no possibility of another delay. The Housers' pattern of rebooting and discarding large chunks of work was described as contributing to a crunch culture "impossible to deny".

**These accounts are usually framed as a dispute and should not be.** They address **different populations** — four senior writers over three weeks, versus the wider team over months or years — and they do not contradict each other. The company's clarification is about a specific group; the investigation is about the studio as a whole. Presenting them as "both sides" misreads both.

The pattern has precedent at Rockstar: in early 2010, spouses of Rockstar San Diego employees published an open letter describing **12-hour average workdays, mandatory Saturdays and reduced benefits**.`,
    level: 'intermediate',
    relatedConcepts: [
      'red-dead-redemption-2', 'crunch', 'dan-houser', 'rockstar-games',
      'rockstar-studios', 'lazlow-jones', 'red-dead-online', 'take-two',
    ],
    category: 'impact',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The absence of an official development-cost figure, which Take-Two could still publish, and the crunch reporting, which is a snapshot of 2018 accounts rather than a standing verdict.',
    sources: [
      'https://en.wikipedia.org/wiki/Red_Dead_Redemption_2',
      'https://en.wikipedia.org/wiki/Crunch_(video_games)',
    ],
  },

  {
    id: 'rstar-2022-ee-upgrade',
    keywords: [
      'expanded and enhanced', 'e&e', 'gta v ps5', 'gta 5 next gen', 'next gen upgrade',
      'raytracing', 'ray traced reflections', 'dlss', 'fsr', 'rtgi', '4k 60',
      'input lag', 'load times', 'performance mode', 'fidelity mode', 'gta v pc enhanced',
    ],
    phrases: [
      'expanded and enhanced',
      'gta v expanded and enhanced',
      'gta v on ps5',
      'the gta v next gen upgrade',
    ],
    title: 'The 2022 Expanded & Enhanced upgrade and RAGE across console generations',
    summary:
      'The 2022 Expanded & Enhanced release brought GTA V to PS5 and Xbox Series X/S with 60fps performance modes, raytraced reflections and much faster loading, followed by a 2025 PC upgrade adding raytraced global illumination.',
    detail: `### The 2022 Expanded & Enhanced upgrade and RAGE across console generations

*GTA V* has shipped across three console generations on the same engine lineage, and the 2022 release is the clearest picture of what RAGE gains — and does not gain — when it moves to new hardware.

#### The 2022 release

Digital Foundry's analysis (18 March 2022) covers the PlayStation 5 and Xbox Series X/S build, which offers **three modes**:

- **Fidelity** — 4K at 30fps.
- **Performance** — 1440p at 60fps.
- **Performance RT** — 1440p at 60fps with raytracing.

Install friction dropped sharply. The PS4's post-download installation took "over an hour"; the PS5 goes straight into the intro videos and 60fps menus — though, notably, **menus still run at 30fps on last-gen and even on PC**. **Menu to story mode takes about 20 seconds on PS5 against 2 minutes 8 seconds on PS4.**

The upgrade mitigates *GTA V*'s "very high" input lag, adds **TAA**, and upgrades motion blur from camera-based — with sparing per-object blur in first person only — to **per-object motion blur applied universally**. Other features: **raytraced reflections and shadows**, **native 4K on PS5 and Xbox Series X**, **upscaled 4K on Xbox Series S**, and **HDR**.

DF's verdict is measured. It called this "the preferred version of the game... better in many respects than the PC game too", but added that "Rockstar could have pushed harder... don't go in expecting an upgrade on par with something like Metro Exodus Enhanced Edition. In terms of 'next-gen' upgrades, what we're effectively getting here is the obligatory 60fps upgrade, a touch of RT and a smattering of pleasing refinements."

#### The 2025 PC "Enhanced" upgrade

The PC version then went further than the consoles. The 2025 Enhanced upgrade added **real-time raytraced global illumination and raytraced ambient occlusion** — and DF notes that **RTGI is not available in the current-gen console versions**. DF called it "a game-changer here, with light bounce around the environments of a far, far superior quality", and framed these additions as **hinting at GTA 6 features**. The upgrade also added **DLSS and FSR**, and later **DLSS 4**.

#### RAGE across the generations, in order

- **Seventh generation (2008-2013):** RAGE on PS3 and Xbox 360, reaching **720p** on both with *GTA V*, after the earlier 640p-versus-720p disparities of *GTA IV* and *Red Dead Redemption*.
- **Eighth generation (2014-2015):** reworked for PS4 and Xbox One at **1080p**, with the PC release adding **4K/60**, greater draw distance, improved shadow mapping and tessellation.
- **Ninth generation (2022 onward):** **60fps performance modes and raytracing** on PS5 and Xbox Series X/S, then **raytraced global illumination on PC** in 2025.

#### What is not documented

**GTA Online's network architecture is essentially undocumented in accessible authoritative sources.** The widely repeated claim that it uses a peer-to-peer session model rather than dedicated servers is **unverified here** and should not be asserted as fact.`,
    level: 'expert',
    relatedConcepts: [
      'gta-v', 'gta-online', 'rage-engine', 'open-world-design',
      'gta-vi', 'rockstar-north', 'gta-v-sales',
    ],
    category: 'tech',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'EVERYTHING here that describes a current build: the console modes, the 2025 PC feature set, and the RTGI gap between PC and consoles. Patch-level additions and the GTA VI release date both move this entry.',
    sources: [
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_V',
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_Online',
    ],
  },
];
