import type { DetailedTopic } from './types';

/**
 * Rockstar Games — the games catalogue.
 *
 * A NOTE ON THE CONTENT
 * ---------------------
 * Every entry below is a stub: it carries the identifiers, aliases and
 * relations the retrieval engine needs in order to find and connect the
 * subject, plus a factual summary that is deliberately short. The prose is
 * meant to be replaced with your own writing — the engine is extractive, so
 * whatever you put in `detail` is exactly what gets quoted back.
 *
 * Replacing the text is safe and requires no code changes. What must NOT be
 * casually renamed is `id` and `keywords`/`phrases`: the first is the join key
 * for `concept-graph-data.ts`, facts and the corpus, and the latter two are
 * what make "Vice City" and "the one set in Miami" reach the same record.
 */
export const GAMES_TOPICS: DetailedTopic[] = [
  {
    id: 'gta-series',
    keywords: ['gta', 'grand theft auto', 'grand theft auto series', 'gta series'],
    phrases: ['grand theft auto', 'the gta games', 'gta franchise'],
    title: 'Grand Theft Auto',
    summary:
      'Grand Theft Auto is Rockstar Games\u2019 open-world crime series, running from the 1997 top-down original through the 3D era (GTA III, Vice City, San Andreas) and the HD era (GTA IV and GTA V).',
    detail: `### Grand Theft Auto

Grand Theft Auto is the series Rockstar Games is best known for: open-world action games about crime, driving and building an empire from nothing.

The series is usually divided into eras:

- **2D era** — *Grand Theft Auto* (1997), *GTA 2* (1999) and the *London* expansions, played from a top-down view.
- **3D era** — *GTA III* (2001), *Vice City* (2002), *San Andreas* (2004), plus the *Stories* titles on PSP. This is the era that defined the modern open-world formula.
- **HD era** — *GTA IV* (2008) and *GTA V* (2013), with a more grounded tone and a rebuilt engine. *GTA Online* grew out of GTA V into a persistent multiplayer world.

Each era has its own fictional continuity, so a city can appear in more than one era as a different version: Liberty City in the 3D era is not the same Liberty City as in the HD era.`,
    level: 'beginner',
    relatedConcepts: ['gta-iii', 'gta-vice-city', 'gta-san-andreas', 'gta-iv', 'gta-v', 'rockstar-games'],
    category: 'games',
  },
  {
    id: 'gta-iii',
    keywords: ['gta iii', 'gta 3', 'gta three', 'grand theft auto iii', 'grand theft auto 3', 'liberty city', 'claude'],
    phrases: ['gta 3', 'grand theft auto 3', 'the third gta'],
    title: 'Grand Theft Auto III',
    summary:
      'Grand Theft Auto III (2001) moved the series to a fully 3D open world with a third-person camera, and is widely treated as the template for the modern open-world game.',
    detail: `### Grand Theft Auto III (2001)

Developed by DMA Design — which became Rockstar North in 2002, shortly after release — *GTA III* moved the series from a top-down view into a fully 3D city.

It is set in **Liberty City**, a fictional stand-in for New York City, and follows a silent protagonist who works his way up through the city\u2019s criminal organisations after being left for dead.

Its importance is structural rather than narrative: it established the pattern of a large explorable city, missions that can be approached from anywhere in that city, and radio stations that play continuously as you drive. Most open-world games that followed borrow from it.`,
    level: 'beginner',
    relatedConcepts: ['gta-series', 'gta-vice-city', 'gta-san-andreas', 'rockstar-north'],
    category: 'games',
  },
  {
    id: 'gta-vice-city',
    keywords: ['vice city', 'gta vice city', 'grand theft auto vice city', 'tommy vercetti', 'miami', '1980s'],
    phrases: ['gta vice city', 'the miami one', 'the 80s gta'],
    title: 'Grand Theft Auto: Vice City',
    summary:
      'Grand Theft Auto: Vice City (2002) is set in a neon 1980s Miami analogue called Vice City, following Tommy Vercetti as he builds a criminal empire.',
    detail: `### Grand Theft Auto: Vice City (2002)

*Vice City* took the GTA III structure and gave it a strong period identity: **Vice City**, a fictional Miami, in the mid-1980s.

The player character, **Tommy Vercetti**, is voiced and written as a specific person rather than a silent avatar — the first time the series did that — and the soundtrack leans hard on 1980s pop, new wave and electro.

Its setting is one of the most imitated in the series: bright pastel colour, palm trees, and a story about cocaine money reshaping a city.`,
    level: 'beginner',
    relatedConcepts: ['gta-series', 'gta-iii', 'gta-san-andreas', 'vice-city-stories'],
    category: 'games',
  },
  {
    id: 'gta-san-andreas',
    keywords: ['san andreas', 'gta san andreas', 'cj', 'carl johnson', 'los santos', 'grove street', '1990s'],
    phrases: ['gta san andreas', 'the los santos one'],
    title: 'Grand Theft Auto: San Andreas',
    summary:
      'Grand Theft Auto: San Andreas (2004) is the largest of the 3D-era games, set across a fictional California — Los Santos, San Fierro and Las Venturas — and follows Carl "CJ" Johnson.',
    detail: `### Grand Theft Auto: San Andreas (2004)

*San Andreas* expanded the GTA formula to an entire fictional state rather than a single city, containing three metropolitan areas — **Los Santos** (Los Angeles), **San Fierro** (San Francisco) and **Las Venturas** (Las Vegas) — plus countryside and desert between them.

It follows **Carl "CJ" Johnson** returning to his old neighbourhood in Los Santos and getting pulled back into gang life, then into a much wider conspiracy.

It added substantial systems on top of the existing formula: character statistics that improve with use, gang territory control, and a wide customisation layer. It remains the best-selling PlayStation 2 game.`,
    level: 'beginner',
    relatedConcepts: ['gta-series', 'gta-iii', 'gta-vice-city', 'gta-v'],
    category: 'games',
  },
  {
    id: 'gta-iv',
    keywords: ['gta iv', 'gta 4', 'gta four', 'grand theft auto iv', 'grand theft auto 4', 'niko bellic', 'episodes from liberty city'],
    phrases: ['gta 4', 'grand theft auto 4', 'the fourth gta'],
    title: 'Grand Theft Auto IV',
    summary:
      'Grand Theft Auto IV (2008) rebooted the series into a new continuity with a rebuilt engine, telling a grounded immigrant story about Niko Bellic in a modern Liberty City.',
    detail: `### Grand Theft Auto IV (2008)

*GTA IV* started the **HD era**: a new continuity and a new engine, with a Liberty City rebuilt at a much higher level of detail than the 3D-era version.

It follows **Niko Bellic**, who arrives in Liberty City expecting the life his cousin has been describing and finds the reality is different. The tone is deliberately narrower than San Andreas — less empire-building, more character study.

Two standalone expansions followed, *The Lost and Damned* and *The Ballad of Gay Tony*, later collected as *Episodes from Liberty City*. They overlap with the main story\u2019s timeline, showing the same events from other perspectives.`,
    level: 'intermediate',
    relatedConcepts: ['gta-series', 'gta-v', 'gta-iii', 'rage-engine'],
    category: 'games',
  },
  {
    id: 'gta-v',
    keywords: ['gta v', 'gta 5', 'gta five', 'grand theft auto v', 'grand theft auto 5', 'franklin', 'michael', 'trevor', 'los santos', 'gta online'],
    phrases: ['gta 5', 'grand theft auto 5', 'the fifth gta'],
    title: 'Grand Theft Auto V',
    summary:
      'Grand Theft Auto V (2013) is Rockstar\u2019s best-selling game, set in Los Santos with three switchable protagonists, and the base for the long-running GTA Online.',
    detail: `### Grand Theft Auto V (2013)

*GTA V* returns to **Los Santos** and the surrounding Blaine County, and is the first in the series to use **three switchable protagonists** — Michael, Franklin and Trevor — whose stories interlock. Missions frequently let you switch between them mid-heist.

Commercially it is the outlier: it shipped across three console generations, and it is one of the best-selling entertainment products of all time.

**GTA Online** began as the multiplayer component of GTA V and became a persistent world that has been updated continuously for over a decade, with its own content cycles and in-game economy.`,
    level: 'beginner',
    relatedConcepts: ['gta-series', 'gta-iv', 'gta-san-andreas', 'gta-online', 'rage-engine'],
    category: 'games',
  },
  {
    id: 'gta-online',
    keywords: ['gta online', 'gtao', 'online mode', 'shark cards', 'gta online updates', 'gta+', 'kortz center', 'safehouse in the hills'],
    phrases: ['gta online', 'gta v online', 'the kortz center heist', 'gta plus'],
    title: 'GTA Online',
    summary:
      'GTA Online is the persistent multiplayer mode launched 1 October 2013 alongside GTA V, built around co-operative heists, businesses and free content updates funded by Shark Cards.',
    detail: `### GTA Online

GTA Online launched on **1 October 2013**, two weeks after *GTA V*, and became a live-service world of its own: a shared version of Los Santos where players run businesses, heists and races together.

It has been expanded continuously rather than replaced, with updates adding new criminal enterprises, vehicles and modes. Its in-game currency ties to **Shark Cards**, the real-money microtransaction that funds the updates. **Heists**, the long-awaited four-player missions, arrived in 2015.

As of 14 September 2026 it is still being updated. **GTA+**, a paid monthly membership, launched in March 2022 for PS5 and Xbox Series X/S (later PC with the March 2025 Enhanced release). The December 2025 update **A Safehouse in the Hills** brought back Michael De Santa, confirming the GTA V Option C ending as canon. The July 2026 update **The Kortz Center Heist** (Title Update 1.73, 14 July 2026) added an art-gallery heist playable solo or with up to four players — the first full heist since Cayo Perico in 2020.

The commercial argument around GTA Online is that it changed Rockstar\u2019s business model: a game that would once have been followed by single-player expansions instead became a platform that is still being patched years after release.`,
    level: 'intermediate',
    relatedConcepts: ['gta-v', 'rockstar-games', 'gta-v-sales'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Live-service content: new GTA Online updates, GTA+ changes and heist releases move this entry. GTA VI launches 19 November 2026 and may replace or rename this Online — re-verify in launch week.',
    sources: [
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_Online',
      'https://www.ign.com/wikis/gta-5/GTA_Online',
    ],
  },
  {
    id: 'vice-city-stories',
    keywords: ['vice city stories', 'liberty city stories', 'stories games', 'psp gta'],
    phrases: ['vice city stories', 'liberty city stories'],
    title: 'The Stories games',
    summary:
      'Liberty City Stories (2005) and Vice City Stories (2006) are PSP titles set before GTA III and Vice City, later ported to PlayStation 2.',
    detail: `### Liberty City Stories and Vice City Stories

These are handheld spin-offs built on the 3D-era engine, released on PSP and later ported to PlayStation 2.

- **Liberty City Stories** (2005) is set in Liberty City before the events of *GTA III*.
- **Vice City Stories** (2006) is set in Vice City before the events of *Vice City*.

They are prequels, which means they share cities and characters with the main 3D-era games but show an earlier state of each city.`,
    level: 'expert',
    relatedConcepts: ['gta-series', 'gta-iii', 'gta-vice-city'],
    category: 'games',
  },
  {
    id: 'red-dead-series',
    keywords: ['red dead', 'red dead redemption', 'red dead revolver', 'western', 'wild west'],
    phrases: ['the red dead games', 'red dead franchise'],
    title: 'Red Dead',
    summary:
      'Red Dead is Rockstar\u2019s Western series: Red Dead Revolver (2004), Red Dead Redemption (2010) and Red Dead Redemption 2 (2018).',
    detail: `### Red Dead

Red Dead is Rockstar\u2019s Western series, and the clearest example of the studio applying the GTA formula to a different genre.

- **Red Dead Revolver** (2004) began as a different project and was acquired by Rockstar; it is more linear and arcade-like than what followed.
- **Red Dead Redemption** (2010) is an open-world Western following John Marston.
- **Red Dead Redemption 2** (2018) is a prequel following Arthur Morgan and the Van der Linde gang.

The later two are the ones usually meant by "Red Dead" in conversation.`,
    level: 'beginner',
    relatedConcepts: ['red-dead-redemption-2', 'rockstar-games', 'rockstar-san-diego'],
    category: 'games',
  },
  {
    id: 'red-dead-redemption-2',
    keywords: ['rdr2', 'red dead redemption 2', 'red dead 2', 'arthur morgan', 'dutch', 'van der linde', 'rdr'],
    phrases: ['red dead redemption 2', 'rdr 2', 'the arthur morgan one'],
    title: 'Red Dead Redemption 2',
    summary:
      'Red Dead Redemption 2 (2018) is an open-world Western and a prequel to Red Dead Redemption, following Arthur Morgan and the Van der Linde gang as it falls apart.',
    detail: `### Red Dead Redemption 2 (2018)

*RDR2* is a prequel to the 2010 *Red Dead Redemption*, following **Arthur Morgan** and the **Van der Linde gang** in the years before the first game.

Its reputation rests on two things: the scale and density of its open world, and its unusually slow, deliberate pacing — animation, travel and interaction are all given more time than is typical for the genre.

**Red Dead Online** was its multiplayer component, following the GTA Online model.`,
    level: 'beginner',
    relatedConcepts: ['red-dead-series', 'rage-engine', 'rockstar-games'],
    category: 'games',
  },
  {
    id: 'max-payne-series',
    keywords: ['max payne', 'noir', 'bullet time', 'remedy'],
    phrases: ['the max payne games', 'max payne franchise'],
    title: 'Max Payne',
    summary:
      'Max Payne is a noir third-person shooter series built around "bullet time"; the first two were developed by Remedy and published by Rockstar, Max Payne 3 was made by Rockstar Studios, and a Remedy remake is in full production.',
    detail: `### Max Payne

Max Payne is a noir third-person shooter series, and Rockstar\u2019s main non-open-world franchise.

- **Max Payne** (2001) and **Max Payne 2: The Fall of Max Payne** (2003) were developed by **Remedy Entertainment** and published by Rockstar. They introduced **bullet time** — slowing time during combat — and told their stories through graphic-novel panels.
- **Max Payne 3** (2012) was developed internally by **Rockstar Studios** and moved the character to S\u00e3o Paulo, with a heavier emphasis on cover shooting.

As of 14 September 2026 a combined **Max Payne 1 & 2 remake** is in full production at Remedy on its Northlight engine for PC, PS5 and Xbox Series X/S, funded and published by Rockstar. Remedy confirmed in its August 2026 half-year report that Rockstar controls publishing and announcements, so no release date has been given.

The series is a useful contrast when talking about Rockstar\u2019s range: it is linear, tightly scripted and stylised in a way the open-world games are not.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'rockstar-vancouver', 'max-payne-remake'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The remake status: in full production with no date as of August 2026; any Rockstar announcement moves this entry.',
    sources: [
      'https://www.gamesradar.com/games/max-payne/max-payne-1-and-2-remake-is-still-happening-but-publisher-rockstar-wont-let-remedy-say-any-more',
      'https://remedygames.com/games/max-payne-1-2-remake',
    ],
  },
  {
    id: 'bully',
    keywords: ['bully', 'canis canem edit', 'bullworth', 'jimmy hopkins'],
    phrases: ['bully game', 'the school game'],
    title: 'Bully',
    summary:
      'Bully (2006) — released as Canis Canem Edit in some regions — is a Rockstar game set in a boarding school, following Jimmy Hopkins.',
    detail: `### Bully (2006)

*Bully* — titled **Canis Canem Edit** in some regions — applies the open-world structure to a boarding school rather than a city.

The player is **Jimmy Hopkins**, navigating cliques, classes and a closed campus at Bullworth Academy. The world is smaller and more contained than a GTA city, and the tone is closer to dark comedy than crime drama.

*A Scholarship Edition* followed in 2008 with additional content.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'rockstar-vancouver'],
    category: 'games',
  },
  {
    id: 'midnight-club-series',
    keywords: ['midnight club', 'street racing', 'racing game', 'midnight club 3'],
    phrases: ['the midnight club games', 'midnight club racing'],
    title: 'Midnight Club',
    summary:
      'Midnight Club is Rockstar\u2019s street-racing series, running from 2000 to 2008 and built around illegal overnight racing through real cities.',
    detail: `### Midnight Club

Midnight Club is Rockstar\u2019s street-racing series: illegal racing through city streets at night, with a focus on speed and customisation rather than simulation.

- **Midnight Club: Street Racing** (2000)
- **Midnight Club II** (2003)
- **Midnight Club 3: DUB Edition** (2005)
- **Midnight Club: Los Angeles** (2008)

The series is the clearest evidence that Rockstar\u2019s open-world technology was not limited to crime games — the same city-building and traffic systems underpin a racing game.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'rockstar-san-diego'],
    category: 'games',
  },
  {
    id: 'manhunt',
    keywords: ['manhunt', 'survival horror', 'james earl cash', 'carcer city'],
    phrases: ['manhunt game', 'the manhunt games'],
    title: 'Manhunt',
    summary:
      'Manhunt (2003) and Manhunt 2 (2007) are stealth survival-horror games and the most controversial titles Rockstar has released.',
    detail: `### Manhunt (2003) and Manhunt 2 (2007)

*Manhunt* is a stealth survival-horror game in which the player character is forced to kill on camera for a snuff-film director. **Manhunt 2** followed in 2007 and was refused classification in several countries, most notably receiving an initial **AO (Adults Only)** rating in the United States that effectively blocked console release until it was edited.

These two games sit at the centre of most arguments about Rockstar and violence in games: they were cited in political campaigns against the industry, and the *Manhunt 2* ratings dispute is a standard case study in how ratings boards and publishers negotiate.`,
    level: 'expert',
    relatedConcepts: ['rockstar-games', 'rockstar-controversies', 'hot-coffee'],
    category: 'games',
  },
  {
    id: 'table-tennis',
    keywords: ['table tennis', 'rockstar table tennis', 'rockstar games presents table tennis'],
    // `phrases` (not `keywords`) become matchable aliases. The title's bare form
    // is the full "Rockstar Games Presents Table Tennis", so without these the
    // obvious question "What is Table Tennis?" linked nothing at all.
    phrases: ['table tennis', 'rockstar table tennis', 'the table tennis game'],
    title: 'Rockstar Games Presents Table Tennis',
    summary:
      'Rockstar Games Presents Table Tennis (2006) is a focused sports game, notable as the first title built on the Rockstar Advanced Game Engine.',
    detail: `### Rockstar Games Presents Table Tennis (2006)

A deliberately small game: one sport, no career mode filler, released at a budget price.

Its significance is technical. It was the first game built on the **Rockstar Advanced Game Engine (RAGE)**, the engine that would go on to power *GTA IV*, *GTA V*, *Red Dead Redemption* and its sequel. Rockstar used a contained project to prove the engine before committing a mainline title to it.`,
    level: 'expert',
    relatedConcepts: ['rage-engine', 'rockstar-games', 'rockstar-san-diego'],
    category: 'games',
  },
];
