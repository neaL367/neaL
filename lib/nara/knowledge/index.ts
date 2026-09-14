/**
 * Nara V2 — knowledge base loader.
 *
 * Consolidates the five curated sources (topics, concepts, concept graph,
 * facts, corpus) into ONE indexed structure, built once at module load.
 *
 * Two things this fixes from the legacy engine:
 *  1. Keys were inconsistent — `TOPICS` was an array scanned with `.find()`,
 *     `CONCEPTS` was a record, and the concept graph was a third thing with a
 *     fourth (`web-framework-topics`) auto-indexed into it. Lookups differed
 *     per lane, so a term could resolve differently depending on which lane
 *     asked. Here every entity lives in one map with one resolution path.
 *  2. The legacy graph auto-indexed every topic using `topic.keywords` as
 *     aliases, which produced false concepts from generic keywords
 *     ("what does this function do" -> `arrow`). Aliases here come from
 *     explicit labels and curated alias lists only — never from broad keyword
 *     sets — and each alias records its specificity so a longer, more exact
 *     match always outranks a shorter, vaguer one.
 */
import type {
  Concept,
  ConceptEdge,
  ConceptNode,
  CorpusSection,
  Fact,
  Topic,
} from '../types';

// Curated content. These live under `lib/nara/data` so that the engine owns the
// content it answers from, and the legacy `lib/chat` tree can be removed
// entirely rather than kept alive as a data dependency.
import { TOPICS as LEGACY_TOPICS, CONCEPTS as LEGACY_CONCEPTS } from '../data/topics';
import { CONCEPT_NODES, CONCEPT_EDGES } from '../data/concept-graph-data';
import { SITE_KNOWLEDGE_TRIPLES } from '../data/knowledge-graph-data';
import { FILM_KNOWLEDGE } from '../data/personas';
import corpusData from './corpus.json';

const LEVELS = new Set(['beginner', 'intermediate', 'expert']);

/** The legacy data declares a `level` union but does not always set it. */
function normalizeLevel(level: unknown): 'beginner' | 'intermediate' | 'expert' {
  return typeof level === 'string' && LEVELS.has(level)
    ? (level as 'beginner' | 'intermediate' | 'expert')
    : 'intermediate';
}

// ─── Normalised records ──────────────────────────────────────────────────────

/**
 * Film topics, promoted from `FILM_KNOWLEDGE` in personas.ts.
 *
 * This data existed and was fully written, but the legacy concept graph never
 * indexed it — films lived behind a `film:*` key that only the conversational
 * handler understood. That is why "Interstellar vs Arrival" was intercepted as
 * chit-chat before the comparison handler ever ran. Promoting it to real topics
 * makes both films first-class subjects of comparison and retrieval.
 */
