import type { DetailedTopic } from './types';

/**
 * Company, studios and people — the human infrastructure behind the games.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The stub company file answers "what is Rockstar" and four studios. Nerd
 * discussion asks who did what, who left and why, and which studio did which
 * game. Every person below is already a graph node so comparisons can link
 * them; these topics give those nodes something to retrieve.
 *
 * Founding/acquisition dates are settled history (sourced, undated).
 * Anything about current roles, headcount or union status is dated
 * 2026-09-14 because it moves.
 */
export const PEOPLE_STUDIOS_TOPICS: DetailedTopic[] = [
  {
    id: 'sam-houser',
    keywords: ['sam houser', 'houser brothers', 'rockstar president', 'rockstar co-founder'],
    phrases: ['sam houser', 'rockstar president'],
    title: 'Sam Houser',
    summary:
      'Sam Houser co-founded Rockstar Games in 1998 with his brother Dan and remains its president and creative lead.',
    detail: `### Sam Houser

**Sam Houser** co-founded **Rockstar Games** in December 1998 with brother **Dan Houser**, **Terry Donovan** and **Jamie King** (plus Gary Foreman), after the Housers worked at BMG Interactive on the first GTAs. As **president**, he is the label\u2019s creative director — credited as executive producer across GTA and Red Dead — and the public face who rarely gives interviews.

When Dan left in March 2020, Take-Two confirmed Sam\u2019s role was unchanged. He remains the constant through every era: the satire of American culture that defines Rockstar is usually attributed to the brothers\u2019 outsider British perspective, with Sam as its producer and Dan as its writer.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'dan-houser', 'take-two', 'gta-series'],
    category: 'company',
    sources: [
      'https://www.theguardian.com/media/2012/nov/18/dan-houser-grand-theft-auto',
      'https://rockstargames.com/corpinfo',
    ],
  },
  {
    id: 'dan-houser',
    keywords: ['dan houser', 'houser writer', 'absurd ventures', 'dan houser left'],
    phrases: ['dan houser', 'the rockstar writer'],
    title: 'Dan Houser',
    summary:
      'Dan Houser co-founded Rockstar and wrote GTA and Red Dead until March 2020; he founded Absurd Ventures in 2023.',
    detail: `### Dan Houser

**Dan Houser** co-founded Rockstar in 1998 and was its **vice president, creative** and head writer — credited from *GTA 2* through *GTA V*, plus *Bully*, *Max Payne 3* and both Red Dead Redemptions. With Rupert Humphries and a small team he built the scripts, satire and radio that define the house style.

After an extended break from spring 2019 he left on **11 March 2020** (Take-Two SEC filing; stock fell ~5%). In June 2023 he founded **Absurd Ventures** in Santa Monica to build new universes across games, TV, animation, books and podcasts. GTA VI is therefore the first mainline GTA since the 1997 original made without him.`,
    level: 'intermediate',
    relatedConcepts: ['rockstar-games', 'sam-houser', 'absurd-ventures', 'gta-series', 'red-dead-series'],
    category: 'company',
    sources: [
      'https://www.bbc.com/news/technology-51381774',
      'https://www.hollywoodreporter.com/business/digital/rockstar-games-dan-houser-absurd-ventures-1235517148',
    ],
  },
  {
    id: 'leslie-benzies',
    keywords: ['leslie benzies', 'benzies', 'rockstar north president', 'benzies lawsuit'],
    phrases: ['leslie benzies', 'benzies lawsuit'],
    title: 'Leslie Benzies',
    summary:
      'Leslie Benzies produced GTA III through V as Rockstar North president, left in 2016, and sued Take-Two for $150m in royalties.',
    detail: `### Leslie Benzies

**Leslie Benzies** joined DMA, became **president of Rockstar North** after the Take-Two acquisition, and is credited as producer from *GTA III* (2001) through *GTA V* and *Online*. Alongside the Housers he was a named **Rockstar Principal** under the 2009 royalty plan, receiving equal allocations for years.

After a sabbatical from September 2014 he did not return — finding his access revoked in April 2015 — and in April 2016 sued Take-Two, Rockstar, North and the Housers for **$150 million** in unpaid royalties, alleging deception by the Allocation Committee. Rockstar counter-sued, calling the claims "entirely without merit and in many instances downright bizarre". Courts let core contract claims proceed (2017–2018 rulings); the case later settled out of court. In 2016 he founded **Build A Rocket Boy** (MindsEye). Reporting in 2026 links him to unrelated Epstein-files allegations he strongly denies — treat those as allegations, not findings.`,
    level: 'expert',
    relatedConcepts: ['rockstar-north', 'gta-series', 'take-two', 'sam-houser', 'dan-houser'],
    category: 'company',
    sources: [
      'https://www.theguardian.com/technology/2016/apr/13/rockstar-dismisses-grand-theft-auto-gta-lawsuit',
      'https://www.cbc.ca/news/entertainment/grand-theft-auto-rockstar-games-lawsuit-1.3534557',
    ],
  },
  {
    id: 'strauss-zelnick',
    keywords: ['strauss zelnick', 'zelnick', 'take two ceo', 'zelnickmedia'],
    phrases: ['strauss zelnick', 'take two ceo'],
    title: 'Strauss Zelnick',
    summary:
      'Strauss Zelnick is Take-Two\u2019s chairman (since 2007) and CEO (since 2011), the investor-facing voice of GTA VI\u2019s $8bn fiscal 2027.',
    detail: `### Strauss Zelnick

**Strauss Zelnick**, partner at ZelnickMedia since 2001, became **chairman of Take-Two in March 2007** and **CEO in January 2011**. He is the person who announces GTA delays and sales on earnings calls — the November 2026 GTA VI date, the 230-million GTA V figure and the **$8–8.2 billion FY27 net-bookings guidance** all come from his August 2026 remarks.

His public posture is disciplined restraint: "our preorders are exceptional... but we have not sold a single unit and a preorder can be cancelled" (Q1 FY27 call), which is why guidance stayed frozen despite unprecedented demand. He also fronted the $12.7bn Zynga combination (2022) as mobile diversification.`,
    level: 'intermediate',
    relatedConcepts: ['take-two', 'rockstar-games', 'gta-v-sales', 'gta-vi'],
    category: 'company',
    verifiedAt: '2026-09-14',
    timeSensitive:
      'Role and guidance move with Take-Two filings; FY27 bookings and VI date are the drifting parts.',
    sources: [
      'http://take2games.com/ir/management/strauss-zelnick',
      'https://www.gamedeveloper.com/business/gta-v-surpasses-230-million-sales-months-before-gta-vi-touches-down',
    ],
  },
  {
    id: 'bmc-interactive',
    keywords: ['bmg interactive', 'bmg', 'take two bmg acquisition', '1998 rockstar founded'],
    phrases: ['bmg interactive', 'the bmg acquisition'],
    title: 'BMG Interactive',
    summary:
      'BMG Interactive published the first GTAs; Take-Two bought its assets in 1998 for about $9m and built Rockstar on them.',
    detail: `### BMG Interactive

**BMG Interactive**, the games division of Bertelsmann\u2019s music group, published the original *Grand Theft Auto* (1997) and employed the Housers. Losing money and keen to exit games, BMG sold its interactive division to **Take-Two in 1998 for about $9 million**.

Take-Two invited Sam Houser to start a publishing label in New York under his own brand — **Rockstar Games**, founded December 1998. The deal also carried GTA\u2019s IP with it, which is why a 1997 BMG game became the foundation of a Take-Two franchise.`,
    level: 'expert',
    relatedConcepts: ['rockstar-games', 'take-two', 'sam-houser', 'gta-1'],
    category: 'company',
    sources: ['https://www.theguardian.com/media/2012/nov/18/dan-houser-grand-theft-auto'],
  },
  {
    id: 'absurd-ventures',
    keywords: ['absurd ventures', 'dan houser studio', 'absurd ventures games'],
    phrases: ['absurd ventures', 'dan houser new studio'],
    title: 'Absurd Ventures',
    summary:
      'Absurd Ventures is Dan Houser\u2019s Santa Monica media company (2023), building new universes across games, TV, books and podcasts.',
    detail: `### Absurd Ventures

Founded June 2023 by **Dan Houser** in Santa Monica after his 2020 Rockstar exit. The pitch is cross-medium IP from the start — "new universes" for games, live-action and animation, books and podcasts — rather than a games studio that later licenses out.

It is the other half of the post-Houser story: Sam stayed to run Rockstar into the GTA VI era; Dan left to try the same world-building without GTA. Nothing Houser-scale has shipped yet as of 14 September 2026, so treat project lists as announcements, not releases.`,
    level: 'expert',
    relatedConcepts: ['dan-houser', 'rockstar-games', 'sam-houser'],
    category: 'company',
    verifiedAt: '2026-09-14',
    timeSensitive: 'Startup slate: unreleased projects can be announced or cancelled.',
    sources: [
      'https://www.hollywoodreporter.com/business/digital/rockstar-games-dan-houser-absurd-ventures-1235517148',
    ],
  },
  {
    id: 'rockstar-toronto',
    keywords: ['rockstar toronto', 'rockstar canada', 'toronto studio'],
    phrases: ['rockstar toronto', 'the toronto studio'],
    title: 'Rockstar Toronto',
    summary:
      'Rockstar Toronto (formerly Rockstar Canada) made The Warriors and the Wii/Xbox 360 Bully port, then absorbed Vancouver in 2012.',
    detail: `### Rockstar Toronto

Founded as **Rockstar Canada**, the Oakville (Toronto-area) studio\u2019s signature is ***The Warriors*** (2005). It ported *Bully: Scholarship Edition* to Wii (with New England on 360) and co-develops larger Rockstars.

In **2012 it absorbed Rockstar Vancouver** after *Max Payne 3* — which is why Vancouver credits stop and Toronto\u2019s grow. In October 2025 three Toronto staff were among the 34 dismissals at the centre of the union dispute.`,
    level: 'expert',
    relatedConcepts: ['rockstar-studios', 'the-warriors', 'rockstar-vancouver', 'bully'],
    category: 'company',
    verifiedAt: '2026-09-14',
    timeSensitive: 'Headcount and dispute status move; the Warriors/Vancouver history is settled.',
    sources: ['https://en.wikipedia.org/wiki/Rockstar_Toronto'],
  },
  {
    id: 'rockstar-leeds',
    keywords: ['rockstar leeds', 'leeds studio', 'mobius entertainment'],
    phrases: ['rockstar leeds', 'the leeds studio'],
    title: 'Rockstar Leeds',
    summary:
      'Rockstar Leeds (formerly Mobius) built the Stories games, Chinatown Wars and the L.A. Noire portable work — Rockstar\u2019s handheld studio.',
    detail: `### Rockstar Leeds

Founded as **Mobius Entertainment**, acquired and renamed **Rockstar Leeds**, the English studio is Rockstar\u2019s handheld specialist: ***Liberty City Stories*** (2005) and ***Vice City Stories*** (2006) on PSP, ***Chinatown Wars*** (2009) on DS/PSP, plus *Beaterator* and portable conversions including *L.A. Noire* support.

Its design signature is compression without simplification — full 3D GTAs on a handheld, with the Stories games as canonical prequels rather than spin-offs. Staff there are among the five studios covered by the Rockstar Games Workers Union formed May 2026.`,
    level: 'expert',
    relatedConcepts: ['rockstar-studios', 'chinatown-wars', 'vice-city-stories', 'la-noire'],
    category: 'company',
  },
  {
    id: 'rockstar-lincoln',
    keywords: ['rockstar lincoln', 'lincoln qa', 'tarantula studios', 'rockstar qa'],
    phrases: ['rockstar lincoln', 'the lincoln studio'],
    title: 'Rockstar Lincoln',
    summary:
      'Rockstar Lincoln (formerly Tarantula) is the QA studio — 300+ testers who carried the worst of RDR2 crunch reporting.',
    detail: `### Rockstar Lincoln

Founded as **Tarantula Studios**, renamed **Rockstar Lincoln**, the Lincoln (England) studio is primarily **quality assurance** — 300+ staff, Rockstar\u2019s largest QA site. It is the studio most cited in crunch reporting: Kotaku\u2019s 2018 investigation found Lincoln generated the most overtime accounts, with mandatory overtime claimed from August 2017 (Rockstar said it was requested but optional) and 52.5–57.5 hour requested weeks into 2018.

Lincoln\u2019s work is invisible when it succeeds — every Rockstar release since the 2000s carries its testing — and newsworthy when it does not. It is also one of the five studios in the May 2026 Workers Union.`,
    level: 'expert',
    relatedConcepts: ['rockstar-studios', 'crunch', 'rockstar-games'],
    category: 'company',
  },
  {
    id: 'rockstar-dundee',
    keywords: ['rockstar dundee', 'ruffian games', 'dundee studio'],
    phrases: ['rockstar dundee', 'the dundee studio'],
    title: 'Rockstar Dundee',
    summary:
      'Rockstar Dundee (formerly Ruffian Games, acquired 2020) is the Dundee support studio — a homecoming for GTA\u2019s birthplace city.',
    detail: `### Rockstar Dundee

**Ruffian Games** (Crackdown 2, Master Chief Collection support) was acquired in **October 2020** and renamed **Rockstar Dundee** — returning a Rockstar studio to **Dundee**, where DMA Design founded GTA. It works as a support studio across Rockstar titles.

Symbolically it closes a loop: GTA left Dundee for Edinburgh in 2000; twenty years later Rockstar bought its way back. Staff there are covered by the Rockstar Games Workers Union formed May 2026.`,
    level: 'expert',
    relatedConcepts: ['rockstar-studios', 'dma-design', 'rockstar-north'],
    category: 'company',
    verifiedAt: '2026-09-14',
    timeSensitive: 'Support-studio roles move per-project; the 2020 acquisition is settled.',
    sources: ['https://www.rockstargames.com/newswire'],
  },
  {
    id: 'team-bondi',
    keywords: ['team bondi', 'brendan mcnamara', 'bondi studio', 'motionscan studio'],
    phrases: ['team bondi', 'the la noire studio'],
    title: 'Team Bondi',
    summary:
      'Team Bondi was Brendan McNamara\u2019s Sydney studio behind L.A. Noire — acclaimed, crunch-plagued, in liquidation by October 2011.',
    detail: `### Team Bondi

Founded 2003 in Sydney by **Brendan McNamara** (ex–Team Soho, *The Getaway*), single-game studio behind ***L.A. Noire*** (2011). Funded first by Sony Australia, published finally by Rockstar after a 2006 switch; seven years in development with Rockstar producers increasingly overruling Bondi management in the last two.

The after-story is the cautionary part: 100+ developers initially uncredited, 10–12 hour days alleged, IGDA investigation, Rockstar refusing future partnership ("badly damaged" relationship), administration 31 August 2011, liquidation 5 October 2011, A$1.4m in owed wages. Assets scattered to KMM and later Video Games Deluxe — now **Rockstar Australia** (March 2025).`,
    level: 'expert',
    relatedConcepts: ['la-noire', 'rockstar-games', 'rockstar-leeds'],
    category: 'company',
    sources: [
      'https://en.wikipedia.org/wiki/Team_Bondi',
      'https://www.gamedeveloper.com/business/report-rockstar-will-not-work-with-team-bondi-again',
    ],
  },
  {
    id: 'lazlow-jones',
    keywords: ['lazlow', 'lazlow jones', 'gta radio writer', 'lazlow dj'],
    phrases: ['lazlow', 'lazlow jones'],
    title: 'Lazlow Jones',
    summary:
      'Lazlow Jones wrote and hosted GTA radio from III through V — the satirical DJ who shaped the series\u2019 comedy — and was one of the four 100-hour-week writers.',
    detail: `### Lazlow Jones

**Lazlow Jones** — credited as Lazlow — wrote, produced and performed GTA\u2019s radio from *GTA III* through *GTA V*: host of Chatterbox, DJ, and the connective tissue of the series\u2019 satire. With Dan Houser, Michael Unsworth and Rupert Humphries he was one of the **four senior writers** Rockstar said worked the clarifying "three weeks" of 100-hour time on *RDR2*.

He left Rockstar in 2020 after nearly two decades. His departure, with Dan Houser\u2019s the same year, marks the end of the writing room that defined HD-era Rockstar comedy.`,
    level: 'expert',
    relatedConcepts: ['radio-stations', 'gta-series', 'dan-houser', 'crunch'],
    category: 'company',
  },
];
