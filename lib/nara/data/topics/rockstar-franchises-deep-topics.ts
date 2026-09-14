import type { DetailedTopic } from './types';

/**
 * Other Rockstar franchises — everything that is not GTA or the company.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The stub catalogue covers each non-GTA series in one paragraph. Expert
 * discussion needs the splits: Revolver vs Redemption vs RDR2, the three
 * Max Paynes individually, Undead Nightmare, the two Onlines, L.A. Noire,
 * The Warriors and the game that never shipped (Agent). Each entry is kept
 * retrievable on its own name so "Who is John Marston?" and "What is
 * Undead Nightmare?" do not collapse into the parent series.
 */
export const FRANCHISES_DEEP_TOPICS: DetailedTopic[] = [
  {
    id: 'red-dead-revolver',
    keywords: ['red dead revolver', 'revolver', 'red harlow', 'capcom western'],
    phrases: ['red dead revolver', 'the first red dead'],
    title: 'Red Dead Revolver',
    summary:
      'Red Dead Revolver (2004) began at Capcom, was finished by Angel Studios and published by Rockstar — a linear arcade Western before the open-world turn.',
    detail: `### Red Dead Revolver (2004)

*Revolver* started as a Capcom project, was taken over by **Angel Studios** (soon Rockstar San Diego) and published by Rockstar in 2004. The player is bounty hunter **Red Harlow**, working through linear, score-attack gunfights rather than an open world.

It matters as a hinge: the Western setting, duels and Dead-Eye ancestry all survive, but the structure is arcade, not systemic. *Redemption* (2010) keeps the name and almost nothing else about how the game plays.`,
    level: 'expert',
    relatedConcepts: ['red-dead-series', 'rockstar-san-diego', 'red-dead-redemption'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Red_Dead_Revolver'],
  },
  {
    id: 'red-dead-redemption',
    keywords: ['red dead redemption', 'john marston', 'rdr1', '2010 western', 'dutch van der linde'],
    phrases: ['red dead redemption', 'the john marston one', 'rdr 1'],
    title: 'Red Dead Redemption',
    summary:
      'Red Dead Redemption (2010) is the open-world Western following John Marston, hunted by the government to kill his old gang, with the Undead Nightmare expansion.',
    detail: `### Red Dead Redemption (2010)

Developed by **Rockstar San Diego** with the wider Rockstar group, *Red Dead Redemption* (May 2010, PS3/Xbox 360) follows **John Marston**, forced by federal agents to hunt the Van der Linde gang he once rode with. The map spans the border country of New Austin, Nuevo Paraíso and West Elizabeth in 1911 — the West already dying.

Mechanically it ports the GTA formula west: open range instead of city blocks, horses instead of cars, honour instead of wanted levels, and **Dead-Eye** targeting as the signature system. It won Game of the Year awards across the press and established San Diego as a second flagship studio alongside North.

**Undead Nightmare** (October 2010) is its standalone zombie-horror expansion — see its own entry. A PS4/Switch port arrived in 2023.`,
    level: 'beginner',
    relatedConcepts: ['red-dead-series', 'red-dead-redemption-2', 'undead-nightmare', 'rockstar-san-diego'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Red_Dead_Redemption'],
  },
  {
    id: 'undead-nightmare',
    keywords: ['undead nightmare', 'zombie western', 'red dead zombies'],
    phrases: ['undead nightmare', 'the zombie expansion'],
    title: 'Red Dead Redemption: Undead Nightmare',
    summary:
      'Undead Nightmare (2010) is the zombie-horror expansion to Red Dead Redemption, with John Marston crossing a plague-hit frontier.',
    detail: `### Undead Nightmare (2010)

Released October 2010 as DLC and later standalone, *Undead Nightmare* reuses the *Redemption* map under a zombie plague. **John Marston** searches for a cure while the frontier\u2019s towns fall one by one.

It is tonally separate — horror-comedy rather than elegy — and mechanically it remixes rather than extends: new mounts (including the Four Horses of the Apocalypse), new weapons, and ambient survivor missions. For Rockstar it proved expansions could change genre, not just add missions — a lesson GTA Online\u2019s later updates would reuse.`,
    level: 'expert',
    relatedConcepts: ['red-dead-redemption', 'red-dead-series', 'rockstar-san-diego'],
    category: 'games',
  },
  {
    id: 'red-dead-online',
    keywords: ['red dead online', 'rdro', 'red dead multiplayer', 'moonshiners', 'trader role'],
    phrases: ['red dead online', 'rdr online', 'red dead multiplayer'],
    title: 'Red Dead Online',
    summary:
      'Red Dead Online is the multiplayer component of RDR2, launched in beta in 2018 — roles and moonshining, then effectively wound down after 2021.',
    detail: `### Red Dead Online

Launched as a beta in November 2018 alongside *RDR2* and fully in May 2019, *Red Dead Online* follows the GTA Online template — posses, free roam, competitive modes — with frontier **Roles** (Trader, Bounty Hunter, Collector, Moonshiner, Naturalist) instead of criminal businesses.

As of 14 September 2026 the contrast with GTA Online is the point. Rockstar confirmed in 2022 it was winding down major Red Dead Online updates to focus on GTA VI; there have been no substantial content additions since. Take-Two still reports the Red Dead franchise near 116 million units (August 2026), overwhelmingly RDR2 single-player sales — the online mode never reproduced GTA Online\u2019s monetisation.`,
    level: 'intermediate',
    relatedConcepts: ['red-dead-redemption-2', 'red-dead-series', 'gta-online'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Live-service status: Rockstar could resume updates, but none of substance since 2022; re-check before claiming it is abandoned vs maintained.',
    sources: [
      'https://www.rdr2.org/news/red-dead-redemption-2-has-now-sold-87-million-copies',
      'https://www.gamedeveloper.com/business/gta-v-surpasses-230-million-sales-months-before-gta-vi-touches-down',
    ],
  },
  {
    id: 'max-payne-1',
    keywords: ['max payne 1', 'max payne 2001', 'remedy max payne', 'mona sax'],
    phrases: ['max payne 1', 'the first max payne'],
    title: 'Max Payne (2001)',
    summary:
      'Max Payne (2001) is Remedy\u2019s noir shooter that introduced bullet time, graphic-novel panels and the NYPD detective hunting his family\u2019s killers.',
    detail: `### Max Payne (2001)

Developed by **Remedy Entertainment** and published by Rockstar (PC July 2001, consoles later), the original follows NYPD detective **Max Payne** through three days of snow, Valkyr drug cases and the murder of his wife and child.

Two inventions define it: **bullet time** — diving in slow motion while aiming in real time, borrowed from Hong Kong cinema and *The Matrix* — and **graphic-novel panels** with voiceover instead of cutscenes, which let a small Finnish studio tell a hardboiled story cheaply. James McCaffrey voices Max; Sam Lake, Remedy\u2019s writer, is his face.`,
    level: 'intermediate',
    relatedConcepts: ['max-payne-series', 'max-payne-2', 'max-payne-remake'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Max_Payne_(video_game)'],
  },
  {
    id: 'max-payne-2',
    keywords: ['max payne 2', 'fall of max payne', 'max payne sequel'],
    phrases: ['max payne 2', 'the fall of max payne'],
    title: 'Max Payne 2: The Fall of Max Payne',
    summary:
      'Max Payne 2 (2003) is Remedy\u2019s sequel — a love story with Mona Sax, ragdoll physics and a darker, shorter noir.',
    detail: `### Max Payne 2: The Fall of Max Payne (2003)

Remedy and Rockstar returned in October 2003 with a direct sequel built on the first game\u2019s engine plus Havok-style **ragdoll physics**. Max, now a detective again, is pulled between his duty and torch-carrying assassin **Mona Sax** — the game\u2019s own description is "a love story" inside a noir.

It reviewed better than it sold, which is why the series then went quiet for nine years. Its cult reputation rests on pacing and tone: shorter, sadder and more self-aware than the original, with the TV show *Address Unknown* and the funhouse level as the set pieces people still quote.`,
    level: 'expert',
    relatedConcepts: ['max-payne-series', 'max-payne-1', 'max-payne-3', 'max-payne-remake'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Max_Payne_2:_The_Fall_of_Max_Payne'],
  },
  {
    id: 'max-payne-3',
    keywords: ['max payne 3', 'sao paulo max payne', 'rockstar vancouver max payne'],
    phrases: ['max payne 3', 'the third max payne'],
    title: 'Max Payne 3',
    summary:
      'Max Payne 3 (2012) moved development to Rockstar Studios — a heavier, cover-based shooter following a washed-up Max in São Paulo.',
    detail: `### Max Payne 3 (2012)

Released May 2012 after years of delays, *Max Payne 3* was developed across Rockstar Studios — led by **Rockstar Vancouver** — on **RAGE with Euphoria**, the first Rockstar-internal Max Payne. Max, alcoholic and pill-dependent, works private security in **São Paulo** and falls into an organ-harvesting conspiracy.

The design shifts from Remedy\u2019s darting gunfu to weightier **cover shooting** withier bullet time as a resource; the graphic-novel panels become motion-comic cutscenes that never leave Max\u2019s perspective. It underperformed commercially against GTA-scale expectations, which is part of why the announced Remedy remake (in full production as of August 2026) returns to the first two games rather than continuing here.`,
    level: 'intermediate',
    relatedConcepts: ['max-payne-series', 'max-payne-2', 'rockstar-vancouver', 'rage-engine', 'euphoria', 'max-payne-remake'],
    category: 'games',
  },
  {
    id: 'max-payne-remake',
    keywords: ['max payne remake', 'max payne 1 2 remake', 'remedy remake', 'northlight'],
    phrases: ['max payne remake', 'max payne 1 and 2 remake'],
    title: 'Max Payne remake',
    summary:
      'The announced Remedy remake rebuilds Max Payne 1 and 2 as one Northlight title for PC, PS5 and Xbox Series — in full production, published by Rockstar, no date.',
    detail: `### Max Payne remake

Announced April 2022 under a Rockstar–Remedy development agreement: both originals rebuilt as a **single title** on Remedy\u2019s **Northlight** engine (Control, Alan Wake 2) for **PC, PS5 and Xbox Series X/S**. Rockstar finances and publishes; Remedy develops and earns royalties after recoupment. Rockstar still owns the IP, sold by Remedy to Take-Two in 2002.

As of 14 September 2026: in **full production** (Remedy half-year report, 11 August 2026 — in that stage since roughly August 2024), with Rockstar handling all publishing so Remedy says it cannot comment further. No release date. Expect nothing before GTA VI (19 November 2026) clears Rockstar\u2019s marketing calendar; community estimates point to 2027–2028, which is speculation, not guidance.`,
    level: 'intermediate',
    relatedConcepts: ['max-payne-series', 'max-payne-1', 'max-payne-2', 'rockstar-games'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Unreleased remake: production stage, date and platforms move with Rockstar announcements.',
    sources: [
      'https://remedygames.com/games/max-payne-1-2-remake',
      'https://www.gamesradar.com/games/max-payne/max-payne-1-and-2-remake-is-still-happening-but-publisher-rockstar-wont-let-remedy-say-any-more',
    ],
  },
  {
    id: 'la-noire',
    keywords: ['la noire', 'l.a. noire', 'team bondi', 'cole phelps', 'motionscan', '1947 los angeles'],
    phrases: ['l a noire', 'la noire game', 'the detective game', 'noir detective', '1947 detective'],
    title: 'L.A. Noire',
    summary:
      'L.A. Noire (2011) is the 1947 LAPD detective game by Team Bondi and Rockstar — MotionScan faces, five desks of cases, then studio collapse.',
    detail: `### L.A. Noire (2011)

Released May 2011 (PS3/Xbox 360; PC November), developed by Sydney\u2019s **Team Bondi** under Brendan McNamara with Rockstar producing — originally a Sony project, picked up by Rockstar in 2006 after seven years in development. The player is LAPD officer **Cole Phelps**, working Patrol, Traffic, Homicide, Vice and Arson desks across a recreated **1947 Los Angeles**, interrogating suspects by reading faces.

The technology is **MotionScan**: 32 cameras capturing actors\u2019 faces for interrogation tells. It was the first game selected for the Tribeca Film Festival. Despite strong sales and reviews, crunch and crediting controversies (100+ developers initially uncredited, 10–12 hour days alleged) ended the partnership — Rockstar would not publish Team Bondi again, the studio entered administration 31 August 2011 and liquidation that October. The IP stayed with Rockstar; a VR Case Files version and a 2017 remaster followed. Founder McNamara\u2019s Video Games Deluxe became **Rockstar Australia** in March 2025.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'rockstar-leeds', 'team-bondi'],
    category: 'games',
    sources: [
      'https://en.wikipedia.org/wiki/Team_Bondi',
      'https://www.latimes.com/entertainment/la-ca-noir-city-20110424-story.html',
    ],
  },
  {
    id: 'the-warriors',
    keywords: ['the warriors', 'warriors game', 'rockstar toronto warriors', '1979 film game'],
    phrases: ['the warriors game', 'warriors rockstar'],
    title: 'The Warriors',
    summary:
      'The Warriors (2005) is Rockstar Toronto\u2019s adaptation of the 1979 film — gang flight across New York plus a Rumble mode.',
    detail: `### The Warriors (2005)

Released October 2005 (PS2/Xbox; PSP 2007) by **Rockstar Toronto**, adapting Walter Hill\u2019s 1979 film about a Coney Island gang chased across New York after being framed for a leader\u2019s murder. Rockstar expands the film\u2019s single night into a full campaign — flashbacks, gang formation, territory fights — then follows it faithfully.

It is the studio\u2019s signature before it absorbed Vancouver: a brawler with GTA\u2019s mission structure and co-op Rumble mode, widely treated as one of the best film adaptations in games. The same team would later lead *Manhunt 2* support and the Toronto studio\u2019s co-development work.`,
    level: 'expert',
    relatedConcepts: ['rockstar-toronto', 'rockstar-games', 'manhunt'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/The_Warriors_(video_game)'],
  },
  {
    id: 'agent',
    keywords: ['agent', 'rockstar agent', 'spy game rockstar', 'cancelled rockstar game'],
    phrases: ['agent game', 'rockstar agent', 'the spy game', 'spy game'],
    title: 'Agent (cancelled)',
    summary:
      'Agent was Rockstar North\u2019s announced PS3-exclusive Cold War spy game (2009), never released and quietly cancelled.',
    detail: `### Agent

Announced at Sony\u2019s E3 2009 press conference as a **PS3-exclusive** Rockstar North title: a Cold War spy thriller in the 1970s, in the vein of *The Professionals* and Bond. Earlier, a San Diego incarnation had been a "prove your worth" test project after the Angel acquisition, set aside for *Red Dead Revolver*.

It never reappeared. Trademark renewals kept hope alive for years; by the mid-2010s Rockstar had stopped listing it, and reporting treats it as cancelled within a few years of announcement while San Diego and North were pulled onto *Red Dead Redemption* and *GTA V*. It remains Rockstar\u2019s most famous vapourware — the answer to "what did Rockstar cancel?"`,
    level: 'expert',
    relatedConcepts: ['rockstar-north', 'rockstar-san-diego', 'rockstar-games'],
    category: 'games',
    sources: ['https://www.polygon.com/features/2019/2/21/18118822/agent-rockstar-san-diego'],
  },
  {
    id: 'midnight-club-los-angeles',
    keywords: ['midnight club los angeles', 'midnight club la', '2008 racing rockstar'],
    phrases: ['midnight club los angeles', 'the last midnight club'],
    title: 'Midnight Club: Los Angeles',
    summary:
      'Midnight Club: Los Angeles (2008) is the last Midnight Club — San Diego\u2019s open-world street racer on RAGE, with a 60fps claim and a Complete Edition.',
    detail: `### Midnight Club: Los Angeles (2008)

Released October 2008 (PS3/Xbox 360) by **Rockstar San Diego** on **RAGE** — the only racer on the engine and the series\u2019 fourth and final entry. One city (a condensed Los Angeles), no loading between races, day-night cycle and weather, licensed cars and bikes with deep customisation.

It is technically notable as RAGE\u2019s first open-world racer after *Table Tennis*: Digital Foundry\u2019s retrospective notes the 360 at 1280x720 against PS3 at 960x720, a gap *GTA V* would later close. A **Complete Edition** (2009) added the South Central DLC. No new Midnight Club has followed — San Diego moved to *Red Dead Redemption* and RAGE\u2019s open-world crime work.`,
    level: 'expert',
    relatedConcepts: ['midnight-club-series', 'rockstar-san-diego', 'rage-engine'],
    category: 'games',
  },
  {
    id: 'manhunt-2',
    keywords: ['manhunt 2', 'manhunt sequel', 'daniel lamb', 'leo kasper'],
    phrases: ['manhunt 2'],
    title: 'Manhunt 2',
    summary:
      'Manhunt 2 (2007) is the asylum-escape sequel led by Rockstar London — initially rated AO, edited down to M, and refused classification in the UK.',
    detail: `### Manhunt 2 (2007)

*Manhunt 2* follows escaped subjects **Daniel Lamb** (an amnesiac scientist) and **Leo Kasper** (a psychotic killer) on a killing spree from the Dixmor Asylum. Development began at Rockstar Vienna; after Vienna closed in 2006, **Rockstar London** — formed in 2005 — took the lead with support across the group, for PS2, Wii (with motion-controlled executions) and PSP.

Its ratings history is the case study. The ESRB gave the original submission an **AO** in June 2007; Take-Two suspended the July release, Rockstar applied blurring and filter effects over the executions, and the edited version received an **M** that August for a Halloween release. The BBFC still refused the UK version outright, starting the appeal saga covered in its own entry. In November 2007 hackers un-blurred the PSP version on modified hardware; the ESRB investigated and kept the **M**, ruling the hack did not restore the AO build. Senator Leland Yee demanded the AO be reinstated and the FTC investigate — neither happened.`,
    level: 'expert',
    relatedConcepts: ['manhunt', 'rockstar-london', 'esrb', 'bbfc', 'rockstar-controversies'],
    category: 'games',
    sources: [
      'https://www.cbsnews.com/news/manhunt-2-pulled-from-production/',
      'https://arstechnica.com/gaming/2007/08/manhunt-2-will-see-halloween-release-date-after-getting-m-rating/',
    ],
  },
  {
    id: 'smugglers-run',
    keywords: ['smugglers run', "smuggler's run", 'angel studios smugglers', 'ps2 launch'],
    phrases: ["smuggler's run", 'smugglers run'],
    title: "Smuggler's Run",
    summary:
      'Smuggler\u2019s Run (2000) is Angel Studios\u2019 off-road smuggling game — a PS2 launch title whose success started the Rockstar partnership.',
    detail: `### Smuggler's Run (2000)

Developed by **Angel Studios** and published by Rockstar for the PlayStation 2 launch window, *Smuggler\u2019s Run* has the player driving contraband across open off-road terrain while dodging border patrol, rivals and the military — mission-based smuggling rather than racing lines.

It matters as the beginning of a relationship: Angel\u2019s PS2 launch work (*Smuggler\u2019s Run*, then *Midnight Club*) impressed Rockstar enough to make the studio a long-term partner, and Take-Two acquired Angel outright in November 2002, renaming it **Rockstar San Diego**. The sequel *Smuggler\u2019s Run 2: Hostile Territory* (2001) and the *Warzones* expansion followed on the same formula.`,
    level: 'expert',
    relatedConcepts: ['rockstar-san-diego', 'midnight-club-series', 'rockstar-games'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Smuggler%27s_Run'],
  },
  {
    id: 'oni',
    keywords: ['oni', 'bungie oni', 'konoko', 'oni ps2'],
    phrases: ['oni', 'the oni game'],
    title: 'Oni',
    summary:
      'Oni (2001) is Bungie West\u2019s anime-styled action game about agent Konoko — Rockstar published the PS2 version.',
    detail: `### Oni (2001)

Developed by **Bungie West** and released for Mac and Windows in January 2001, with the PlayStation 2 version published by **Rockstar** later that year. The player is **Konoko**, a Technology Crimes Task Force agent uncovering a conspiracy in a *Ghost in the Shell*-inflected future — third-person shooting fused with hand-to-hand combos, with one of the earliest mainstream blends of gunplay and melee systems.

Its backstory is pure turn-of-the-millennium industry: Microsoft bought Bungie in 2000, but the PS2 *Oni* commitment survived long enough for Rockstar\u2019s version to ship, making it a Bungie game on a Sony console published by the GTA label.`,
    level: 'expert',
    relatedConcepts: ['rockstar-games'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Oni_(video_game)'],
  },
  {
    id: 'state-of-emergency',
    keywords: ['state of emergency', 'vis entertainment', 'riot game'],
    phrases: ['state of emergency'],
    title: 'State of Emergency',
    summary:
      'State of Emergency (2002) is VIS Entertainment\u2019s riot-themed action game — chaos-for-score in Capitol City, published by Rockstar.',
    detail: `### State of Emergency (2002)

Developed by Edinburgh\u2019s **VIS Entertainment** and published by Rockstar for PS2 in 2002 (Xbox and PC followed), *State of Emergency* drops the player into riots across Capitol City as a member of the Freedom movement — smashing, looting and surviving against the Corporation\u2019s forces, with the score-attack **Kaos** mode as the purest expression of the idea.

It is Rockstar-as-publisher in the early 2000s: an external studio\u2019s transgressive concept, shipped under the label that could sell it. The 2006 sequel *State of Emergency 2* came without Rockstar and sank without trace.`,
    level: 'expert',
    relatedConcepts: ['rockstar-games'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/State_of_Emergency_(video_game)'],
  },
  {
    id: 'beaterator',
    keywords: ['beaterator', 'timbaland', 'music creation psp'],
    phrases: ['beaterator'],
    title: 'Beaterator',
    summary:
      'Beaterator (2009) is the Timbaland music-creation tool for PSP and iOS, built with Rockstar Leeds.',
    detail: `### Beaterator (2009)

A music-creation tool rather than a game: loop-based beat-making with **Timbaland**-produced sounds, developed with **Rockstar Leeds** — PSP in September 2009, iOS that December. It grew out of a web music mixer into a full release where players sequence loops, add live instrumentation and export mixes.

It belongs in the catalogue as Rockstar\u2019s furthest reach outside action games: no story, no city, just an instrument with the label\u2019s presentation standards. Timbaland\u2019s involvement also foreshadows Rockstar\u2019s later deep music collaborations, from GTA V\u2019s original score to GTA Online\u2019s artist updates.`,
    level: 'expert',
    relatedConcepts: ['rockstar-leeds', 'rockstar-games'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Beaterator'],
  },
];
