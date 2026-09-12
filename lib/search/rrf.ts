import type { RetrievalHit } from '@/lib/chat/types';

/**
 * Standard Reciprocal Rank Fusion (RRF)
 * Industry-standard algorithm used in Elasticsearch, Pinecone, and Weaviate
 * to merge ranked lists from heterogeneous retrieval lanes (lexical, dense vector, knowledge graph)
 * without needing fragile score normalization constants.
 *
 * Formula: RRF(d) = sum_{lane} ( weight_{lane} / (k + rank_{lane}(d)) )
 * Default k = 60 (standard TREC / information retrieval parameter)
 */
export interface RankedLane {
  name: string;
  weight: number;
  hits: RetrievalHit[];
}

export function reciprocalRankFusion(
  lanes: RankedLane[],
  k: number = 60
): RetrievalHit[] {
  const scoreMap = new Map<string, { hit: RetrievalHit; rrfScore: number }>();

  for (const lane of lanes) {
    lane.hits.forEach((hit, idx) => {
      const rank = idx + 1; // 1-based rank
      const contribution = lane.weight / (k + rank);

      const existing = scoreMap.get(hit.id);
      if (existing) {
        existing.rrfScore += contribution;
        // Retain the hit with the most complete context sentence
        if ((hit.contextSentence?.length || 0) > (existing.hit.contextSentence?.length || 0)) {
          existing.hit = { ...existing.hit, contextSentence: hit.contextSentence };
        }
      } else {
        scoreMap.set(hit.id, {
          hit: { ...hit },
          rrfScore: contribution,
        });
      }
    });
  }

  // Sort descending by calculated RRF score
  const sorted = Array.from(scoreMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .map(entry => ({
      ...entry.hit,
      score: entry.rrfScore,
    }));

  return sorted;
}
