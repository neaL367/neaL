import type { ConversationState } from '@/lib/chat/types';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';

export interface ExtractedEntities {
  concepts: string[];
  resolvedSubject?: string;
  isFollowUp: boolean;
}

export function extractEntities(
  rawText: string,
  tokens: string[],
  state?: ConversationState
): ExtractedEntities {
  const clean = rawText.toLowerCase().trim();
  const detectedConcepts: string[] = [];

  // 1. Specificity-ranked concept matching
  const allFound = conceptGraph.findAllConcepts(clean);
  for (const node of allFound) {
    if (!detectedConcepts.includes(node.id)) {
      detectedConcepts.push(node.id);
    }
  }

  // 2. Scan individual tokens and bigrams for any remaining mentions
  for (let i = 0; i < tokens.length; i++) {
    const single = conceptGraph.findConcept(tokens[i]);
    if (single && !detectedConcepts.includes(single.id)) {
      detectedConcepts.push(single.id);
    }

    if (i < tokens.length - 1) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      const biConcept = conceptGraph.findConcept(bigram);
      if (biConcept && !detectedConcepts.includes(biConcept.id)) {
        detectedConcepts.push(biConcept.id);
      }
    }
  }

  // 3. Pronoun and follow-up resolution
  let isFollowUp = false;
  let resolvedSubject: string | undefined;

  const pronounRegex = /\b(it|this|that|these|those|the same|its|they|the second one|the first one)\b/i;
  if (pronounRegex.test(clean)) {
    isFollowUp = true;
    // Look at last topic in thread or last retrieval hit
    if (state?.topicThread && state.topicThread.length > 0) {
      resolvedSubject = state.topicThread[state.topicThread.length - 1];
    } else if (state?.lastRetrievalHits && state.lastRetrievalHits.length > 0) {
      resolvedSubject = state.lastRetrievalHits[0].title;
    }
  }

  return {
    concepts: detectedConcepts,
    resolvedSubject,
    isFollowUp,
  };
}
