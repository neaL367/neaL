import type { KnowledgeTriple } from '@/lib/chat/types';
import { SITE_KNOWLEDGE_TRIPLES } from './knowledge-graph-data';

export { SITE_KNOWLEDGE_TRIPLES } from './knowledge-graph-data';

const STOP_WORDS = new Set([
  'what', 'where', 'when', 'who', 'how', 'why', 'which',
  'is', 'are', 'was', 'were', 'did', 'does', 'do', 'doing', 'done',
  'the', 'a', 'an', 'at', 'in', 'on', 'of', 'to', 'for', 'with', 'from', 'by',
  'and', 'or', 'it', 'its',
  'about', 'tell', 'me', 'you', 'your', 'his', 'he', 'i', 'my', 'we', 'our',
  'can', 'could', 'would', 'should', 'have', 'has', 'had', 'be', 'been', 'being'
]);

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/next\.js/g, 'nextjs')
    .replace(/node\.js/g, 'nodejs')
    .replace(/react\.js/g, 'reactjs')
    .replace(/['’`]/g, '')
    .replace(/[?.,!/\\()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface PreprocessedAlias {
  triple: KnowledgeTriple;
  normalizedAlias: string;
  tokens: Set<string>;
}

// 1. Exact alias O(1) map
const EXACT_ALIAS_MAP = new Map<string, KnowledgeTriple>();

// 2. Preprocessed alias list for substring and token-overlap scoring
const PREPROCESSED_ALIASES: PreprocessedAlias[] = [];

for (const triple of SITE_KNOWLEDGE_TRIPLES) {
  for (const rawAlias of triple.aliases) {
    const norm = normalizeText(rawAlias);
    if (norm) {
      if (!EXACT_ALIAS_MAP.has(norm)) {
        EXACT_ALIAS_MAP.set(norm, triple);
      }
      const tokenList = norm.split(/\s+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));
      PREPROCESSED_ALIASES.push({
        triple,
        normalizedAlias: norm,
        tokens: new Set(tokenList),
      });
    }
  }
}

/**
 * Fast exact or high-confidence match against knowledge graph triples with O(1) indexed lookup.
 */
export function queryKnowledgeGraph(
  normalizedQuery: string
): KnowledgeTriple | null {
  const q = normalizeText(normalizedQuery);
  if (!q) return null;

  // 1. Instant O(1) exact alias match
  const exact = EXACT_ALIAS_MAP.get(q);
  if (exact) return exact;

  // 2. Substring or phrase containment match
  for (const item of PREPROCESSED_ALIASES) {
    const a = item.normalizedAlias;
    if (
      (a.length >= 4 && q.length >= 4 && q.includes(a)) ||
      (q.length >= 3 && a.length >= 8 && a.includes(q))
    ) {
      return item.triple;
    }
  }

  // 3. Token-overlap / Keyword Jaccard matching for natural phrasing
  const qTokenList = q.split(/\s+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));
  const qTokenSet = new Set(qTokenList);

  if (qTokenSet.size > 0) {
    let bestTriple: KnowledgeTriple | null = null;
    let highestMatchRatio = 0;
    let highestMatchCount = 0;

    for (const item of PREPROCESSED_ALIASES) {
      const aTokenSet = item.tokens;
      if (aTokenSet.size === 0) continue;

      let matchCount = 0;
      for (const token of aTokenSet) {
        if (Array.from(qTokenSet).some(qt => qt === token || (qt.length >= 4 && token.length >= 4 && (qt.includes(token) || token.includes(qt))))) {
          matchCount++;
        }
      }

      const ratio = matchCount / aTokenSet.size;
      // Avoid single generic words matching long queries
      if (aTokenSet.size === 1 && qTokenSet.size > 3 && ratio < 1.0) continue;

      // Ratio first, then absolute evidence: 2-token overlap beats 1-token
      // ("co-op" query → company_role over name_identity on ratio ties).
      if (
        ratio >= 0.6 &&
        (ratio > highestMatchRatio ||
          (ratio === highestMatchRatio && matchCount > highestMatchCount))
      ) {
        highestMatchRatio = ratio;
        highestMatchCount = matchCount;
        bestTriple = item.triple;
      }
    }

    if (bestTriple) {
      return bestTriple;
    }
  }

  return null;
}