const FILM_TOPICS: Topic[] = Object.entries(FILM_KNOWLEDGE).map(([id, film]) => {
  const f = film as { title: string; text: string; suggestions?: string[] };
  const plain = f.text.replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
  return {
    id: `film-${id}`,
    title: f.title,
    keywords: [id],
    // The film's own name is the primary alias, so "Interstellar vs Arrival"
    // links both subjects and the comparison composer can run.
    phrases: [id, id.replace(/-/g, ' '), f.title.split(/[:(&]/)[0].trim()],
    summary: plain.length > 320 ? `${plain.slice(0, 300).replace(/\s\S*$/, '')}…` : plain,
    detail: plain,
    level: 'beginner' as const,
    relatedConcepts: Object.keys(FILM_KNOWLEDGE).filter(k => k !== id).map(k => `film-${k}`),
    category: 'films',
    code: undefined,
    codeCaption: undefined,
  };
});

/**
 * Portfolio subjects that are not part of the Rockstar curriculum.
 *
 * These survive the domain swap because they describe this site's author, which
 * the co-op and volunteering pages still cover. They are no longer derived from
 * a deleted concept dictionary — each one is written out in full here.
 */
const PORTFOLIO_TOPICS: Topic[] = [
  {
    id: 'autonomy',
    title: 'Autonomy & Senior Mentorship',
    keywords: ['mentor', 'mentorship', 'autonomy', 'senior engineer'],
    phrases: ['mentor', 'mentorship', 'mentors', 'autonomy', 'senior mentorship', 'being mentored'],
    summary:
      'During the TQM co-op Neal worked with a senior mentor who reviewed his work and gave direction, while being trusted to own tasks end to end.',
    detail:
      'During the TQM co-op Neal worked with a senior mentor who reviewed his work and gave direction, while being trusted to own tasks end to end. The balance mattered: autonomy to make decisions, with a senior engineer available to catch mistakes early and explain the reasoning behind established practice.',
    level: 'beginner',
    relatedConcepts: ['tqm'],
    category: 'personal',
  },
];

/** Curated topics plus the film topics promoted from the persona data. */
export const TOPICS: Topic[] = [
  ...LEGACY_TOPICS.map(t => ({
    id: t.id,
    title: t.title,
    keywords: t.keywords ?? [],
    phrases: t.phrases,
    summary: t.summary,
    detail: t.detail,
    level: normalizeLevel(t.level),
    relatedConcepts: t.relatedConcepts ?? [],
    category: t.category,
    // Provenance must survive this mapping. These fields are consumed by the
    // staleness check in `scripts/check-staleness.ts`, and silently dropping
    // them here would make every curated entry look unverified.
    verifiedAt: t.verifiedAt,
    timeSensitive: t.timeSensitive,
    sources: t.sources,
    // The legacy topics promised code examples via CODE_INTRO_HOOKS but shipped
    // zero code fences. Only carry a `code` field when real code exists.
    code: undefined,
    codeCaption: undefined,
  })),
  ...FILM_TOPICS,
  ...PORTFOLIO_TOPICS,
];

/**
 * Extra surface forms for topics and concepts that users name differently from
 * their curated titles.
 *
 * Each entry fixes a measured miss, not a guess, and every key must exist as a
 * topic, concept node or dictionary entry — an alias pointing at a missing id
 * is silently dead, which is how the previous list accumulated eleven entries
 * for technical concepts that had been deleted. Keys here are all live
 * Rockstar or portfolio subjects.
 */
const EXTRA_CONCEPT_ALIASES: Record<string, string[]> = {
  'gta-series': ['gta games', 'the gta series', 'grand theft auto games'],
  'red-dead-series': ['red dead games', 'the red dead series', 'rdr series'],
  'gta-v': ['gta 5', 'gta five', 'the newest gta', 'gta5'],
  'gta-iv': ['gta 4', 'gta four', 'gta4'],
  'gta-era-3d': ['3d universe', 'the 3d games', 'gta trilogy'],
  'gta-era-hd': ['hd universe', 'the hd games'],
  'gta-era-2d': ['2d universe', 'the 2d games', 'top down gta'],
  'rage-engine': ['the engine', 'rockstar engine', 'game engine'],
  'open-world-design': ['open worlds', 'world design', 'sandbox design'],
  'rockstar-games': ['the company', 'rockstar studios', 'publisher'],
  'take-two': ['take two interactive', 'the parent company'],
  'hot-coffee': ['the hot coffee mod', 'hot coffee controversy'],
  'gta-v-sales': ['sales records', 'best selling game', 'how many copies', 'how much money', 'revenue'],
  'rockstar-controversies': ['controversy', 'criticism', 'backlash'],
  'euphoria': ['the physics', 'procedural animation', 'naturalmotion'],
  'gta-vi': ['gta 6', 'the new gta', 'next gta', 'gta6'],
  'gta-iii': ['gta3'],
  'gta-2': ['gta2'],
  'gta-1': ['gta1'],
  'red-dead-redemption-2': ['rdr2'],
  'gta-vice-city': ['vicecity'],
  'gta-san-andreas': ['sanandreas'],
  'gta-vi-leak': ['gta 6 leak', 'teapotuberhacker', 'rockstar leak'],
  leonida: ['state of leonida', 'gta vi map', 'vice city 2026'],
  'max-payne-remake': ['max payne remake', 'max payne 1 and 2 remake'],
  'la-noire': ['l a noire', 'cole phelps', 'detective game'],
  'red-dead-redemption': ['john marston', 'rdr 1', 'rdr1'],
  'red-dead-online': ['rdr online', 'red dead multiplayer'],
  'chinatown-wars': ['huang lee', 'ds gta'],
  'gta-trilogy-definitive': ['definitive edition', 'trilogy remaster'],
  'sam-houser': ['rockstar president', 'houser brothers'],
  'dan-houser': ['rockstar writer', 'absurd ventures founder'],
  'leslie-benzies': ['benzies lawsuit', 'rockstar north president'],
  'strauss-zelnick': ['take two ceo', 'zelnick'],
  esrb: ['esrb rating', 'adults only rating'],
  bbfc: ['bbfc rating', 'uk ban'],
  'jack-thompson': ['anti gta lawyer', 'disbarred lawyer'],
  'midnight-club-series': ['racing game', 'street racer'],
};

export const TOPIC_BY_ID = new Map(TOPICS.map(t => [t.id, t]));

export const CONCEPTS: Concept[] = Object.entries(LEGACY_CONCEPTS).map(([id, c]) => ({
  id,
  label: c.label,
  definition: c.definition,
}));
export const CONCEPT_BY_ID = new Map(CONCEPTS.map(c => [c.id, c]));

/**
 * One curated fact the legacy table was missing entirely.
 *
 * The site says "You can visit my [code] or [follow me online] or [hiring me]",
 * but `SITE_KNOWLEDGE_TRIPLES` covered only contact ("how to contact you") and
 * never projects/code, so "does he have any projects?" matched nothing at all.
 * The object below is the site's own sentence, not invented copy.
 */
const ADDITIONAL_FACTS: Fact[] = [
  {
    subject: 'Neal',
    predicate: 'projects_code',
    aliases: [
      'does he have any projects',
      'what projects has he built',
      'show me his projects',
      'show me his work',
      'what has he built',
      'projects',
      'portfolio',
      'code',
      'github',
      'where is his code',
      'what does he work on',
    ],
    object: 'You can browse his code on GitHub at github.com/Neal367, or follow him online.',
    url: '/',
    sourceTitle: 'Home',
    contextSentence: 'You can visit my code or follow me online or hiring me if interested.',
  },
];

/**
 * Extra alias phrases for facts whose curated alias list is too narrow.
 *
 * These are ADDITIONS, not replacements — the curated `SITE_KNOWLEDGE_TRIPLES`
 * stay the source of truth. Each phrase was added because a natural way of
 * asking failed to match any existing alias at all:
 *
 *   "How do I get in touch?"   -> contact_info had only "how to contact you"
 *   "does he have any projects?" -> no alias mentioned projects
 */
const EXTRA_FACT_ALIASES: Record<string, string[]> = {
  contact_info: [
    'get in touch',
    'how do i get in touch',
    'how can i get in touch',
    'how do i reach out',
    'reach out',
    'contact',
    'email address',
    'where can i find him',
    'how do i contact neal',
    // "hire" is the site's own word ("hiring me if interested"), but the
    // curated alias was only "how to hire you", so "How can I hire Neal?" —
    // with the pronoun spelled out — matched no alias at all.
    'how can i hire neal',
    'can i hire neal',
    'how do i hire him',
    'hire',
    'hiring',
    'work with him',
    'available for work',
  ],
  projects_code: [
    'does he have any projects',
    'what projects has he built',
    'show me his projects',
    'what has he built',
    'portfolio',
    'his code',
    'where can i see his code',
    // Curated aliases were all pronoun-phrased, so naming the referent broke
    // the match: the bare "projects" alias is a single content token and is
    // therefore skipped by the fuzzy pass (`aMeaningful.length < 2`), and
    // "Tell me about Neal's projects" then linked no concept either, because
    // `project` is not a knowledge concept. It declined a question the site
    // answers. These spell the referent out so the exact and coverage paths
    // can both reach the row.
    'neal projects',
    'tell me about neal projects',
    'tell me about his projects',
    'what are neal projects',
    'neal project',
    'projects',
    // "Tell me about Neal's work" is one of the four questions the legacy
    // engine answered with HTTP 400, so it is a known-good phrasing that must
    // work. It needs the referent spelled out: with "work" stripped, the query
    // reduces to the bare referent, which by design cannot select a fact row.
    'neal work',
    'tell me about neal work',
    'tell me about his work',
  ],
  all_tools: [
    'what is his stack',
    'what is neals stack',
    'his stack',
    'what tech does he use',
    'what frameworks does neal use',
    'what frameworks does he use',
    'what frameworks do you use',
    'which frameworks does he use',
  ],
  studies_at: [
    'where does he study',
    'what does he study',
    'his education',
    'where did neal study',
    'where did he study',
    'where do you study',
  ],
  // "What does he use for styling?" linked nothing: no topic or concept was
  // named "styling", and the fact alias list said only "styling tools".
  styling_ui: [
    'what does he use for styling',
    'what does neal use for styling',
    'styling',
    'how does he style',
    'what styling does he use',
    'what does he use to style',
    'styling tools',
    'css',
  ],
  // Internship and co-op phrasings. The curated set had only "where was your
  // internship", and matching is done on CONTENT tokens — `where` is a
  // low-information word — so that alias carries a single meaningful token and
  // can never reach the two-token minimum; the obvious question matched no row
  // at all. The second group fixes a different miss: "What did Neal do at TQM?"
  // normalises to `neal tqm`, which did match this row but scored exactly 0.48,
  // the answer threshold, so the clearest way to ask about the co-op declined.
  company_role: [
    'where did neal do his internship',
    'where did he do his internship',
    'where did you do your internship',
    'where was neal internship',
    'neal internship',
    'where did neal intern',
    'where did he intern',
    'what did neal do at tqm',
    'what did he do at tqm',
    'what did you do at tqm',
    'what did neal do at his co-op',
    'what did he do during his co-op',
    'what did neal do on co-op',
    'neal at tqm',
    'his co-op role',
    'what was his co-op',
  ],
  learnings: [
    'mentor',
    'mentorship',
    'did he have a mentor',
    'did neal have a mentor',
    'senior mentorship',
    'was he mentored',
  ],
  community_work: [
    'volunteer',
    'volunteering',
    'mentorship program',
    'neal volunteering',
    'tell me about neal volunteering',
    'tell me about his volunteering',
    'his volunteering',
    'what does neal volunteer for',
    'what volunteering does neal do',
  ],
};

/**
 * Canonicalise pronouns so "your stack", "his stack" and "neal's stack" all
 * resolve to the same alias. Facts are written in the second person ("what is
 * your stack") while users naturally ask in the third person ("what is his
 * stack"), and without this fold that perfectly clear question matched nothing.
 */
function canonicalizeAlias(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2019']/g, '')
    .replace(/\b(?:your|yours|his|her|their|my)\b/g, 'neal')
    .replace(/\b(?:you|he|she|they|i)\b/g, 'neal')
    .replace(/\s+/g, ' ')
    .trim();
}

export const FACTS: Fact[] = (() => {
  const source = [...SITE_KNOWLEDGE_TRIPLES, ...ADDITIONAL_FACTS];
  return source.map(f => {
    const additions = EXTRA_FACT_ALIASES[f.predicate] ?? [];
    const all = [...f.aliases, ...additions];
    // De-duplicate on the canonical form while preserving curated order, so the
    // first (most deliberate) alias wins when two spellings collide.
    const seen = new Set<string>();
    const aliases: string[] = [];
    for (const a of all) {
      const key = canonicalizeAlias(a);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      aliases.push(a);
    }
    return { ...f, aliases };
  });
})();

export const GRAPH_NODES: ConceptNode[] = CONCEPT_NODES;
export const GRAPH_EDGES: ConceptEdge[] = CONCEPT_EDGES;

export const CORPUS: CorpusSection[] = corpusData as CorpusSection[];

// ─── Unified concept index ───────────────────────────────────────────────────

export type ConceptKind = 'topic' | 'concept' | 'node';

export interface ConceptEntry {
  id: string;
  label: string;
  kind: ConceptKind;
  /** Lowercased surface forms that should resolve to this entry. */
  aliases: string[];
  /** Prose used to describe this entry. */
  description: string;
  /** Longer-form prose when the entry is a full topic. */
  detail?: string;
  category: string;
  /** Lowercase tokens of the label, used for token-level matching. */
  labelTokens: string[];
}

/**
 * Build one entry per id. Priority when an id exists in several sources:
 * a full Topic wins (richest prose), then a Concept definition, then a
 * graph Node. Aliases from ALL sources are merged so nothing is lost.
 */
function buildConceptIndex(): Map<string, ConceptEntry> {
  const index = new Map<string, ConceptEntry>();

  const ensure = (id: string): ConceptEntry => {
    let e = index.get(id);
    if (!e) {
      e = {
        id,
        label: id,
        kind: 'node',
        aliases: [],
        description: '',
        category: 'general',
        labelTokens: [],
      };
      index.set(id, e);
    }
    return e;
  };

  const addAliases = (e: ConceptEntry, list: string[]): void => {
    for (const a of list) {
      const low = a.trim().toLowerCase();
      if (low.length >= 2 && !e.aliases.includes(low)) e.aliases.push(low);
    }
  };

  // 1. Graph nodes (lowest priority, but contribute aliases + edges).
  for (const n of GRAPH_NODES) {
    const e = ensure(n.id);
    e.label = n.label;
    e.description = e.description || n.description;
    e.category = n.category;
    addAliases(e, [n.label, ...n.aliases]);
  }

  // 2. Topics (richest content: detail, level, category).
  for (const t of TOPICS) {
    const e = ensure(t.id);
    e.kind = 'topic';
    e.label = t.title;
    e.description = t.summary;
    e.detail = t.detail;
    e.category = t.category;
    // Only the label and curated `phrases` become aliases. `keywords` are
    // deliberately EXCLUDED: they are broad recall terms ("function", "state")
    // and using them as aliases is exactly what produced false concepts.
    addAliases(e, [t.title, ...(t.phrases ?? [])]);
  }

  // 3. Concepts dict (highest priority for IDENTITY).
  //
  // This runs after topics deliberately, and overrides only label/description.
  // A topic title is prose written as a heading ("RAGE and Euphoria"), while the
  // concept dictionary holds the short canonical name for each subject
  // ("Euphoria physics"). Letting the title win meant `euphoria` — whose topic
  // is shared with `rage-engine` — was labelled "RAGE and Euphoria", so
  // comparing the two produced "RAGE and Euphoria versus Euphoria physics".
  // Topics still own detail, level and category.
  for (const c of CONCEPTS) {
    const e = ensure(c.id);
    e.kind = e.kind === 'topic' ? 'topic' : 'concept';
    e.label = c.label;
    e.description = c.definition;
    addAliases(e, [c.label]);
  }

  for (const e of index.values()) {
    const extra = EXTRA_CONCEPT_ALIASES[e.id];
    if (extra) addAliases(e, extra);
    e.labelTokens = e.label.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
    e.aliases.sort((a, b) => b.length - a.length);
  }

  return index;
}

export const CONCEPT_INDEX: Map<string, ConceptEntry> = buildConceptIndex();

/** Trailing words that add no discriminating power to a concept name. */
const GENERIC_SUFFIX = /\s+(?:framework|library|language|management|api|basics|overview|concepts?|features|support|handling|guide|explained)$/i;

/**
 * Bare forms of a label, so a user typing one word finds a multi-word title.
 *
 * Without this, "Angular Framework" was reachable only via the full alias
 * "angular framework", and the bare query "angular" resolved to nothing — the
 * reason "react vs angular" linked only one of its two subjects.
 */
function bareForms(label: string): string[] {
  const out = new Set<string>();
  const low = label.toLowerCase();
  out.add(low);
  const stripped = low.replace(GENERIC_SUFFIX, '').trim();
  if (stripped.length >= 3) out.add(stripped);
  // A label joined by "&" or "and": each side is a usable surface form.
  for (const part of low.split(/\s*(?:&|and)\s*/)) {
    const p = part.trim();
    if (p.length >= 4) out.add(p);
  }
  // Hyphenated ids like `styling-ui` are spoken as "styling ui" / "styling".
  for (const part of low.split(/[-_/]/)) {
    const p = part.trim();
    if (p.length >= 4 && !GENERIC_SUFFIX.test(p)) out.add(p);
  }
  return [...out];
}

/**
 * Every alias across the index, longest first, for maximal-munch matching.
 *
 * The graph nodes need a nuanced rule rather than a blanket exclusion.
 *
 * `CONCEPT_NODES` contains nodes like `interstellar` ("Interstellar & Nolan
 * Cinema") that duplicate a real topic under a second id. Letting those claim
 * the name made one mention of "Interstellar" link BOTH `interstellar` and
 * `film-interstellar`, so "Interstellar vs Arrival" reported three subjects and
 * compared the wrong pair. The first fix was to exclude every node — which was
 * too blunt: it also silenced nodes that own a name nobody else wants, so a
 * legitimate place node like `los-santos` could never be found at all, and
 * "What is Los Santos?" declined despite the location being fully documented.
 *
 * The rule that actually fits: a node may claim a name ONLY when it does not
 * collide with a name a real entry (a topic or a concept) already owns. Nodes
 * still always contribute edges and descriptions; they simply never win a name
 * that a first-class entry has claimed.
 */
export const ALIAS_LOOKUP: Array<{ alias: string; entry: ConceptEntry }> = (() => {
  // A "real" entry is anything with a topic or a dictionary definition behind
  // it — everything except a bare graph node.
  const isReal = (e: ConceptEntry) => e.kind !== 'node';
  const formsOf = (e: ConceptEntry) =>
    new Set<string>([...bareForms(e.label), ...e.aliases.map(a => a.toLowerCase())]);

  const owners = new Map<string, Set<string>>();
  const all = [...CONCEPT_INDEX.values()];
  for (const e of all) {
    for (const f of formsOf(e)) {
      const set = owners.get(f) ?? new Set<string>();
      set.add(e.id);
      owners.set(f, set);
    }
  }

  const out: Array<{ alias: string; entry: ConceptEntry }> = [];
  for (const e of all) {
    const real = isReal(e);
    for (const f of formsOf(e)) {
      if (f.length < 2) continue;
      // A node yields a name only when no other entry claims it.
      if (!real && (owners.get(f)?.size ?? 0) > 1) continue;
      out.push({ alias: f, entry: e });
    }
  }
  // Longest alias first so "grand theft auto: san andreas" beats "san andreas".
  out.sort((a, b) => b.alias.length - a.alias.length);
  return out;
})();

// ─── Graph adjacency (precomputed, replaces per-call edge scans) ─────────────

const ADJACENCY: Map<string, Array<{ id: string; relation: ConceptEdge['relation']; annotation?: string }>> =
  (() => {
    const m = new Map<string, Array<{ id: string; relation: ConceptEdge['relation']; annotation?: string }>>();
    const push = (from: string, to: string, relation: ConceptEdge['relation'], annotation?: string) => {
      const list = m.get(from) ?? [];
      list.push({ id: to, relation, annotation });
      m.set(from, list);
    };
    for (const e of GRAPH_EDGES) {
      push(e.from, e.to, e.relation, e.annotation);
      push(e.to, e.from, e.relation, e.annotation);
    }
    return m;
  })();

export function neighbors(id: string, hops: 1 | 2 = 1): string[] {
  const out = new Set<string>();
  let frontier = [id];
  for (let h = 0; h < hops; h++) {
    const next: string[] = [];
    for (const f of frontier) {
      for (const n of ADJACENCY.get(f) ?? []) {
        if (!out.has(n.id) && n.id !== id) {
          out.add(n.id);
          next.push(n.id);
        }
      }
    }
    frontier = next;
  }
  return [...out];
}

/** The curated annotation explaining how two concepts relate, if any. */
export function relationBetween(a: string, b: string): string | null {
  for (const n of ADJACENCY.get(a) ?? []) {
    if (n.id === b) return n.annotation ?? null;
  }
  return null;
}

/** Human-readable label for any entry id (never leaks a raw id). */
export function labelFor(id: string): string {
  return CONCEPT_INDEX.get(id)?.label ?? id.replace(/-/g, ' ');
}

// ─── Document index (everything BM25 and the semantic lane search over) ──────

export type DocKind = 'corpus' | 'topic' | 'concept' | 'fact';

export interface IndexedDoc {
  id: string;
  kind: DocKind;
  title: string;
  heading: string;
  url: string;
  /** Searchable body text. */
  text: string;
  /** Name of the field this doc's title came from, for weighted scoring. */
  concepts: string[];
}

/**
 * Which curated concepts a corpus section documents.
 *
 * WHY THIS IS COMPUTED RATHER THAN A HAND-WRITTEN TABLE
 * ----------------------------------------------------
 * The previous version of this file carried `CORPUS_CONCEPT_MAP`, a literal
 * `page#heading-slug -> conceptId` table. It was written for a curriculum that
 * no longer exists: after the domain swap, every one of its 24 entries pointed
 * at a deleted concept, so every corpus section silently lost its concept link.
 *
 * That is not cosmetic. `scoreConfidence` in `retrieval/index.ts` caps a
 * candidate at 0.48 — below the answer threshold — when it carries no concept,
 * so whole pages of real site prose became unanswerable: "What did Neal do at
 * TQM?" declined even though the co-op article was indexed and retrieved.
 *
 * Deriving the link from the live concept index means it cannot go stale: if a
 * concept is renamed or removed, its corpus links move with it.
 *
 * The match is deliberately conservative. Heading matches count for more than
 * body matches, a multi-word phrase counts for more than a loose token, and a
 * minimum score is required — otherwise one passing mention deep in an article
 * would make that article evidence for an unrelated subject.
 */
const CORPUS_STOP = new Set([
  'and', 'the', 'my', 'overview', 'internship', 'study', 'studies', 'author',
  'developer', 'creator', 'essay', 'personal', 'series', 'games',
]);

function conceptsForCorpusSection(s: CorpusSection): string[] {
  const heading = s.heading.toLowerCase();
  const opening = s.text.slice(0, 240).toLowerCase();
  const headingTokens = new Set(heading.split(/[^a-z0-9]+/).filter(Boolean));
  const openingTokens = new Set(opening.split(/[^a-z0-9]+/).filter(Boolean));

  // Graph nodes that duplicate a real topic are excluded (the same rule
  // ALIAS_LOOKUP applies). A node is NOT automatically unusable, though: every
  // portfolio concept — `neal`, `tqm`, `sripatum`, `vibe-coding` — is a node,
  // and skipping all nodes by `kind` was why "What did Neal do at TQM?" stayed
  // unanswerable even after this scorer existed.
  const duplicatedByTopic = new Set([...TOPIC_BY_ID.keys(), ...CONCEPT_BY_ID.keys()]);

  const scored: Array<{ id: string; score: number }> = [];

  for (const e of CONCEPT_INDEX.values()) {
    if (e.kind === 'node' && duplicatedByTopic.has(e.id)) continue;
    let score = 0;

    for (const form of [e.label.toLowerCase(), ...e.aliases]) {
      if (form.length < 4) continue;
      const words = form.split(/[^a-z0-9]+/).filter(Boolean);
      if (words.length === 0) continue;

      // A whole phrase present in the heading is the strongest signal: the
      // author named the subject in the section title.
      if (heading.includes(form)) score = Math.max(score, 2 + words.length * 0.5);

      // A single distinctive word in the heading ("TQM", "Autonomy") is still a
      // real signal, but a word as common as "code" is not worth linking on.
      if (words.length === 1 && !CORPUS_STOP.has(words[0]) && headingTokens.has(words[0])) {
        score = Math.max(score, 1.5);
      }

      // Opening-sentence matches count for less, and only for multi-word forms.
      if (words.length > 1 && opening.includes(form)) score = Math.max(score, 1.2);
      if (words.length === 1 && !CORPUS_STOP.has(words[0]) && openingTokens.has(words[0])) {
        score = Math.max(score, 0.8);
      }
    }

    if (score > 0) scored.push({ id: e.id, score });
  }

  scored.sort((a, b) => b.score - a.score);
  // Require real evidence. A heading token (1.5) or phrase (2.0) qualifies; a
  // lone token in the opening sentence (0.8) does not.
  return scored.filter(x => x.score >= 1.5).slice(0, 2).map(x => x.id);
}

export const DOCS: IndexedDoc[] = (() => {
  const docs: IndexedDoc[] = [];
  for (const s of CORPUS) {
    docs.push({
      id: `corpus:${s.id}`,
      kind: 'corpus',
      title: s.pageTitle,
      heading: s.heading,
      url: s.url,
      text: s.text,
      concepts: conceptsForCorpusSection(s),
    });
  }

  for (const t of TOPICS) {
    docs.push({
      id: `topic:${t.id}`,
      kind: 'topic',
      title: t.title,
      heading: t.title,
      url: '/',
      // Summary first: it is the densest description of the concept.
      text: `${t.summary}\n\n${t.detail}`,
      concepts: [t.id, ...t.relatedConcepts],
    });
  }

  for (const c of CONCEPTS) {
    docs.push({
      id: `concept:${c.id}`,
      kind: 'concept',
      title: c.label,
      heading: c.label,
      url: '/',
      text: c.definition,
      concepts: [c.id],
    });
  }

  // Every concept that has a topic but no dictionary entry still needs a
  // searchable record, otherwise a concept can be linked and yet have nothing
  // to retrieve. This is how `ssr`/`ssg` previously linked successfully and
  // then produced an empty answer.
  const covered = new Set(CONCEPTS.map(c => c.id));
  for (const t of TOPICS) {
    if (covered.has(t.id)) continue;
    docs.push({
      id: `concept:${t.id}`,
      kind: 'concept',
      title: t.title,
      heading: t.title,
      url: '/',
      text: `${t.summary}\n\n${t.detail}`,
      concepts: [t.id],
    });
  }

  for (const f of FACTS) {
    docs.push({
      id: `fact:${f.predicate}`,
      kind: 'fact',
      title: f.subject,
      heading: f.subject,
      url: f.url,
      text: `${f.object}\n\n${f.contextSentence}`,
      concepts: [],
    });
  }

  return docs;
})();

// ─── Fail loudly on a broken corpus, in development only ─────────────────────

if (process.env.NODE_ENV !== 'production') {
  const problems: string[] = [];
  if (DOCS.length === 0) problems.push('no documents indexed');
  if (CORPUS.length === 0) problems.push('corpus.json is empty — run `bun run build:corpus`');
  // Only corpus prose is checked: topic/concept `detail` legitimately contains
  // code, and topic `code` is real fenced samples by design.
  for (const s of CORPUS) {
    if (/className=|viewTransition|<\/?[A-Za-z]/.test(s.text)) {
      problems.push(`markup residue in corpus:${s.id}`);
    }
  }
  if (problems.length > 0) {
    console.error('[nara/knowledge] index integrity problems:\n  - ' + problems.join('\n  - '));
  }
}
