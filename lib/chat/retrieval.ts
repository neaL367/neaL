import type { RetrievalHit, IntentType } from '@/lib/chat/types';
import { queryKnowledgeGraph } from '@/lib/search/knowledge-graph';
import { BM25FEngine } from '@/lib/search/bm25f';
import { SITE_SECTIONS } from '@/lib/search/site-index-data';
import { semanticIndex } from '@/lib/search/semantic-index';
import { fetchWebAnswer, formatSearchTitle } from '@/lib/search/web-search';
import { TOPICS, CONCEPTS } from '@/lib/chat/knowledge/topics';
import { reciprocalRankFusion, type RankedLane } from '@/lib/search/rrf';
import { reformulateQuery, expandWithConceptGraph } from '@/lib/search/query-reformulator';

// Singleton BM25F instance over site sections
const bm25Engine = new BM25FEngine(SITE_SECTIONS);

// Per-lane candidate depth for fusion. Research (TREC RRF practice) fuses
// deep lists then slices — truncating each lane to the final limit before
// fusion starves RRF of cross-lane overlap and hurts recall.
const CANDIDATE_DEPTH = 10;

export interface RetrievalContext {
  intent?: IntentType;
  conceptId?: string;
  detectedConcepts?: string[];
  webSearch?: boolean;
  activeTopic?: string;
  previousQuery?: string;
}

export interface UnifiedRetrievalResult {
  hits: RetrievalHit[];
  bestHit: RetrievalHit | null;
  usedFallback: boolean;
}

