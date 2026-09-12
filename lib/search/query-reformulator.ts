/**
 * Query Reformulator & Normalizer
 * Cleans conversational fluff, expands domain synonyms, and preserves technical compounds
 * to optimize search effectiveness across lexical (BM25F) and vector (Dense) retrieval lanes.
 * Also owns concept-graph recall expansion so all term expansion lives in one module.
 */
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';

// Explicit on-demand web requests ("search the web for X", "google it").
// Anchored so plain questions ("search for good patterns") stay local.
// Declared before CONVERSATIONAL_BOILERPLATE (TDZ: the array references it).
const WEB_REQUEST_PATTERN =
  /^(?:(?:can you|could you|please)\s+)?(search the web( for)?|search online( for)?|look \S+ up( online)?|google( it)?|search google( for)?|check online( for)?|browse the web( for)?)\b[:\s]*/i;

/** True when the user explicitly asks for a live web lookup. */
export function isExplicitWebRequest(cleanedMessage: string): boolean {
  return WEB_REQUEST_PATTERN.test(cleanedMessage.trim());
}

const CONVERSATIONAL_BOILERPLATE = [
  /^(can you\s+)?(please\s+)?(tell me about|explain to me|explain|what is the meaning of|what is|what are|how do you|how does|how to|i want to know about|do you know about|what do you know about)\s+/i,
  /^(?:no,?\s+)?(?:i mean|i meant|i am talking about|i'm talking about|meaning|referring to)\s+/i,
  /\b(please|thanks|thank you|could you|would you)\b/gi,
  // Explicit web-request wrappers strip for every lane, not just web.
  WEB_REQUEST_PATTERN,
];

const CLARIFICATION_PATTERN =
  /^(?:no,?\s+)?(?:i mean|i meant|i am talking about|i'm talking about|meaning|referring to)\s+(.+)$/i;

// Filler words that pollute re-anchored queries ("when gta6 release date gonna release").
const FILLER_WORDS = new Set([
  'gonna', 'wanna', 'please', 'pls', 'just', 'really', 'actually', 'basically', 'well', 'um', 'uh',
]);

// Leading interrogatives/auxiliaries stripped only for the web-search variant.
const LEADING_QUESTION_WORDS = new Set([
  'who', 'what', 'when', 'where', 'why', 'how', 'which',
  'is', 'are', 'was', 'were', 'will', 'would', 'can', 'could', 'do', 'does', 'did',
]);

// Trailing interrogatives/fillers poison keyword backends just as badly
// ("gta6 release date when" → wrong Wiki top hit).
const TRAILING_QUESTION_WORDS = new Set([
  ...LEADING_QUESTION_WORDS,
  'please', 'thanks', 'thankyou', 'now', 'today', 'yet', 'already',
]);

/** Drop fillers + duplicate tokens (keep first order). Repairs re-anchored queries. */
function tidyTokens(cleaned: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tok of cleaned.split(/\s+/)) {
    const low = tok.toLowerCase();
    if (!low || FILLER_WORDS.has(low) || seen.has(low)) continue;
    seen.add(low);
    out.push(tok);
  }
  return out.join(' ');
}

/** Sharp keyword query for the live-web lane ("when gta6 release date" → "gta6 release date"). */
export function toWebQuery(cleaned: string): string {
  const toks = cleaned.split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < toks.length - 1 && LEADING_QUESTION_WORDS.has(toks[i].toLowerCase())) i++;
  let j = toks.length;
  while (j > i + 1 && TRAILING_QUESTION_WORDS.has(toks[j - 1].toLowerCase())) j--;
  const sharp = toks.slice(i, j).join(' ').trim();
  return sharp || cleaned;
}

const DOMAIN_SYNONYMS: Record<string, string[]> = {
  internship: ['co-op', 'tqm', 'work experience', 'developer'],
  school: ['university', 'sripatum', 'education', 'study'],
  college: ['university', 'sripatum', 'education'],
  job: ['work', 'experience', 'career', 'developer', 'tqm'],
  skills: ['stack', 'technologies', 'typescript', 'react', 'nextjs'],
  projects: ['portfolio', 'work', 'built', 'showcase'],
  vibe: ['vibe coding', 'essay', 'philosophy'],
};

export interface ReformulatedQuery {
  raw: string;
  cleaned: string;
  bm25Tokens: string[];
  expandedTerms: string[];
  /** De-fluffed keyword variant for the live-web lane; retry when `cleaned` finds nothing. */
  webQuery: string;
}

