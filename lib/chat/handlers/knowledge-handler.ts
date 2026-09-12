import type { HandlerContext, HandlerResult } from './types';
import { finishResponse } from './types';
import type { PendingOffer } from '@/lib/chat/types';
import { TOPICS, CONCEPTS } from '@/lib/chat/knowledge/topics';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';

const TOPIC_INTRO_HOOKS = [
  'Here is how',
  'Let’s break down',
  'In modern engineering,',
  'At its core,',
  'Understanding',
];

const CODE_INTRO_HOOKS = [
  'Here is a hands-on implementation and breakdown for',
  'Let’s walk through a concrete code example of',
  'Here is how you write and use',
  'Practical demonstration for',
];

const HIT_FRAMES = [
  'Regarding',
  'Here is what Neal shares on',
  'From Neal’s portfolio notes on',
  'On the topic of',
];

export function handleKnowledge(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, intentResult, entities, retrievalResult, turnCount } = ctx;
  const { intent, conceptId } = intentResult;
  const topicThread = [...state.topicThread];

  // 1. HIGH-CONFIDENCE KNOWLEDGE GRAPH HITS (Primary for factual & portfolio questions)
  // Evaluated before generic graph nodes so questions like "Where did Neal study?"
  // receive the exact triple fact rather than a generic author bio node.
  if (retrievalResult.bestHit?.lane === 'kg' && intent !== 'continuation') {
    const hit = retrievalResult.bestHit;
    const hitFrame = HIT_FRAMES[(turnCount + (hit.title?.length || 0)) % HIT_FRAMES.length];

    let replyText = `${hitFrame} **${hit.heading || hit.title}**: ${hit.excerpt}`;
    if (hit.contextSentence && hit.contextSentence !== hit.excerpt) {
      replyText += `\n\n${hit.contextSentence}`;
    }

    const sources = hit.url
      ? [{ title: hit.title, heading: hit.heading, url: hit.url, excerpt: hit.excerpt.slice(0, 140) }]
      : [];

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
          topicThread,
        },
        null
      ),
    };
  }

  // 2. CONTINUATION / DEEP DIVE ON ACTIVE TOPIC OR PENDING OFFER
  if (intent === 'continuation' && conceptId) {
    const topic = TOPICS.find(t => t.id === conceptId);
    const conceptDef = CONCEPTS[conceptId];
    const graphNode = conceptGraph.getNode(conceptId);
    const codeHook = CODE_INTRO_HOOKS[(turnCount + conceptId.length) % CODE_INTRO_HOOKS.length];

    if (topic) {
      const replyText = `${codeHook} **${topic.title}**:\n\n${topic.detail}`;
      const suggestions = conceptGraph.getRelatedQuestions(conceptId, 3);
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, topicThread },
          null
        ),
      };
    }

    if (conceptDef) {
      const replyText = `Continuing with **${conceptDef.label}**:\n\n${conceptDef.definition}`;
      const suggestions = conceptGraph.getRelatedQuestions(conceptId, 3);
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, topicThread },
          null
        ),
      };
    }

    if (graphNode) {
      const replyText = `Continuing with **${graphNode.label}**:\n\n${graphNode.description}`;
      const suggestions = conceptGraph.getRelatedQuestions(conceptId, 3);
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, topicThread },
          null
        ),
      };
    }
  }

  // 3. TECHNICAL CONCEPTS & CURATED TOPICS
  const activeConceptId = conceptId || entities.concepts[0];
  if (activeConceptId && activeConceptId !== 'neal') {
    const topic = TOPICS.find(t => t.id === activeConceptId);
    const conceptDef = CONCEPTS[activeConceptId];
    const graphNode = conceptGraph.getNode(activeConceptId);

    if (topic || conceptDef || graphNode) {
      topicThread.push(activeConceptId);

      // Concept bridging from previous turn
      let bridge = '';
      if (topicThread.length >= 2) {
        const previousConcept = topicThread[topicThread.length - 2];
        const bridgeSentence = conceptGraph.getBridgingSentence(previousConcept, activeConceptId);
        if (bridgeSentence) {
          bridge = `*${bridgeSentence}*\n\n`;
        }
      }

      const introHook = TOPIC_INTRO_HOOKS[(turnCount + activeConceptId.length) % TOPIC_INTRO_HOOKS.length];
      let replyText = '';
      let pendingOffer: PendingOffer | null = null;

      if (topic) {
        if (state.expertiseLevel === 'beginner') {
          replyText = `${bridge}**${topic.title}**\n\n${topic.summary}\n\n*Would you like a hands-on code example or a deeper look?*`;
          pendingOffer = {
            type: 'code_example',
            subjectId: topic.id,
            title: topic.title,
            suggestedAtTurn: turnCount + 1,
          };
        } else {
          replyText = `${bridge}${introHook} **${topic.title}**:\n\n${topic.detail}`;
          pendingOffer = null;
        }
      } else if (conceptDef) {
        replyText = `${bridge}**${conceptDef.label}**\n\n${conceptDef.definition}`;
      } else if (graphNode) {
        replyText = `${bridge}**${graphNode.label}**\n\n${graphNode.description}`;
      }

      const suggestions = conceptGraph.getRelatedQuestions(activeConceptId, 3);

      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, topicThread },
          pendingOffer
        ),
      };
    }
  }

  return { handled: false };
}
