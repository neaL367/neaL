/**
 * Query Reformulator & Normalizer
 * Cleans conversational fluff, expands domain synonyms, and preserves technical compounds
 * to optimize search effectiveness across lexical (BM25F) and vector (Dense) retrieval lanes.
 * Also owns concept-graph recall expansion so all term expansion lives in one module.
 */
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';

const CONVERSATIONAL_BOILERPLATE = [
  /^(can you\s+)?(please\s+)?(tell me about|explain to me|explain|what is the meaning of|what is|what are|how do you|how does|how to|i want to know about|do you know about|what do you know about)\s+/i,
  /^(?:no,?\s+)?(?:i mean|i meant|i am talking about|i'm talking about|meaning|referring to)\s+/i,
  /\b(please|thanks|thank you|could you|would you)\b/gi,
];

const CLARIFICATION_PATTERN =
  /^(?:no,?\s+)?(?:i mean|i meant|i am talking about|i'm talking about|meaning|referring to)\s+(.+)$/i;

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
}

export function reformulateQuery(
  rawQuery: string,
  contextSubject?: string,
  previousQuestion?: string
): ReformulatedQuery {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { raw: '', cleaned: '', bm25Tokens: [], expandedTerms: [] };
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