export function reformulateQuery(
  rawQuery: string,
  contextSubject?: string,
  previousQuestion?: string
): ReformulatedQuery {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { raw: '', cleaned: '', bm25Tokens: [], expandedTerms: [], webQuery: '' };
  }

  let cleaned = trimmed;

  // Clarification / topic correction resolution (e.g. "I mean gta6", "no, i mean typescript")
  const clarMatch = trimmed.match(CLARIFICATION_PATTERN);
  if (clarMatch) {
    const specifiedTopic = clarMatch[1].trim();
    if (previousQuestion && /\b(who|what|when|where|why|how|which|release date|runtime)\b/i.test(previousQuestion)) {
      // Re-anchor the previous question with the clarified topic
      cleaned = previousQuestion.replace(/\b(it|this|that|the film|the movie|the game|the topic)\b/gi, specifiedTopic);
      if (cleaned === previousQuestion) {
        cleaned = `${previousQuestion} ${specifiedTopic}`;
      }
    } else {
      cleaned = specifiedTopic;
    }
  }

  // Anaphora & follow-up resolution: if previous topic exists and query contains reference pronouns
  if (contextSubject && contextSubject.trim()) {
    const cleanSubject = contextSubject.split(/[:(]/)[0].trim();
    // Do not substitute if contextSubject is generic placeholder
    if (!/^(web overview|overview|introduction)$/i.test(cleanSubject)) {
      if (/\b(it|this|that|the film|the movie|the director|the author|the concept|he|she|they)\b/i.test(cleaned)) {
        cleaned = cleaned.replace(/\b(it|this|that|the film|the movie|the concept)\b/gi, cleanSubject);
        cleaned = cleaned.replace(/\b(the director|he|she)\b/gi, cleanSubject);
      }
    }
  }

  for (const pattern of CONVERSATIONAL_BOILERPLATE) {
    cleaned = cleaned.replace(pattern, ' ').trim();
  }

  // Normalize punctuation and whitespace
  cleaned = cleaned.replace(/[?.,!/\\()\-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    cleaned = trimmed; // Keep original if stripped to empty
  }

  // Tidy re-anchored queries: drop fillers ("gonna") and duplicate tokens
  // ("when gta6 release date gonna release" → "when gta6 release date")
  cleaned = tidyTokens(cleaned) || cleaned;

  // Generate tokens
  const baseTokens = cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length >= 2);

  // Expand domain synonyms
  const expandedSet = new Set<string>();
  for (const token of baseTokens) {
    const synonyms = DOMAIN_SYNONYMS[token];
    if (synonyms) {
      synonyms.forEach(s => expandedSet.add(s));
    }
  }

  const allTokens = Array.from(new Set([...baseTokens, ...Array.from(expandedSet)]));

  return {
    raw: trimmed,
    cleaned,
    bm25Tokens: allTokens,
    expandedTerms: Array.from(expandedSet),
    webQuery: toWebQuery(cleaned),
  };
}

const GRAPH_EXPANSION_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'how', 'why',
  'its', 'into', 'using', 'used', 'via', 'per', 'are', 'was', 'you', 'your',
]);

/**
 * Deterministic vocabulary-gap expansion (HyDE-lite without an LLM).
 * Adds concept-graph aliases + 1-hop neighbor labels for detected concepts
 * to BM25 *recall* terms only — precision anchors stay exact so expansion
 * can never drown the user's own words. Capped at 8 terms.
 */
export function expandWithConceptGraph(conceptIds: string[], baseTokens: string[]): string[] {
  const base = new Set(baseTokens.map(t => t.toLowerCase()));
  const extra: string[] = [];
  const seen = new Set<string>();
  const uniqueIds = Array.from(new Set(conceptIds.filter(Boolean))).slice(0, 2);

  for (const id of uniqueIds) {
    const node = conceptGraph.getNode(id);
    if (!node) continue;
    const candidates = [
      ...node.aliases,
      ...conceptGraph.getNeighbors(id, 1).map(n => n.label),
    ];
    for (const c of candidates) {
      for (const w of c.toLowerCase().split(/[^a-z0-9]+/)) {
        if (w.length < 3 || base.has(w) || seen.has(w) || GRAPH_EXPANSION_STOPWORDS.has(w)) continue;
        seen.add(w);
        extra.push(w);
        if (extra.length >= 8) return extra;
      }
    }
  }
  return extra;
}
