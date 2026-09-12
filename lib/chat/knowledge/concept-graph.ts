import type { ConceptNode, ConceptEdge } from '@/lib/chat/types';
import { CONCEPT_NODES, CONCEPT_EDGES } from './concept-graph-data';
import { TOPICS } from './topics';

export { CONCEPT_NODES, CONCEPT_EDGES } from './concept-graph-data';

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export class ConceptGraph {
  private nodes: Map<string, ConceptNode> = new Map();
  private edges: ConceptEdge[] = [];

  constructor() {
    for (const node of CONCEPT_NODES) {
      this.nodes.set(node.id, node);
    }
    // Auto-index all DetailedTopics into graph nodes for complete alignment
    for (const topic of TOPICS) {
      if (!this.nodes.has(topic.id)) {
        this.nodes.set(topic.id, {
          id: topic.id,
          label: topic.title,
          aliases: topic.keywords,
          description: topic.summary,
          category: topic.category === 'javascript' || topic.category === 'typescript' ? 'languages' : 'frameworks',
        });
      }
    }
    this.edges = CONCEPT_EDGES;
  }

  getNode(id: string): ConceptNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Specificity-ranked concept matching.
   * Prevents broad category nodes (e.g. "javascript", "react") from greedily
   * intercepting queries that ask about specific concepts ("event loop in javascript", "closures in js").
   */
  findConcept(query: string): ConceptNode | null {
    const all = this.findAllConcepts(query);
    return all.length > 0 ? all[0] : null;
  }

  findAllConcepts(query: string): ConceptNode[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const broadCategoryIds = new Set(['javascript', 'typescript', 'react', 'css', 'web', 'tools', 'languages', 'frameworks']);
    const matches: Array<{ node: ConceptNode; score: number; matchLength: number }> = [];

    for (const node of this.nodes.values()) {
      const nodeLabelLower = node.label.toLowerCase();
      const nodeIdLower = node.id.toLowerCase();
      let bestMatchLength = 0;
      let baseScore = 0;

      // 1. Exact query match
      if (nodeIdLower === q || nodeLabelLower === q) {
        bestMatchLength = Math.max(nodeIdLower.length, nodeLabelLower.length);
        baseScore = 100;
      } else if (node.aliases.some(a => a.toLowerCase() === q)) {
        bestMatchLength = q.length;
        baseScore = 90;
      } else {
        // 2. Word-boundary or phrase matches in query
        const candidates = [nodeLabelLower, ...node.aliases.map(a => a.toLowerCase())];
        for (const cand of candidates) {
          if (cand.length < 2) continue;

          // Safe regex for word boundary check
          const escaped = cand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, 'i');

          if (regex.test(q)) {
            if (cand.length > bestMatchLength) {
              bestMatchLength = cand.length;
              baseScore = 50 + cand.length;
            }
          }
        }

        // 3. Typo-tolerance via Levenshtein edit distance for tokens >= 4 chars
        const ignoreTokens = new Set(['the', 'and', 'for', 'with', 'about', 'tell', 'you', 'your', 'are', 'was', 'this', 'that', 'from', 'what', 'how', 'why', 'who', 'movie', 'film']);
        if (baseScore === 0 && q.length >= 4) {
          const qWords = q.split(/\s+/).filter(w => !ignoreTokens.has(w));
          for (const cand of candidates) {
            if (cand.length < 4 || ignoreTokens.has(cand)) continue;
            // Check single word match or bigram match
            for (let w = 0; w < qWords.length; w++) {
              const word = qWords[w];
              if (word.length >= 4 && Math.abs(word.length - cand.length) <= 2) {
                const dist = levenshteinDistance(word, cand);
                const maxAllowedDist = cand.length >= 7 ? 2 : 1;
                if (dist <= maxAllowedDist) {
                  if (cand.length > bestMatchLength) {
                    bestMatchLength = cand.length;
                    baseScore = 40 + cand.length - dist * 5;
                  }
                }
              }
              // Check bigram if cand has space
              if (cand.includes(' ') && w < qWords.length - 1) {
                const bigram = `${qWords[w]} ${qWords[w + 1]}`;
                if (Math.abs(bigram.length - cand.length) <= 3) {
                  const dist = levenshteinDistance(bigram, cand);
                  if (dist <= 2) {
                    if (cand.length > bestMatchLength) {
                      bestMatchLength = cand.length;
                      baseScore = 45 + cand.length - dist * 5;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (baseScore > 0) {
        // Specificity multiplier: specific leaf concepts receive higher priority
        // than broad category umbrellas (e.g. "event-loop" > "javascript", "rsc" > "react")
        const isBroad = broadCategoryIds.has(node.id);
        const specificityMultiplier = isBroad ? 0.7 : 1.5;
        const totalScore = (baseScore + bestMatchLength * 2) * specificityMultiplier;

        matches.push({
          node,
          score: totalScore,
          matchLength: bestMatchLength,
        });
      }
    }

    // Sort descending by total score, then by match length
    matches.sort((a, b) => b.score - a.score || b.matchLength - a.matchLength);
    return matches.map(m => m.node);
  }

  getNeighbors(conceptId: string, hops: 1 | 2 = 1): ConceptNode[] {
    const directNeighborIds = new Set<string>();

    for (const edge of this.edges) {
      if (edge.from === conceptId) directNeighborIds.add(edge.to);
      if (edge.to === conceptId) directNeighborIds.add(edge.from);
    }

    if (hops === 1) {
      return Array.from(directNeighborIds)
        .map(id => this.nodes.get(id))
        .filter((n): n is ConceptNode => n !== undefined);
    }

    // 2 hops
    const twoHopIds = new Set<string>(directNeighborIds);
    for (const neighborId of directNeighborIds) {
      for (const edge of this.edges) {
        if (edge.from === neighborId && edge.to !== conceptId) twoHopIds.add(edge.to);
        if (edge.to === neighborId && edge.from !== conceptId) twoHopIds.add(edge.from);
      }
    }

    return Array.from(twoHopIds)
      .map(id => this.nodes.get(id))
      .filter((n): n is ConceptNode => n !== undefined);
  }

  getBridgingSentence(fromId: string, toId: string): string | null {
    for (const edge of this.edges) {
      if (
        (edge.from === fromId && edge.to === toId) ||
        (edge.from === toId && edge.to === fromId)
      ) {
        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);
        if (!fromNode || !toNode) continue;

        switch (edge.relation) {
          case 'built-on':
            return `${fromNode.label} is fundamentally built on top of ${toNode.label}.`;
          case 'uses':
            return `${fromNode.label} leverages ${toNode.label} for its core capabilities.`;
          case 'enables':
            return `Understanding ${fromNode.label} unlocks how ${toNode.label} functions under the hood.`;
          case 'relates-to':
            return `${fromNode.label} is closely connected with ${toNode.label}.`;
          case 'contrasts-with':
            return `Unlike ${toNode.label}, ${fromNode.label} takes a different architectural approach.`;
        }
      }
    }
    return null;
  }

  getRelatedQuestions(conceptId: string, count: number = 3): string[] {
    const neighbors = this.getNeighbors(conceptId, 1);
    const questions: string[] = [];

    for (const neighbor of neighbors) {
      if (neighbor.category === 'personal') {
        questions.push(`What is Neal's experience with ${neighbor.label}?`);
      } else if (neighbor.category === 'architecture' || neighbor.category === 'frameworks') {
        questions.push(`How does ${neighbor.label} work in practice?`);
      } else {
        questions.push(`Tell me about ${neighbor.label}`);
      }
      if (questions.length >= count) break;
    }

    // Default fallback suggestions if graph neighbors are sparse
    if (questions.length === 0) {
      questions.push('Tell me about Neal’s tech stack', 'What projects has Neal built?', 'Quiz me on React');
    }

    return questions;
  }
}

export const conceptGraph = new ConceptGraph();
