import type { DetailedTopic } from './types';

/**
 * The GTA VI era, current status, and the 2020s controversies.
 *
 * WHY THESE LIVE IN THEIR OWN FILE
 * --------------------------------
 * Everything here is TIME-SENSITIVE. GTA VI is unreleased as of the date below;
 * the sales totals and the litigation around Rockstar's 2025 dismissals are all
 * still moving. Keeping the volatile entries together means one place to
 * re-verify, and `scripts/check-knowledge.ts` fails once any `verifiedAt` ages
 * past a year so the drift cannot go unnoticed.
 *
 * Every claim in this file is attributed. Where a fact is an ALLEGATION rather
 * than a finding — the union-busting accusation, the budget rumours — the prose
 * says so explicitly, because an extractive engine will quote these sentences
 * verbatim and must never upgrade a claim into a fact.
 */
export const GTA_VI_ERA_TOPICS: DetailedTopic[] = [
  {
    id: 'gta-vi',
    keywords: [
      'gta 6', 'gta vi', 'gta six', 'grand theft auto 6', 'grand theft auto vi',
      'gta 6 release date', 'gta 6 price', 'jason', 'lucia', 'leonida',
    ],
    phrases: ['grand theft auto vi', 'the next gta', 'gta 6', 'the new gta'],
    title: 'Grand Theft Auto VI',
    summary:
      'Grand Theft Auto VI is Rockstar\u2019s next mainline entry, set in the state of Leonida and its Vice City, following the criminal couple Jason Duval and Lucia Caminos. It is scheduled for PlayStation 5 and Xbox Series X/S on 19 November 2026, priced at $79.99. No Online mode has been announced.',
    detail: `### Grand Theft Auto VI

**Grand Theft Auto VI** is the next mainline *Grand Theft Auto* game, developed and published by Rockstar Games. It is the first mainline entry since **Dan Houser** left Rockstar in March 2020.

#### Release status (as of 14 September 2026)

- Scheduled for **19 November 2026** on **PlayStation 5** and **Xbox Series X/S**.
- **No Windows/PC version is scheduled at launch.** Rockstar has confirmed a PC version will come later and says it is prioritising consoles; industry speculation points later, but no date is announced.
- Priced at **$79.99** standard, announced June 2026 — the first Rockstar game above the standard $70. A **$100 Ultimate Edition** exists (UK £89.99, EU €99.99). Pre-orders opened 25 June 2026. Sensor Tower reported in August 2026 that **89% of pre-orders were for that edition**, far above the usual 10–20% for premium editions.
- The game is unreleased: date, price, editions and pre-order splits can still change.

#### The delays

The first trailer, in December 2023, showed a **2025** window.

1. **May 2025** — delayed to **26 May 2026**.
2. **November 2025** — delayed again to **19 November 2026**.

#### Promotion

- Confirmed in **February 2022**, revealed with one trailer in **December 2023**, then quiet until **May 2025**.
- The **second trailer, 6 May 2025, drew a record 475 million views across all platforms in 24 hours**.

#### Setting

The game is set in the fictional state of **Leonida**, based on Florida, and returns to **Vice City** — previously the setting of the 2002 game. Rockstar lists Vice City, the **Leonida Keys**, **Grassrivers**, **Port Gellhorn**, **Ambrosia** and **Mount Kalaga National Park**.

The world satirises 2020s American influencer and social-media culture.

#### Characters

The story follows a criminal couple, explicitly framed as **Bonnie and Clyde**. After an easy score goes wrong they are drawn into a statewide conspiracy.

- **Jason Duval** — working for drug runners in the Leonida Keys when he meets Lucia.
- **Lucia Caminos** — the series\u2019 **first female lead of the modern era**, introduced inside a correctional facility.

Rockstar has also named supporting characters: **Cal Hampton**, **Boobie Ike**, **Dre\u2019Quan Priest**, **Real Dimez (Bae-Luxe and Roxy)**, **Raul Bautista** and **Brian Heder**. Rockstar has not officially announced the voice cast — treat community casting claims as unverified. Rockstar has not announced a GTA VI Online mode.

Sources: [Wikipedia: Grand Theft Auto VI](https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI) · [Reuters: Take-Two prices GTA VI at $79.99](https://www.reuters.com/technology/take-two-prices-grand-theft-auto-vi-7999-2026-06-24/) · [GamesIndustry.biz: 89% of pre-orders](https://www.gamesindustry.biz/sensor-tower-89-of-gta6-preorders-are-for-the-100-ultimate-edition)`,
    level: 'beginner',
    relatedConcepts: ['gta-series', 'gta-v', 'rockstar-north', 'gta-vi-leak', 'rage-engine', 'leonida'],
    category: 'games',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'EVERYTHING here. The game is unreleased: release date, price, editions, pre-order split, PC plans and cast details all change, and the delay history will gain entries. Scheduled re-verification: GTA VI launches 19 November 2026 — rewrite this entry plus the release_date/price_editions facts in launch week instead of waiting for the yearly check.',
    sources: [
      'https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI',
      'https://www.reuters.com/technology/take-two-prices-grand-theft-auto-vi-7999-2026-06-24/',
      'https://www.gamesindustry.biz/sensor-tower-89-of-gta6-preorders-are-for-the-100-ultimate-edition',
    ],
  },

  {
    id: 'rockstar-2025-dismissals',
    keywords: [
      'rockstar firings', 'union', 'union busting', 'iwgb', 'rockstar union',
      '34 employees', 'rockstar layoffs',
    ],
    phrases: ['the rockstar firings', 'rockstar union dispute', 'the union busting claim'],
    title: 'The Rockstar union dispute',
    summary:
      'Rockstar dismissed 34 employees in October 2025. The company cited leaked confidential information and "gross misconduct"; the IWGB called it union busting. A tribunal refused interim relief in January 2026, and the Rockstar Games Workers Union formed that May.',
    detail: `### The Rockstar union dispute

In **October 2025** Rockstar dismissed **34 employees** — **31 from Rockstar North and three from Rockstar Toronto**.

- **Rockstar's stated reason:** public discussion and distribution of confidential information. Take-Two said the dismissals were **"for gross misconduct, and for no other reason"**.
- **The IWGB's claim:** the Independent Workers' Union of Great Britain denied that and accused Rockstar of **union busting**, stating the employees were attempting to unionise with labour organisers on Discord. IWGB president **Alex Marshall** called it "the most blatant and ruthless act of union busting in the history of the games industry".

**Both positions are recorded here deliberately.** Rockstar's account is the company's own statement; union busting is an **allegation**, and the one tribunal ruling so far went against it — see below.

#### What has actually been decided

- **13 January 2026** — a preliminary hearing of the **Glasgow Employment Tribunal rejected the dismissed staff's request for interim relief** (continued pay while awaiting a full hearing). The judge stated it did not appear likely that a full hearing would find trade union membership was the principal reason for dismissal.

That is a ruling on **interim relief only**, not a final finding on the dismissals. As of 14 September 2026 the substantive claim is being heard: the **final hearing runs 10 September to 16 October 2026** at Glasgow Employment Tribunal, where the IWGB alleges unlawful blacklisting and dismissal without process.

#### The pressure around it

- **November 2025** — protests outside Rockstar North and Take-Two's Edinburgh and London offices, supported by Scottish Greens co-leader **Ross Greer**. Rockstar delayed GTA VI to 19 November 2026 the same week as the dismissals; reporting said the dismissals did not cause the delay but could affect later deadlines, and a Rockstar North employee described morale as "at rock bottom".
- **10 December 2025** — Labour MP **Chris Murray** raised it at Prime Minister's Questions. **Keir Starmer** called the firings "deeply concerning" and said ministers would investigate.
- **28 May 2026** — the **Rockstar Games Workers Union** was formed, covering employees at Rockstar's **Dundee, Leeds, Lincoln, London and North** studios.
- **30 June 2026** — staff began seeking **union recognition under IWGB Game Workers**.
- **1 July 2026** — Rockstar was accused of ignoring pay inequity, mandating crunch and "weaponising bonuses".

#### Before this

Rockstar asked employees to end remote work and return **five days a week from April 2024**, citing "productivity and security" as GTA VI neared. The IWGB criticised that as contradicting earlier promises on flexible working, and employees argued managers kept flexibility the staff did not.

Sources: [Bloomberg: studio accused of union busting](https://www.bloomberg.com/news/articles/2025-10-31/-grand-theft-auto-studio-accused-of-union-busting-after-firings) · [GamesIndustry.biz: judge rejects interim relief](https://www.gamesindustry.biz/judge-rejects-fired-rockstar-staffs-request-for-interim-relief) · [Aftermath: Rockstar Games Workers Union](https://aftermath.site/rockstar-games-workers-union-public-announcement/) · [The Guardian: workers seek union recognition](https://www.theguardian.com/politics/2026/jun/30/grand-theft-auto-workers-seek-union-recognition-rockstar-games) · [IWGB: final hearing September 2026](https://iwgb.org.uk/en/post/final-hearing-rockstar-iwgb)`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'rockstar-north', 'rockstar-toronto', 'crunch', 'rockstar-controversies', 'gta-vi'],
    category: 'impact',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'An ACTIVE legal dispute. The final hearing (10 Sep–16 Oct 2026) is underway as of this date; the outcome, union recognition talks and any appeal move this entry.',
    sources: [
      'https://www.bloomberg.com/news/articles/2025-10-31/-grand-theft-auto-studio-accused-of-union-busting-after-firings',
      'https://www.gamesindustry.biz/judge-rejects-fired-rockstar-staffs-request-for-interim-relief',
      'https://aftermath.site/rockstar-games-workers-union-public-announcement/',
      'https://www.theguardian.com/politics/2026/jun/30/grand-theft-auto-workers-seek-union-recognition-rockstar-games',
      'https://iwgb.org.uk/en/post/final-hearing-rockstar-iwgb',
    ],
  },

  {
    id: 'crunch',
    keywords: [
      'crunch', 'overtime', 'working conditions', 'rockstar culture', '100 hour weeks',
      'rockstar overtime', 'crunch culture',
    ],
    phrases: ['the crunch report', 'working at rockstar', 'rockstar working conditions'],
    title: 'Crunch and working conditions at Rockstar',
    summary:
      'The October 2018 "100-hour weeks" quote was made by Dan Houser about Red Dead Redemption 2. Rockstar clarified it referred only to four senior writers over three weeks, while investigative reporting described months and years of overtime across the wider team.',
    detail: `### Crunch at Rockstar

The best-known episode began with an interview in **Vulture on 14 October 2018**, in which **Dan Houser** said the team had been "working 100-hour weeks" several times that year while finishing *Red Dead Redemption 2*.

#### The clarification that matters

**Rockstar's clarification the next day is the company's statement, not Houser's original words** — a distinction usually lost in retellings. It said the hours affected **only the senior writing staff — Houser, Michael Unsworth, Rupert Humphries and Lazlow Jones — and only for three weeks** of the entire development. Houser added that the company would never expect or force any employee to work that long, and that those staying late were "powered by their passion" for the project.

#### The investigative reporting

**Jason Schreier's Kotaku investigation**, published 23 October 2018, reported a different picture for the wider team. It is worth being precise about what it found:

- It spoke with **77 current and former employees**. **None had worked 100-hour weeks** — many **averaged around 55 to 60 hours a week**, and most had been asked or felt compelled to work nights and weekends.
- Some Rockstar San Diego staff said **80-hour weeks were often mandatory between 2011 and 2016**, and were told to "just test [GTA V] for another eight hours" if they had no current RDR2 work. For some, RDR2 crunch began in **2016 or 2017**.
- **QA carried the worst of it**, then cinematics and design. **Rockstar Lincoln** (the primary QA studio, 300+ staff) and Rockstar New York generated the most accounts.
- Staff were **salaried, so overtime was unpaid**, and many depended on **year-end bonuses tied to the game's sales performance**.
- Rockstar had **requested 52.5-hour weeks between October 2017 and August 2018, and 57.5-hour weeks in August and September 2018**. Lincoln workers claimed overtime was mandatory from August 2017; in October 2018 Rockstar said it had been requested but remained optional.
- Rockstar published its own **average reported weekly hours for 2018: 42.4 (Jan–Mar), 45.5 (Apr–Jun), 45.8 (Jul–Sep)** — and disputed the higher figures as "individual anecdotes which are usually self-selecting... for the most extreme ends of the scale".

**These two accounts address different populations and do not actually contradict each other.** Houser's "three weeks" statement is about four senior writers; the reporting is about the wider team over months and years. Presenting them as a simple "both sides" dispute misreads both.

#### Earlier episode: the "Rockstar Spouse" letter

In **January 2010**, **wives of several Rockstar San Diego employees** published an open letter under the pseudonym **"Rockstar Spouse"**, alleging conditions imposed since **March 2009**: **twelve-hour days and six-day weeks**, with below-industry-average salary increases. The **IGDA** called the alleged conditions "deceptive, exploitative, and ultimately harmful". Rockstar denied the claims and said it was "saddened if any former members of any studio did not find their time here enjoyable or creatively fulfilling".

Less than two months after *Red Dead Redemption* shipped in May 2010, **about 40 of Rockstar San Diego's 180 staff were laid off** — which Rockstar described as "typical with game development".

#### Afterwards

By **April 2020**, employees reported the company had made significant cultural changes prompted by the publicity, and many were cautiously optimistic. In **March 2021** Rockstar shipped a fan's fix for GTA Online's load times and **paid the modder $10,000** through its Bug Bounty programme — a small but telling counterpoint.

Sources: [Kotaku: Inside Rockstar Games' Culture Of Crunch](https://kotaku.com/inside-rockstar-games-culture-of-crunch-1829936466) · [Kotaku: 18 Months After RDR2, Rockstar Has Made Big Cultural Changes](https://kotaku.com/18-months-after-red-dead-redemption-2-rockstar-has-mad-1842880524) · [Eurogamer: Rockstar Spouse attacks studio conditions](https://www.eurogamer.net/articles/rockstar-spouse-attacks-studio-conditions)`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'red-dead-redemption-2', 'dan-houser', 'rockstar-lincoln', 'rockstar-san-diego', 'rockstar-controversies'],
    category: 'impact',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'The 2010 and 2018 episodes are settled history. What drifts is the characterisation: the 2025\u2013present dispute re-litigates the same questions and is unresolved.',
    sources: [
      'https://kotaku.com/inside-rockstar-games-culture-of-crunch-1829936466',
      'https://kotaku.com/18-months-after-red-dead-redemption-2-rockstar-has-mad-1842880524',
      'https://www.eurogamer.net/articles/rockstar-spouse-attacks-studio-conditions',
    ],
  },
];