export async function orchestrateRetrieval(
  query: string,
  limit: number = 3,
  context?: RetrievalContext
): Promise<UnifiedRetrievalResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { hits: [], bestHit: null, usedFallback: false };
  }

  // 1. Reformulate query: clean fluff, normalize whitespace, expand synonyms, resolve context pronouns & clarifications
  const reformulated = reformulateQuery(
    cleanQuery,
    context?.activeTopic || context?.conceptId,
    context?.previousQuery
  );

  // 2. Dispatch local lanes concurrently (deep candidate lists for fusion;
  // final limit applied AFTER RRF so cross-lane overlap can surface)
  const detectedForExpansion = [
    ...(context?.conceptId ? [context.conceptId] : []),
    ...(context?.detectedConcepts || []),
  ];
  const graphTerms = expandWithConceptGraph(detectedForExpansion, reformulated.bm25Tokens);
  const bm25SearchTerms = [...reformulated.bm25Tokens, ...graphTerms];

  const [kgHit, bm25Results, semanticHits] = await Promise.all([
    Promise.resolve(queryKnowledgeGraph(cleanQuery)),
    Promise.resolve(
      bm25Engine.search(
        bm25SearchTerms,
        reformulated.bm25Tokens,
        reformulated.cleaned
      )
    ),
    semanticIndex.search(reformulated.cleaned, CANDIDATE_DEPTH),
  ]);

  const rankedLanes: RankedLane[] = [];

  // Lane 0: Local Technical Topics & Concepts (Weight: 2.5)
  const targetConceptId =
    context?.conceptId || (context?.detectedConcepts && context.detectedConcepts[0]);
  const topicHits: RetrievalHit[] = [];

  if (targetConceptId) {
    const topic = TOPICS.find(t => t.id === targetConceptId);
    const conceptDef = CONCEPTS[targetConceptId];

    if (topic) {
      topicHits.push({
        id: `topic:${topic.id}`,
        title: topic.title,
        heading: topic.title,
        excerpt: topic.summary,
        url: '/',
        score: 1.0,
        lane: 'topic',
        contextSentence: topic.detail,
      });
    } else if (conceptDef) {
      topicHits.push({
        id: `concept:${targetConceptId}`,
        title: conceptDef.label,
        heading: conceptDef.label,
        excerpt: conceptDef.definition,
        url: '/',
        score: 1.0,
        lane: 'topic',
        contextSentence: conceptDef.definition,
      });
    }
  }

  if (topicHits.length > 0) {
    rankedLanes.push({
      name: 'topics',
      weight: 4.0,
      hits: topicHits,
    });
  }

  // Lane 1: Knowledge Graph (Weight: 3.0)
  if (kgHit) {
    rankedLanes.push({
      name: 'kg',
      weight: 3.0,
      hits: [
        {
          id: `kg:${kgHit.subject}`,
          title: kgHit.sourceTitle,
          heading: kgHit.subject,
          excerpt: kgHit.object,
          url: kgHit.url,
          score: 1.0,
          lane: 'kg',
          contextSentence: kgHit.contextSentence,
        },
      ],
    });
  }

  // Lane 2: Semantic Index (Vector cosine similarity, Weight: 1.5)
  if (semanticHits.length > 0) {
    rankedLanes.push({
      name: 'semantic',
      weight: 1.5,
      hits: semanticHits,
    });
  }

  // Lane 3: BM25F Lexical (Weight: 1.0) — deep list into fusion, slice after
  if (bm25Results.length > 0) {
    const bm25Hits: RetrievalHit[] = bm25Results.slice(0, CANDIDATE_DEPTH).map(match => ({
      id: match.section.id,
      title: match.section.pageTitle,
      heading: match.section.heading,
      excerpt: match.section.text.slice(0, 220),
      url: match.section.url,
      score: match.totalScore,
      lane: 'bm25',
      contextSentence: match.section.text,
    }));

    rankedLanes.push({
      name: 'bm25',
      weight: 1.0,
      hits: bm25Hits,
    });
  }

  // 3. Reciprocal Rank Fusion (k=60)
  const fusedHits = reciprocalRankFusion(rankedLanes, 60);
  const bestHit = fusedHits.length > 0 ? fusedHits[0] : null;

  const hasStrongLocalConcept = topicHits.length > 0;
  const hasStrongKg = kgHit !== null;
  const hasStrongBm25 = bm25Results.length > 0 && bm25Results[0].totalScore >= 3.0;
  const topSemanticRawScore = semanticHits.length > 0 ? semanticHits[0].score : 0;
  const hasStrongSemantic = topSemanticRawScore >= 0.52;

  const isLocalConfidenceHigh =
    hasStrongLocalConcept ||
    hasStrongKg ||
    (hasStrongBm25 && topSemanticRawScore >= 0.3) ||
    hasStrongSemantic;

  // 4. Web Search: explicit opt-in only (UI toggle or "search the web" /
  // "google it" phrasing, detected in route.ts). No implicit fallback.
  const shouldSearchWeb = context?.webSearch === true;

  if (shouldSearchWeb) {
    // Sharp keyword variant first: leading interrogatives poison keyword
    // backends ("when Grand Theft Auto VI release" → wrong Wiki top hit),
    // then the full cleaned query as backup.
    const webQueries = Array.from(
      new Set([reformulated.webQuery, reformulated.cleaned].map(q => (q || '').trim()).filter(Boolean))
    ).slice(0, 2);
    for (const webQuery of webQueries) {
    try {
      const web = await fetchWebAnswer(webQuery);
      if (web && web.found && web.answer) {
        const cleanTopic =
          web.sourceTitle
            .replace(/\s*[-–—|]\s*(?:Wikipedia|Britannica|YouTube|Official).*$/i, '')
            .replace(/\s*\(.*?\)$/i, '')
            .trim() || formatSearchTitle(webQuery);

        const webHit: RetrievalHit = {
          id: `web:${webQuery.slice(0, 30)}`,
          title: cleanTopic,
          heading: cleanTopic,
          excerpt: web.answer,
          url: web.sourceUrl,
          score: 1.0,
          lane: 'web',
          contextSentence: web.answer,
        };

        const extraHits: RetrievalHit[] = (web.sources || []).map((s, idx) => ({
          id: `web:src:${idx}:${s.domain}`,
          title: s.title,
          heading: s.domain,
          excerpt: s.snippet,
          url: s.url,
          score: 0.95 - idx * 0.05,
          lane: 'web',
          contextSentence: s.snippet,
        }));

        return {
          hits: [webHit, ...extraHits],
          bestHit: webHit,
          usedFallback: true,
        };
      }
    } catch {
      // Try next query variant; ignore web search errors, continue with local hits
    }
    }
  }

  // 5. Expose bestHit ONLY when local confidence is genuinely verified
  // This completely stops low-similarity false positives from masquerading as factual answers
  const finalBestHit = isLocalConfidenceHigh ? bestHit : null;

  return {
    hits: fusedHits.slice(0, limit),
    bestHit: finalBestHit,
    usedFallback: false,
  };
}
