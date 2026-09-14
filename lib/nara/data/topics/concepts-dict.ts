/**
 * Concept definitions for the Rockstar Games domain.
 *
 * These are the short, one-or-two sentence identities the engine uses when it
 * needs to say what something IS — in a comparison, a clarification option, or
 * a related-concept chip. They are deliberately shorter than the topic entries
 * in `rockstar-games-topics.ts` / `rockstar-company-topics.ts`, which carry the
 * full explanations.
 *
 * When you write your own content, `definition` is the line most likely to be
 * quoted directly, so keep it self-contained: it should make sense with no
 * surrounding context.
 */
export const CONCEPTS_DICT: Record<string, { label: string; definition: string }> = {
  // ─── Franchises ───────────────────────────────────────────────────────────
  'gta-series': {
    label: 'Grand Theft Auto',
    definition:
      'Grand Theft Auto is Rockstar\u2019s open-world crime series, running from the 1997 top-down original through the 3D era and the HD era.',
  },
  'red-dead-series': {
    label: 'Red Dead',
    definition:
      'Red Dead is Rockstar\u2019s Western series: Red Dead Revolver, Red Dead Redemption and Red Dead Redemption 2.',
  },
  'max-payne-series': {
    label: 'Max Payne',
    definition:
      'Max Payne is a noir third-person shooter series built around bullet time, originally developed by Remedy and published by Rockstar.',
  },
  'midnight-club-series': {
    label: 'Midnight Club',
    definition:
      'Midnight Club is Rockstar\u2019s illegal street-racing series, released between 2000 and 2008.',
  },

  // ─── Eras ─────────────────────────────────────────────────────────────────
  'gta-era-2d': {
    label: 'GTA 2D era',
    definition:
      'The 2D era covers the top-down Grand Theft Auto games: GTA, GTA 2 and the London expansions.',
  },
  'gta-era-3d': {
    label: 'GTA 3D era',
    definition:
      'The 3D era covers GTA III, Vice City and San Andreas — the games that established the modern open-world formula.',
  },
  'gta-era-hd': {
    label: 'GTA HD era',
    definition:
      'The HD era covers GTA IV and GTA V, built on a new engine and a separate continuity from the 3D era.',
  },

  // ─── Games ────────────────────────────────────────────────────────────────
  'gta-iii': {
    label: 'Grand Theft Auto III',
    definition:
      'Grand Theft Auto III (2001) moved the series into a fully 3D Liberty City and became the template for the modern open-world game.',
  },
  'gta-vice-city': {
    label: 'Grand Theft Auto: Vice City',
    definition:
      'Vice City (2002) is set in a neon 1980s Miami analogue and follows Tommy Vercetti building a criminal empire.',
  },
  'gta-san-andreas': {
    label: 'Grand Theft Auto: San Andreas',
    definition:
      'San Andreas (2004) spans a fictional California — Los Santos, San Fierro and Las Venturas — and follows Carl "CJ" Johnson.',
  },
  'gta-iv': {
    label: 'Grand Theft Auto IV',
    definition:
      'GTA IV (2008) opened the HD era with a rebuilt engine, following Niko Bellic in a modern Liberty City.',
  },
  'gta-v': {
    label: 'Grand Theft Auto V',
    definition:
      'GTA V (2013) is set in Los Santos with three switchable protagonists, and is Rockstar\u2019s best-selling game.',
  },
  'gta-online': {
    label: 'GTA Online',
    definition:
      'GTA Online is the persistent multiplayer world launched alongside GTA V, expanded continuously through free updates.',
  },
  'red-dead-redemption-2': {
    label: 'Red Dead Redemption 2',
    definition:
      'Red Dead Redemption 2 (2018) is an open-world Western and a prequel following Arthur Morgan and the Van der Linde gang.',
  },
  bully: {
    label: 'Bully',
    definition:
      'Bully (2006), titled Canis Canem Edit in some regions, is an open-world game set in a boarding school.',
  },
  manhunt: {
    label: 'Manhunt',
    definition:
      'Manhunt (2003) and Manhunt 2 (2007) are stealth survival-horror games, and Rockstar\u2019s most controversial releases.',
  },
  'table-tennis': {
    label: 'Rockstar Games Presents Table Tennis',
    definition:
      'Table Tennis (2006) was the first game built on the RAGE engine, used to prove the technology before a mainline title.',
  },

  // ─── Company & studios ────────────────────────────────────────────────────
  'rockstar-games': {
    label: 'Rockstar Games',
    definition:
      'Rockstar Games is a publisher and developer founded in 1998 as a subsidiary of Take-Two Interactive.',
  },
  'take-two': {
    label: 'Take-Two Interactive',
    definition:
      'Take-Two Interactive is the parent company of Rockstar Games and 2K, and owns the GTA and Red Dead franchises.',
  },
  'rockstar-north': {
    label: 'Rockstar North',
    definition:
      'Rockstar North is the Edinburgh studio, formerly DMA Design, that leads development of Grand Theft Auto.',
  },
  'dma-design': {
    label: 'DMA Design',
    definition:
      'DMA Design was the Dundee studio behind Lemmings and the original Grand Theft Auto; it became Rockstar North.',
  },
  'rockstar-san-diego': {
    label: 'Rockstar San Diego',
    definition:
      'Rockstar San Diego, formerly Angel Studios, created the RAGE engine and leads the Red Dead series.',
  },
  'rockstar-vancouver': {
    label: 'Rockstar Vancouver',
    definition:
      'Rockstar Vancouver, formerly Barking Dog Studios, developed Bully and Max Payne 3 before merging into Rockstar Toronto.',
  },
  'rockstar-studios': {
    label: 'Rockstar\u2019s studios',
    definition:
      'Rockstar operates as a group of studios — North, San Diego, Leeds, Lincoln, London, Toronto and India — which co-develop its largest titles.',
  },

  // ─── Technology & design ──────────────────────────────────────────────────
  'rage-engine': {
    label: 'RAGE engine',
    definition:
      'RAGE is Rockstar\u2019s in-house game engine, first used publicly on Table Tennis in 2006 and used for every major title since.',
  },
  euphoria: {
    label: 'Euphoria physics',
    definition:
      'Euphoria is licensed middleware that simulates how a body reacts to impact, rather than playing a pre-baked animation.',
  },
  'open-world-design': {
    label: 'Open-world design',
    definition:
      'Rockstar\u2019s open worlds stream continuously, stay dense with incidental detail, and let missions be reached from anywhere.',
  },

  // ─── Controversy & impact ─────────────────────────────────────────────────
  'rockstar-controversies': {
    label: 'Rockstar controversies',
    definition:
      'Rockstar has repeatedly drawn controversy over violence, sexual content and working conditions, from the GTA series through Hot Coffee and Manhunt 2.',
  },
  'hot-coffee': {
    label: 'Hot Coffee',
    definition:
      'Hot Coffee was a disabled minigame found in the San Andreas code in 2005, leading to an Adults Only re-rating, a recall and an FTC investigation.',
  },
  'gta-v-sales': {
    label: 'GTA V sales',
    definition:
      'GTA V is one of the best-selling entertainment products ever released, accumulating sales across three console generations.',
  },

  // ─── GTA deep catalogue ───────────────────────────────────────────────────
  'gta-1': {
    label: 'Grand Theft Auto (1997)',
    definition:
      'The 1997 top-down original by DMA Design, published by BMG Interactive across three cities.',
  },
  'gta-2': {
    label: 'Grand Theft Auto 2',
    definition:
      'GTA 2 (1999) kept the top-down view in the retro-futuristic Anywhere City of rival gangs.',
  },
  'gta-london': {
    label: 'GTA: London',
    definition:
      'London 1969 and London 1961 are the 1999 top-down expansions set in 1960s London.',
  },
  'chinatown-wars': {
    label: 'Grand Theft Auto: Chinatown Wars',
    definition:
      'Chinatown Wars (2009) is the top-down handheld return by Rockstar Leeds, following Huang Lee.',
  },
  'gta-trilogy-definitive': {
    label: 'GTA: The Trilogy – The Definitive Edition',
    definition:
      'The 2021 Unreal remaster of III, Vice City and San Andreas, pulled from PC at launch over bugs.',
  },
  'gta-vi': {
    label: 'Grand Theft Auto VI',
    definition:
      'GTA VI is Rockstar\u2019s next mainline entry, set in Leonida with Jason Duval and Lucia Caminos, scheduled 19 November 2026.',
  },
  'gta-vi-leak': {
    label: 'The 2022 GTA VI leak',
    definition:
      'In September 2022 a hacker posted 90 early GTA VI videos; Lapsus$ member Arion Kurtaj was hospitalised indefinitely.',
  },
  leonida: {
    label: 'Leonida',
    definition:
      'Leonida is GTA VI\u2019s Florida-like state, returning to Vice City with the Keys, Grassrivers and Mount Kalaga.',
  },
  'gta-vi-characters': {
    label: 'GTA VI characters',
    definition:
      'GTA VI follows dual protagonists Jason Duval and Lucia Caminos, a Bonnie-and-Clyde couple.',
  },

  // ─── Other franchises ─────────────────────────────────────────────────────
  'red-dead-revolver': {
    label: 'Red Dead Revolver',
    definition:
      'Red Dead Revolver (2004) began at Capcom and was finished by Angel Studios — a linear Western before the open-world turn.',
  },
  'red-dead-redemption': {
    label: 'Red Dead Redemption',
    definition:
      'Red Dead Redemption (2010) is the open-world Western following John Marston in 1911.',
  },
  'undead-nightmare': {
    label: 'Undead Nightmare',
    definition:
      'Undead Nightmare (2010) is the zombie-horror expansion to Red Dead Redemption.',
  },
  'red-dead-online': {
    label: 'Red Dead Online',
    definition:
      'Red Dead Online is the multiplayer component of RDR2, wound down after 2021 to focus on GTA VI.',
  },
  'max-payne-1': {
    label: 'Max Payne (2001)',
    definition:
      'Max Payne (2001) is Remedy\u2019s noir shooter that introduced bullet time and graphic-novel storytelling.',
  },
  'max-payne-2': {
    label: 'Max Payne 2',
    definition:
      'Max Payne 2 (2003) is Remedy\u2019s sequel — a Mona Sax love story with ragdoll physics.',
  },
  'max-payne-3': {
    label: 'Max Payne 3',
    definition:
      'Max Payne 3 (2012) moved to Rockstar Studios for a heavier cover shooter in São Paulo.',
  },
  'max-payne-remake': {
    label: 'Max Payne remake',
    definition:
      'The announced Remedy remake rebuilds the first two Max Payne games on Northlight, published by Rockstar.',
  },
  'la-noire': {
    label: 'L.A. Noire',
    definition:
      'L.A. Noire (2011) is the 1947 LAPD detective game by Team Bondi with MotionScan interrogations.',
  },
  'the-warriors': {
    label: 'The Warriors',
    definition:
      'The Warriors (2005) is Rockstar Toronto\u2019s adaptation of the 1979 New York gang film.',
  },
  agent: {
    label: 'Agent',
    definition:
      'Agent was Rockstar North\u2019s announced PS3 Cold War spy game, never released.',
  },
  'midnight-club-los-angeles': {
    label: 'Midnight Club: Los Angeles',
    definition:
      'Midnight Club: Los Angeles (2008) is the last Midnight Club — San Diego\u2019s RAGE street racer.',
  },

  // ─── People & studios ─────────────────────────────────────────────────────
  'sam-houser': {
    label: 'Sam Houser',
    definition:
      'Sam Houser co-founded Rockstar Games in 1998 and remains its president and creative lead.',
  },
  'dan-houser': {
    label: 'Dan Houser',
    definition:
      'Dan Houser co-founded Rockstar and wrote GTA and Red Dead until March 2020; he founded Absurd Ventures in 2023.',
  },
  'leslie-benzies': {
    label: 'Leslie Benzies',
    definition:
      'Leslie Benzies produced GTA III through V as Rockstar North president, left in 2016 and sued for $150m.',
  },
  'strauss-zelnick': {
    label: 'Strauss Zelnick',
    definition:
      'Strauss Zelnick is Take-Two\u2019s chairman since 2007 and CEO since 2011.',
  },
  'bmc-interactive': {
    label: 'BMG Interactive',
    definition:
      'BMG Interactive published the first GTAs; Take-Two bought its assets in 1998 and built Rockstar on them.',
  },
  'absurd-ventures': {
    label: 'Absurd Ventures',
    definition:
      'Absurd Ventures is Dan Houser\u2019s 2023 media company building new universes across games and TV.',
  },
  'rockstar-toronto': {
    label: 'Rockstar Toronto',
    definition:
      'Rockstar Toronto made The Warriors and absorbed Rockstar Vancouver in 2012.',
  },
  'rockstar-leeds': {
    label: 'Rockstar Leeds',
    definition:
      'Rockstar Leeds built the Stories games and Chinatown Wars — Rockstar\u2019s handheld studio.',
  },
  'rockstar-lincoln': {
    label: 'Rockstar Lincoln',
    definition:
      'Rockstar Lincoln is the QA studio whose testers carried the worst of the RDR2 crunch reporting.',
  },
  'rockstar-dundee': {
    label: 'Rockstar Dundee',
    definition:
      'Rockstar Dundee, formerly Ruffian Games and acquired in 2020, is the Dundee support studio.',
  },
  'team-bondi': {
    label: 'Team Bondi',
    definition:
      'Team Bondi was the Sydney studio behind L.A. Noire, in liquidation by October 2011.',
  },
  'lazlow-jones': {
    label: 'Lazlow Jones',
    definition:
      'Lazlow Jones wrote and hosted GTA radio from III through V and was one of the four senior RDR2 writers.',
  },

  // ─── Ratings & tech deep ──────────────────────────────────────────────────
  esrb: {
    label: 'ESRB',
    definition:
      'The ESRB is the North American ratings board behind the M-to-AO re-rating of San Andreas.',
  },
  bbfc: {
    label: 'BBFC',
    definition:
      'The BBFC refused Manhunt 2 classification in the UK in 2007, effectively banning it until edited.',
  },
  'jack-thompson': {
    label: 'Jack Thompson',
    definition:
      'Jack Thompson was the Florida attorney who litigated against GTA for years until disbarment in 2008.',
  },
  renderware: {
    label: 'RenderWare',
    definition:
      'RenderWare was Criterion\u2019s middleware used for the PS2-era GTAs until EA bought Criterion in 2004.',
  },
  'radio-stations': {
    label: 'GTA radio stations',
    definition:
      'GTA radio is the in-car licensed-music and talk system that doubles as world-building.',
  },
  'three-protagonist': {
    label: 'Three-protagonist switching',
    definition:
      'GTA V lets the player switch between Michael, Franklin and Trevor at almost any moment.',
  },
  'rockstar-tech-pipeline': {
    label: 'Rockstar technology pipeline',
    definition:
      'Rockstar combines RAGE with Bullet physics, Euphoria behaviour, Bink video and Scaleform UI.',
  },
  'rdr2-production-scale': {
    label: 'RDR2 production scale',
    definition:
      'RDR2 was made by about 1,600 people over eight years with 500,000 lines of dialogue and 2,200 mocap days.',
  },
  'rstar-2022-ee-upgrade': {
    label: 'Expanded & Enhanced upgrade',
    definition:
      'The 2022 Expanded & Enhanced release brought GTA V to PS5 and Series X/S with 60fps and raytracing.',
  },

  // ─── Catalogue gaps: sequels, studios, people, minor titles ───────────────
  'manhunt-2': {
    label: 'Manhunt 2',
    definition:
      'Manhunt 2 (2007) is the asylum-escape sequel, initially rated AO and refused classification in the UK before an edited M release.',
  },
  'rockstar-london': {
    label: 'Rockstar London',
    definition:
      'Rockstar London was formed in 2005 and led Manhunt 2 after Rockstar Vienna closed.',
  },
  'rockstar-india': {
    label: 'Rockstar India',
    definition:
      'Rockstar India opened in Bangalore in 2016 as a support and co-development studio.',
  },
  'rockstar-new-england': {
    label: 'Rockstar New England',
    definition:
      'Rockstar New England, formerly Mad Doc Software and acquired in 2008, led the Bully 360 port.',
  },
  'woody-jackson': {
    label: 'Woody Jackson',
    definition:
      'Woody Jackson composed the Red Dead Redemption scores and co-composed GTA V\u2019s original score.',
  },
  'rob-nelson': {
    label: 'Rob Nelson',
    definition:
      'Rob Nelson is a Rockstar North design lead across Red Dead Redemption 2 and GTA VI.',
  },
  'aaron-garbut': {
    label: 'Aaron Garbut',
    definition:
      'Aaron Garbut is Rockstar North\u2019s longtime art director, defining the look of GTA since the 3D era.',
  },
  'smugglers-run': {
    label: "Smuggler's Run",
    definition:
      'Smuggler\u2019s Run (2000) is Angel Studios\u2019 off-road smuggling game, a PS2 launch title.',
  },
  oni: {
    label: 'Oni',
    definition:
      'Oni (2001) is Bungie West\u2019s anime-styled action game; Rockstar published the PS2 version.',
  },
  'state-of-emergency': {
    label: 'State of Emergency',
    definition:
      'State of Emergency (2002) is VIS Entertainment\u2019s riot-themed action game, published by Rockstar.',
  },
  beaterator: {
    label: 'Beaterator',
    definition:
      'Beaterator (2009) is the Timbaland music-creation tool for PSP and iOS, built with Rockstar Leeds.',
  },
};
