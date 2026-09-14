import type { DetailedTopic } from './types';

/**
 * GTA deep catalogue — the entries the stub series overview points at.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `rockstar-games-topics.ts` covers the famous five (III through V plus
 * Online) and the series overview. A knowledge base that claims to sustain
 * expert discussion has to answer the follow-ups: the top-down originals,
 * the London expansions, what "2D / 3D / HD universe" actually means,
 * the handhelds, the troubled 2021 remaster, the 2022 leak, and where
 * GTA VI is set and who it follows.
 *
 * All dates and sales below were checked September 2026. Purely historical
 * entries carry sources but no `verifiedAt`; anything that can still move
 * (VI setting/cast, trilogy patches) is dated.
 */
export const GTA_DEEP_TOPICS: DetailedTopic[] = [
  {
    id: 'gta-1',
    keywords: ['gta 1', 'grand theft auto 1', 'original gta', '1997 gta', 'race n chase'],
    phrases: ['gta 1', 'the original gta', 'grand theft auto 1997'],
    title: 'Grand Theft Auto (1997)',
    summary:
      'The 1997 top-down original by DMA Design, published by BMG Interactive — three cities, a points-driven crime loop, and the Race\u2019n\u2019Chase prototype behind it.',
    detail: `### Grand Theft Auto (1997)

The original *Grand Theft Auto* launched 28 November 1997 on MS-DOS and Windows in Europe (PlayStation followed in December), developed by **DMA Design** and published by **BMG Interactive** — before the Rockstar label existed.

It is a top-down 2D game across three cities — **Liberty City, San Andreas and Vice City** — names the series would reuse for decades. The loop is points-driven: steal cars, take criminal jobs, build a multiplier, and unlock later districts.

Its origin is the prototype **Race\u2019n\u2019Chase**, where testers found playing the criminals more fun than playing the cops. That inversion — the police as the obstacle rather than the role — is the whole series in embryo.`,
    level: 'intermediate',
    relatedConcepts: ['gta-series', 'gta-era-2d', 'dma-design', 'bmc-interactive'],
    category: 'games',
    sources: [
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_(video_game)',
      'https://www.thenationalnews.com/arts-culture/2026/08/22/from-1997s-grand-theft-auto-to-gta-6-the-evolution-of-gamings-biggest-crime-series',
    ],
  },
  {
    id: 'gta-2',
    keywords: ['gta 2', 'gta ii', 'grand theft auto 2', 'anywhere city', 'claude speed'],
    phrases: ['gta 2', 'grand theft auto 2', 'anywhere city'],
    title: 'Grand Theft Auto 2',
    summary:
      'GTA 2 (1999) kept the top-down view but moved to a retro-futuristic Anywhere City of rival gangs, following Claude Speed.',
    detail: `### Grand Theft Auto 2 (1999)

*GTA 2* arrived 22 October 1999 on PC and PlayStation (later Dreamcast and Game Boy Color), still top-down. The setting is **Anywhere City**, a retro-futuristic metropolis with no real-world analogue, divided between rival gangs the player plays off against each other.

The protagonist is **Claude Speed** — not to be confused with GTA III\u2019s Claude. The gang-respect system, where working for one syndicate angers its rivals, is the game\u2019s main structural addition, and the last word in the 2D formula before GTA III rebooted everything.`,
    level: 'intermediate',
    relatedConcepts: ['gta-series', 'gta-era-2d', 'gta-1', 'dma-design'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Grand_Theft_Auto_2'],
  },
  {
    id: 'gta-london',
    keywords: ['london 1969', 'london 1961', 'gta london', 'rockstar canada'],
    phrases: ['gta london', 'london 1969', 'london 1961'],
    title: 'GTA: London 1969 and London 1961',
    summary:
      'London 1969 (1999) and London 1961 are the two top-down expansions to the original GTA, set in 1960s London and built by Rockstar Canada.',
    detail: `### GTA: London 1969 and London 1961

The only expansions to the original game, and the only GTAs set outside the United States:

- **Grand Theft Auto: London 1969** (April 1999) — a full expansion on PS1 and PC, set in 1960s London.
- **Grand Theft Auto: London 1961** (July 1999) — a smaller, PC-only follow-up set eight years earlier.

They were built by **Rockstar Canada** (later Rockstar Toronto) on the 2D engine. Their importance is mostly taxonomic: they close out the 2D universe, and they remain the series\u2019 only excursion into a real city and a period setting before Vice City made period settings fashionable.`,
    level: 'expert',
    relatedConcepts: ['gta-1', 'gta-2', 'gta-era-2d', 'rockstar-toronto'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Grand_Theft_Auto:_London_1969'],
  },
  {
    id: 'gta-era-2d',
    keywords: ['2d era', '2d universe', 'top down gta', 'top-down era'],
    phrases: ['the 2d era', '2d universe', 'top down gta era'],
    title: 'GTA 2D era',
    summary:
      'The 2D era is GTA, its London expansions and GTA 2 (1997–1999): top-down, points-driven crime games before the 3D reboot.',
    detail: `### GTA 2D era

The **2D era** (also called the 2D universe) is Rockstar\u2019s own grouping for everything before GTA III: the original *Grand Theft Auto* (1997), the *London 1969* and *London 1961* expansions (1999), and *GTA 2* (1999).

Three things define it: a **top-down camera**, a **points and multiplier** structure rather than a character story, and **separate continuities per game** — Anywhere City never reappears, and the 2D Liberty City is not the 3D one. Each universe is self-contained, so characters and events do not carry across eras.`,
    level: 'intermediate',
    relatedConcepts: ['gta-series', 'gta-1', 'gta-2', 'gta-london', 'gta-era-3d'],
    category: 'games',
  },
  {
    id: 'gta-era-3d',
    keywords: ['3d era', '3d universe', 'gta trilogy', 'ps2 gta era'],
    phrases: ['the 3d era', '3d universe', 'the ps2 gta games'],
    title: 'GTA 3D era',
    summary:
      'The 3D era is GTA III (2001), Vice City (2002) and San Andreas (2004) plus the Stories prequels and Advance — the RenderWare games that defined the open-world formula.',
    detail: `### GTA 3D era

The **3D era** (3D universe) runs from *GTA III* (October 2001) through *Vice City* (October 2002) to *San Andreas* (October 2004), all on PlayStation 2 first and all on **RenderWare**. It also contains the handheld prequels — *Advance* (2004, GBA), *Liberty City Stories* (2005, PSP) and *Vice City Stories* (2006, PSP) — which reuse its cities at earlier dates.

The through-line is the formula GTA III established: a fully 3D city, third-person on foot and in vehicles, missions reachable from anywhere, radio, wanted levels and emergent chaos. Vice City gave it period identity; San Andreas gave it state-scale scope with three cities plus countryside. San Andreas remains the best-selling PlayStation 2 game.`,
    level: 'intermediate',
    relatedConcepts: ['gta-series', 'gta-iii', 'gta-vice-city', 'gta-san-andreas', 'renderware', 'gta-era-hd'],
    category: 'games',
    sources: ['https://gta.wiki/w/Grand_Theft_Auto'],
  },
  {
    id: 'gta-era-hd',
    keywords: ['hd era', 'hd universe', 'gta iv v era'],
    phrases: ['the hd era', 'hd universe', 'the hd gta games'],
    title: 'GTA HD era',
    summary:
      'The HD era is GTA IV (2008), its Episodes, Chinatown Wars (2009) and GTA V with Online (2013) — a new continuity on RAGE.',
    detail: `### GTA HD era

The **HD era** (HD universe) is the second reboot: *GTA IV* (April 2008), *The Lost and Damned* and *The Ballad of Gay Tony* (2009), *Chinatown Wars* (2009) and *GTA V* with *GTA Online* (2013). Every one runs on **RAGE**, and none shares continuity with the 3D games — the HD Liberty City and Los Santos are new versions of old names.

The tonal move is from empire-building to character study and back: IV is deliberately narrow and grounded, V is maximalist with three protagonists, and Online turns the map into a persistent platform. GTA V at over 230 million copies is the era\u2019s commercial argument.`,
    level: 'intermediate',
    relatedConcepts: ['gta-series', 'gta-iv', 'gta-v', 'gta-online', 'rage-engine', 'gta-era-3d'],
    category: 'games',
  },
  {
    id: 'chinatown-wars',
    keywords: ['chinatown wars', 'gta chinatown', 'huang lee', 'ds gta'],
    phrases: ['chinatown wars', 'gta chinatown wars', 'the ds gta'],
    title: 'Grand Theft Auto: Chinatown Wars',
    summary:
      'Chinatown Wars (2009) is the top-down return for DS and PSP by Rockstar Leeds, following Huang Lee through Liberty City\u2019s drug trade.',
    detail: `### Grand Theft Auto: Chinatown Wars (2009)

*Chinatown Wars* launched March 2009 on Nintendo DS (PSP and mobile followed), developed by **Rockstar Leeds**. It deliberately returns to a top-down camera — with cel-shaded stylisation and touchscreen drug-dealing minigames — while keeping the HD-era Liberty City and its systems.

The player is **Huang Lee**, delivering a family sword through Triad politics after his father\u2019s murder. Critically it is among the best-reviewed handheld games ever; commercially it underperformed on DS, which is itself part of the story — a Rockstar experiment that proved design ambition and audience size do not always meet on Nintendo hardware.`,
    level: 'expert',
    relatedConcepts: ['gta-series', 'gta-era-hd', 'gta-iv', 'rockstar-leeds'],
    category: 'games',
    sources: ['https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Chinatown_Wars'],
  },
  {
    id: 'gta-trilogy-definitive',
    keywords: ['definitive edition', 'gta trilogy remaster', 'grove street games', 'trilogy definitive'],
    phrases: ['the definitive edition', 'gta trilogy definitive', 'trilogy remaster'],
    title: 'GTA: The Trilogy – The Definitive Edition',
    summary:
      'The 2021 Unreal remaster of III, Vice City and San Andreas by Grove Street Games, pulled from PC at launch over bugs and unintentionally shipped files.',
    detail: `### GTA: The Trilogy – The Definitive Edition (2021)

Released digitally 11 November 2021 (physical December) for PS4/PS5, Xbox One/Series, Switch and PC via the Rockstar Launcher, the trilogy rebuilds the three 3D-era games in **Unreal Engine** — adapted by **Grove Street Games**, who had done the earlier mobile ports. It promised rebuilt lighting, high-resolution textures, GTA V-style controls, waypoints and instant mission restarts.

The launch is the story. The PC version was pulled from sale within a day to remove **files unintentionally included**, the Launcher itself went down for maintenance, and players documented misspellings, plastic character models, broken fog and rain that obscured missions. Rockstar apologised on 19 November 2021, promised title updates, and gave owners the original PC versions free until June 2022.

As of 14 September 2026 it stands as Rockstar\u2019s standard cautionary tale about outsourcing remasters of beloved games on a short schedule.`,
    level: 'intermediate',
    relatedConcepts: ['gta-era-3d', 'gta-iii', 'gta-vice-city', 'gta-san-andreas', 'rockstar-games'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Patch state and store availability can still change; the 2021 launch facts are settled.',
    sources: [
      'https://www.theverge.com/2021/11/19/22791656/rockstar-gta-trilogy-remaster-mess-re-list-original-titles-pc',
      'https://www.ign.com/articles/grand-theft-auto-gta-trilogy-trailer-gameplay-price-release-date-the-definitive-edition',
    ],
  },
  {
    id: 'gta-vi-leak',
    keywords: ['gta 6 leak', 'gta vi leak', 'teapotuberhacker', 'lapsus', 'arion kurtaj'],
    phrases: ['the gta 6 leak', 'gta vi leak', 'teapotuberhacker'],
    title: 'The 2022 GTA VI leak',
    summary:
      'In September 2022 a hacker posted 90 early GTA VI videos from Rockstar\u2019s Slack; Lapsus$ member Arion Kurtaj was later hospitalised indefinitely and Rockstar spent $5m recovering.',
    detail: `### The 2022 GTA VI leak

In the early hours of 18 September 2022 a GTAForums user called **teapotuberhacker** posted about **90 videos, totalling 50 minutes**, of in-development GTA VI — debug overlays, Vice City locations, and the first confirmation of a female protagonist. The footage came from Rockstar\u2019s internal **Slack**, with threats to release GTA V and VI source code unless Rockstar negotiated.

Rockstar confirmed the intrusion on 19 September 2022, calling it a network intrusion with early development footage, and Take-Two issued DMCA takedowns — which itself confirmed authenticity. Bloomberg\u2019s Jason Schreier confirmed it via Rockstar sources the same day.

The attacker was **Arion Kurtaj**, then 17, of the **Lapsus$** group — already on bail for Nvidia and BT/EE hacks, working from a Travelodge on a phone, hotel TV and Amazon Fire Stick after his laptop was seized. In December 2023 he was given an **indefinite hospital order** (deemed unfit to stand trial, high risk, violent in custody). A second youth got an 18-month rehabilitation order. Rockstar told the court it spent **$5 million** recovering. Analysts called it a PR disaster that would not hurt sales — the December 2023 trailer then set YouTube records.`,
    level: 'intermediate',
    relatedConcepts: ['gta-vi', 'rockstar-games', 'leonida', 'rockstar-controversies'],
    category: 'impact',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Settled facts, but August 2026 saw fresh alleged gameplay leaks whose provenance is unclear — re-check before repeating new leak claims.',
    sources: [
      'https://www.theguardian.com/games/2022/sep/19/grand-theft-auto-6-leak-who-hacked-rockstar-and-what-was-stolen',
      'https://www.theverge.com/2023/12/21/24011153/gta-vi-hacker-lapsus-sentencing-hospital-prison',
      'https://www.bbc.com/news/technology-62960828',
    ],
  },
  {
    id: 'leonida',
    keywords: ['leonida', 'state of leonida', 'vice city 2026', 'leonida keys', 'grassrivers'],
    phrases: ['leonida', 'the state of leonida', 'gta vi map'],
    title: 'Leonida (GTA VI setting)',
    summary:
      'Leonida is GTA VI\u2019s Florida-like state, returning to Vice City with the Keys, Grassrivers wetlands, Port Gellhorn, Ambrosia and Mount Kalaga.',
    detail: `### Leonida

**Leonida** is the fictional state *GTA VI* is set in — Rockstar\u2019s Florida, home to a new **Vice City**. As listed by Rockstar ahead of the 19 November 2026 release:

- **Vice City** — the neon coastal centre, beaches, nightlife and high-rises.
- **Leonida Keys** — island chain of bridges, boats and smuggling routes.
- **Grassrivers** — Everglades-like wetlands.
- **Port Gellhorn** — weathered coastal motels and docks.
- **Ambrosia** — industrial interior.
- **Mount Kalaga National Park** — northern wilderness.

The 2022 leak\u2019s Vice City locations were the first confirmation the series was returning to its 2002 city; Trailer 2 (May 2025) then showed the wider state. As of 14 September 2026 no map size has been officially announced — treat "three times RDR2" style claims as community speculation.`,
    level: 'beginner',
    relatedConcepts: ['gta-vi', 'gta-vice-city', 'gta-vi-leak', 'vice-city-place'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Unreleased-game geography: Rockstar can rename, recut or expand regions before launch.',
    sources: [
      'https://vice-hq.com/people-places',
      'https://www.shacknews.com/article/144160/gta-6-trailer-2',
    ],
  },
  {
    id: 'gta-vi-characters',
    keywords: ['jason duval', 'lucia caminos', 'jason and lucia', 'gta vi protagonists', 'cal hampton', 'boobie ike'],
    phrases: ['jason and lucia', 'lucia caminos', 'jason duval', 'gta vi characters'],
    title: 'GTA VI characters: Jason and Lucia',
    summary:
      'GTA VI has dual protagonists Jason Duval and Lucia Caminos — a Bonnie-and-Clyde couple — with Rockstar also naming Cal, Boobie, Dre\u2019Quan, Real Dimez, Raul and Brian.',
    detail: `### GTA VI characters

*GTA VI* uses **dual protagonists**, both playable:

- **Lucia Caminos** — the first female lead of the modern era, introduced inside a correctional facility, sharp and unsentimental.
- **Jason Duval** — her partner in love and crime, the steadier half, doing shady work for Keys drug runners when they meet.

Rockstar frames them as **Bonnie and Clyde**: an easy score goes wrong and leaves them inside a statewide conspiracy, forced to rely on each other. Trailer 2 (May 2025) is built around that push and pull.

Named supporting cast from Trailer 2 and Rockstar\u2019s site: hacker **Cal Hampton**, Vice City operator **Boobie Ike**, music hustler **Dre\u2019Quan Priest**, rap duo **Real Dimez (Bae-Luxe and Roxy)**, bank robber **Raul Bautista** and Keys smuggler **Brian Heder** (with Lori Heder). Voice cast is unconfirmed as of 14 September 2026 — community attributions (including the often-cited Manni L. Perez for Lucia) are consensus, not announcements, and Troy Baker has denied playing Jason.`,
    level: 'beginner',
    relatedConcepts: ['gta-vi', 'leonida', 'rockstar-north'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Unreleased-game cast: Rockstar can rename roles and has not confirmed voices; re-check before repeating casting.',
    sources: [
      'https://viceleonida.com/characters',
      'https://www.shacknews.com/article/144160/gta-6-trailer-2',
    ],
  },
];
