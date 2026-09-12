import type { HandlerContext, HandlerResult } from './types';
import { finishResponse } from './types';
import { TOPICS, CONCEPTS } from '@/lib/chat/knowledge/topics';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';
import { getRoundRobinItem, TOPIC_INTRO_HOOKS } from '@/lib/chat/knowledge/personas';

const COMPARE_SIGNAL =
  /\bvs\.?|\bversus\b|\bcompared to\b|\bcomparison\b|\bdifference between\b|\bbetter\b|\bbest\b|\bwhich (?:should|would|is better|is best)\b/i;

/** Bare "or" only counts with a question mark (avoids "tea or coffee" traps). */
function hasCompareShape(clean: string): boolean {
  if (COMPARE_SIGNAL.test(clean)) return true;
  return /\bor\b/i.test(clean) && clean.includes('?');
}

function describeConcept(id: string): { title: string; body: string } | null {
  const topic = TOPICS.find(t => t.id === id);
  if (topic) return { title: topic.title, body: topic.summary };
  const def = CONCEPTS[id];
  if (def) return { title: def.label, body: def.definition };
  const node = conceptGraph.getNode(id);
  if (node) return { title: node.label, body: node.description };
  return null;
}

/**
 * X-vs-Y questions: compose BOTH concepts side-by-side plus the graph's
 * contrast/bridge sentence, instead of answering only the first match.
 * Runs before handleKnowledge; quiz commands already ran earlier.
 */
export function handleComparison(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, entities } = ctx;
  if (!hasCompareShape(userMessage.toLowerCase())) return { handled: false };

  const seen = new Set<string>();
  const ids: string[] = [];
  const labels: string[] = [];
  for (const id of entities.concepts) {
    if (id === 'neal' || seen.has(id)) continue;
    const node = conceptGraph.getNode(id);
    const label = (node?.label || id).toLowerCase();
    // Skip near-duplicates ("react-19" vs "react") — keep the first, move on.
    if (labels.some(l => l.includes(label) || label.includes(l))) continue;
    seen.add(id);
    labels.push(label);
    ids.push(id);
    if (ids.length === 2) break;
  }
  if (ids.length < 2) return { handled: false };

  const [aId, bId] = ids;
  const a = describeConcept(aId);
  const b = describeConcept(bId);
  if (!a || !b) return { handled: false };

  let cursors = { ...(state.roundRobinCursors || {}) };
  const introPick = getRoundRobinItem('topic_intro', TOPIC_INTRO_HOOKS, cursors);
  cursors = introPick.updatedCursors;

  const bridge = conceptGraph.getBridgingSentence(aId, bId);
  const covered = [...(state.coveredConcepts || [])];
  for (const id of [aId, bId]) {
    if (!covered.includes(id)) covered.push(id);
  }

  const replyText =
    `${introPick.text} **${a.title}** vs **${b.title}**:\n\n` +
    `**${a.title}**\n\n${a.body}\n\n**${b.title}**\n\n${b.body}` +
    (bridge ? `\n\n*${bridge}*` : `\n\n*Different tools for different jobs — pick by what you're building.*`);

  const suggestions = [
    ...conceptGraph.getRelatedQuestions(aId, 2),
    `Quiz me on ${a.title}`,
  ];

  return {
    handled: true,
    response: finishResponse(
      replyText,
      [],
      suggestions,
      userMessage,
      {
        ...state,
        topicThread: [...state.topicThread, aId, bId].slice(-10),
        roundRobinCursors: cursors,
        coveredConcepts: covered.slice(-20),
      },
      null
    ),
  };
}
