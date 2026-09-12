import type { HandlerContext, HandlerResult, BuiltResponse } from './types';
import { finishResponse } from './types';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';
import { extractKeySentences } from '@/lib/chat/text-rank';
import { getRoundRobinItem } from '@/lib/chat/knowledge/personas';

const HIT_FRAMES = [
  'Regarding',
  'Here is what Neal shares on',
  'From Neal’s portfolio notes on',
  'On the topic of',
];

const UNCERTAINTY_PREFIXES = [
  "I'm not fully certain, but here's my best read",
  'My local index only turned up a loose match — here’s my best guess',
  'I don’t have a verified section on this, but here’s what looks closest',
];

export function handleRetrieval(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, retrievalResult } = ctx;
  let cursors: Record<string, number> = { ...(state.roundRobinCursors || {}) };

  if (retrievalResult.bestHit) {
    const hit = retrievalResult.bestHit;
    const hitPick = getRoundRobinItem('hit_frame', HIT_FRAMES, cursors);
    cursors = hitPick.updatedCursors;
    const hitFrame = hitPick.text;
    let replyText = '';

    if (hit.lane === 'kg') {
      replyText = `${hitFrame} **${hit.heading || hit.title}**: ${hit.excerpt}`;
      if (hit.contextSentence && hit.contextSentence !== hit.excerpt) {
        replyText += `\n\n${hit.contextSentence}`;
      }
    } else if (hit.lane === 'web') {
      if (hit.excerpt && hit.excerpt.length >= 25) {
        replyText = hit.excerpt;
      } else {
        return { handled: false };
      }
    } else {
      // Use TextRank extractive summarization on longer passages
      const keySentences = extractKeySentences(hit.contextSentence || hit.excerpt, 2);
      const summary = keySentences.length > 0 ? keySentences.join(' ') : hit.excerpt;
      replyText = `**${hit.heading || hit.title}**\n\n${summary}`;
    }

    const sources: Array<{ title: string; heading?: string; url: string; excerpt: string }> = [];
    if (hit.lane === 'web') {
      const seenUrls = new Set<string>();
      const candidateHits = retrievalResult.hits.filter(h => h.id.startsWith('web:src:')).length > 0
        ? retrievalResult.hits.filter(h => h.id.startsWith('web:src:'))
        : retrievalResult.hits;

      for (const h of candidateHits) {
        if (h.url && h.url.startsWith('http') && !seenUrls.has(h.url)) {
          seenUrls.add(h.url);
          sources.push({
            title: h.title,
            heading: h.heading || 'Web Source',
            url: h.url,
            excerpt: h.excerpt.slice(0, 140),
          });
          if (sources.length >= 4) break;
        }
      }
    } else if (hit.url) {
      sources.push({
        title: hit.title,
        heading: hit.heading,
        url: hit.url,
        excerpt: hit.excerpt.slice(0, 140),
      });
    }

    const hitConcept = conceptGraph.findConcept(hit.heading || hit.title);
    const suggestions = hitConcept
      ? conceptGraph.getRelatedQuestions(hitConcept.id, 3)
      : ['Tell me more about this', 'What else did Neal build?', 'Quiz me on code'];

    return {
      handled: true,
      response: finishResponse(
        replyText,
        sources,
        suggestions,
        userMessage,
        {
          ...state,
          lastRetrievalHits: retrievalResult.hits,
          roundRobinCursors: cursors,
          topicThread: (() => {
            const raw = hit.heading && !/^(web overview|overview|introduction)$/i.test(hit.heading)
              ? hit.heading
              : hit.title;
            return raw && !/^(web overview|overview|introduction)$/i.test(raw)
              ? [...(state.topicThread || []).slice(-9), raw]
              : state.topicThread;
          })(),
        },
        null
      ),
    };
  }

  return { handled: false };
}

export function handleFallback(ctx: HandlerContext): BuiltResponse {
  const { userMessage, state, retrievalResult } = ctx;

  // Low-confidence path: retrieval ran but nothing cleared the confidence
  // floor (bestHit nulled in retrieval.ts). Surface uncertainty visibly
  // instead of answering in the same full-confidence voice.
  const looseHit = retrievalResult?.hits?.[0];
  if (looseHit) {
    let cursors: Record<string, number> = { ...(state.roundRobinCursors || {}) };
    const hedgePick = getRoundRobinItem('uncertainty', UNCERTAINTY_PREFIXES, cursors);
    cursors = hedgePick.updatedCursors;

    const keySentences = extractKeySentences(looseHit.contextSentence || looseHit.excerpt, 2);
    const summary = keySentences.length > 0 ? keySentences.join(' ') : looseHit.excerpt.slice(0, 220);
    const replyText =
      `${hedgePick.text} based on **${looseHit.heading || looseHit.title}**:\n\n${summary}\n\n` +
      `*If that's off, try rephrasing — or ask me about **TypeScript**, **React Server Components**, **Neal's co-op at TQM**, or type \`/quiz\`!*`;
    const sources = looseHit.url
      ? [{ title: looseHit.title, heading: looseHit.heading, url: looseHit.url, excerpt: looseHit.excerpt.slice(0, 140) }]
      : [];
    const hitConcept = conceptGraph.findConcept(looseHit.heading || looseHit.title);
    const suggestions = hitConcept
      ? conceptGraph.getRelatedQuestions(hitConcept.id, 3)
      : ['What is Neal’s stack?', 'Explain React Server Components', 'Quiz me on TypeScript'];

    return finishResponse(
      replyText,
      sources,
      suggestions,
      userMessage,
      { ...state, roundRobinCursors: cursors, lastRetrievalHits: retrievalResult.hits },
      null
    );
  }

  const cleanQ = userMessage.slice(0, 35);
  const replyText = `That's an interesting question regarding "${cleanQ}"! I don't have a direct section on that in Neal's portfolio.\n\nTry rephrasing, or ask me about **TypeScript**, **React Server Components**, **Neal's co-op at TQM**, or type \`/quiz\` to test your frontend skills!`;
  const suggestions = ['What is Neal’s stack?', 'Explain React Server Components', 'Quiz me on TypeScript'];

  return finishResponse(replyText, [], suggestions, userMessage, state, null);
}
