import type { HandlerContext, HandlerResult } from './types';
import { finishResponse } from './types';
import type { PendingOffer } from '@/lib/chat/types';
import { TOPICS, CONCEPTS } from '@/lib/chat/knowledge/topics';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';
import { getRoundRobinItem } from '@/lib/chat/knowledge/personas';

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

const REVISIT_PREFIXES = [
  'Since we touched on this before — here’s the angle we haven’t covered yet.',
  'Circling back — let’s go a level deeper on',
  'Good to revisit — here’s more depth on',
];

export function handleKnowledge(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, intentResult, entities, retrievalResult, turnCount } = ctx;
  const { intent, conceptId } = intentResult;
  const topicThread = [...state.topicThread];
  let cursors: Record<string, number> = { ...(state.roundRobinCursors || {}) };
  const covered: string[] = [...(state.coveredConcepts || [])];
  const markCovered = (id: string): string[] => {
    if (covered.includes(id)) return [...covered];
    return [...covered, id].slice(-20);
  };

  // 1. HIGH-CONFIDENCE KNOWLEDGE GRAPH HITS (Primary for factual & portfolio questions)
  // Evaluated before generic graph nodes so questions like "Where did Neal study?"
  // receive the exact triple fact rather than a generic author bio node.
  if (retrievalResult.bestHit?.lane === 'kg' && intent !== 'continuation') {
    const hit = retrievalResult.bestHit;
    const hitPick = getRoundRobinItem('hit_frame', HIT_FRAMES, cursors);
    cursors = hitPick.updatedCursors;
    const hitFrame = hitPick.text;

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
          roundRobinCursors: cursors,
          coveredConcepts: covered,
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
    const codePick = getRoundRobinItem('code_intro', CODE_INTRO_HOOKS, cursors);
    cursors = codePick.updatedCursors;
    const codeHook = codePick.text;
    const nextCovered = markCovered(conceptId);

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
          { ...state, topicThread, roundRobinCursors: cursors, coveredConcepts: nextCovered },
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
          { ...state, topicThread, roundRobinCursors: cursors, coveredConcepts: nextCovered },
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
          { ...state, topicThread, roundRobinCursors: cursors, coveredConcepts: nextCovered },
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

      const isRepeat = covered.includes(activeConceptId);
      const nextCovered = markCovered(activeConceptId);
      let replyText = '';
      let pendingOffer: PendingOffer | null = null;

      if (topic) {
        if (isRepeat) {
          // Repeat: vary opener and shift depth — always give full detail
          // instead of replaying the identical summary/detail verbatim.
          const revisitPick = getRoundRobinItem('revisit_prefix', REVISIT_PREFIXES, cursors);
          cursors = revisitPick.updatedCursors;
          const revisit = revisitPick.text.endsWith('on')
            ? `${revisitPick.text} **${topic.title}**`
            : revisitPick.text;
          const body = revisit.endsWith(`**${topic.title}**`)
            ? `:\n\n${topic.detail}`
            : `\n\n**${topic.title}**:\n\n${topic.detail}`;
          replyText = `${bridge}*${revisit}*${body}\n\n*Want a hands-on code example or a quiz to lock it in?*`;
          pendingOffer = {
            type: 'code_example',
            subjectId: topic.id,
            title: topic.title,
            suggestedAtTurn: turnCount + 1,
          };
        } else if (state.expertiseLevel === 'beginner') {
          replyText = `${bridge}**${topic.title}**\n\n${topic.summary}\n\n*Would you like a hands-on code example or a deeper look?*`;
          pendingOffer = {
            type: 'code_example',
            subjectId: topic.id,
            title: topic.title,
            suggestedAtTurn: turnCount + 1,
          };
        } else {
          const introPick = getRoundRobinItem('topic_intro', TOPIC_INTRO_HOOKS, cursors);
          cursors = introPick.updatedCursors;
          replyText = `${bridge}${introPick.text} **${topic.title}**:\n\n${topic.detail}`;
          pendingOffer = null;
        }
      } else if (conceptDef) {
        if (isRepeat) {
          const revisitPick = getRoundRobinItem('revisit_prefix', REVISIT_PREFIXES, cursors);
          cursors = revisitPick.updatedCursors;
          replyText = `${bridge}*${revisitPick.text}*\n\n**${conceptDef.label}**\n\n${conceptDef.definition}`;
        } else {
          replyText = `${bridge}**${conceptDef.label}**\n\n${conceptDef.definition}`;
        }
      } else if (graphNode) {
        if (isRepeat) {
          const revisitPick = getRoundRobinItem('revisit_prefix', REVISIT_PREFIXES, cursors);
          cursors = revisitPick.updatedCursors;
          replyText = `${bridge}*${revisitPick.text}*\n\n**${graphNode.label}**\n\n${graphNode.description}`;
        } else {
          replyText = `${bridge}**${graphNode.label}**\n\n${graphNode.description}`;
        }
      }

      const suggestions = conceptGraph.getRelatedQuestions(activeConceptId, 3);

      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, topicThread, roundRobinCursors: cursors, coveredConcepts: nextCovered },
          pendingOffer
        ),
      };
    }
  }

  return { handled: false };
}
