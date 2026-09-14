import type { DetailedTopic } from './types';

/**
 * Controversy, law and impact — the disputes that made Rockstar a case study.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `rockstar-controversies` and `hot-coffee` are stubs pointing at the pattern;
 * nerd discussion wants the receipts: who Jack Thompson was and why he was
 * disbarred, what the ratings bodies actually did, and what the sales records
 * mean. Allegations are labelled as allegations throughout — the engine
 * quotes these sentences verbatim.
 */
export const IMPACT_DEEP_TOPICS: DetailedTopic[] = [
  {
    id: 'jack-thompson',
    keywords: ['jack thompson', 'anti games lawyer', 'thompson disbarred', 'strickland'],
    phrases: ['jack thompson', 'the anti gta lawyer'],
    title: 'Jack Thompson',
    summary:
      'Jack Thompson was the Florida attorney who litigated against GTA and Manhunt for years until disbarment in 2008.',
    detail: `### Jack Thompson

**Jack Thompson**, a Florida attorney, spent 2001–2008 campaigning against Rockstar — blaming GTA III, Vice City and Manhunt for real-world violence, filing suits (including *Strickland v. Sony*, blaming GTA for a 2003 police killing), petitioning the FTC over Hot Coffee and Manhunt 2, and demanding AO ratings.

Courts repeatedly rejected the suits on First Amendment grounds. In **2008 the Florida Bar disbarred him** for misconduct across 27 counts — false statements, defying court orders — unrelated to any single game but ending his anti-games litigation. He remains the standard example of the 2000s "games cause violence" legal campaign and why it failed in court.`,
    level: 'expert',
    relatedConcepts: ['rockstar-controversies', 'hot-coffee', 'manhunt', 'esrb'],
    category: 'impact',
    sources: ['https://en.wikipedia.org/wiki/Jack_Thompson_(activist)'],
  },
  {
    id: 'esrb',
    keywords: ['esrb', 'entertainment software rating board', 'ao rating', 'mature rating', 'ratings board'],
    phrases: ['the esrb', 'esrb rating', 'adults only rating'],
    title: 'ESRB and the AO rating',
    summary:
      'The ESRB is the North American ratings board behind the M-to-AO re-rating of San Andreas and the initial AO for Manhunt 2.',
    detail: `### ESRB and the AO rating

The **Entertainment Software Rating Board** (ESRB, founded 1994) rates North American games EC through **AO (Adults Only 18+)**. AO is commercially fatal: Walmart, Target, Best Buy and all three console makers refuse AO titles, so an AO is effectively a ban from mainstream retail.

Two Rockstar cases define its power:

- **Hot Coffee (20 July 2005)** — *San Andreas* re-rated **M to AO** after the undisclosed minigame surfaced; Take-Two suspended production, recalled or re-stickered inventory, and shipped a clean M version that September.
- **Manhunt 2 (2007)** — initially rated **AO**, suspending its July release; Rockstar edited (blurring executions) and resubmitted to **M**, releasing for PS2/Wii/PSP that Halloween. A later PSP un-blur hack did not restore the AO.

The standing rule from Hot Coffee: publishers must disclose all on-disc pertinent content even if unreachable, and must protect games from third-party mods that undermine ratings.`,
    level: 'intermediate',
    relatedConcepts: ['hot-coffee', 'manhunt', 'rockstar-controversies', 'gta-v-sales'],
    category: 'impact',
    sources: [
      'https://www.esrb.org/blog/esrb-concludes-investigation-into-grand-theft-auto-san-andreas-revokes-m-mature-rating',
      'https://www.ftc.gov/news-events/news/press-releases/2006/06/makers-grand-theft-auto-san-andreas-settle-ftc-charges',
    ],
  },
  {
    id: 'bbfc',
    keywords: ['bbfc', 'british board film classification', 'manhunt 2 banned uk', 'refused classification'],
    phrases: ['the bbfc', 'bbfc rating'],
    title: 'BBFC and Manhunt 2',
    summary:
      'The BBFC refused Manhunt 2 classification in the UK in 2007 — a ban overturned on appeal, then re-imposed, then lifted for the edited M version.',
    detail: `### BBFC and Manhunt 2

The **British Board of Film Classification** refused *Manhunt 2* a certificate in June 2007 — the first UK games refusal in a decade — joined by Ireland, effectively banning it. Rockstar appealed to the Video Appeals Committee, which overturned the refusal; the BBFC challenged that in High Court, won a re-hearing, and refused again; Rockstar edited, and the revised version passed.

The case is taught as the high-water mark of UK games censorship before the 2012 switch to PEGI as the sole authority. The US AO and UK refusal together forced the edits that define the shipped *Manhunt 2* — the game most players know is the censored one.`,
    level: 'expert',
    relatedConcepts: ['manhunt', 'rockstar-controversies', 'esrb', 'rockstar-london'],
    category: 'impact',
    sources: ['https://www.cbsnews.com/news/manhunt-2-pulled-from-production/'],
  },
];
