import type { HandlerContext, HandlerResult } from './types';
import { finishResponse } from './types';
import { OPINIONS } from '@/lib/chat/knowledge/personas';

export function handleOpinions(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, intentResult } = ctx;
  const { intent, conceptId } = intentResult;

  if (intent === 'personal' && conceptId === 'vibe-coding') {
    const replyText = OPINIONS.vibe;
    const sources = [
      {
        title: 'Vibe Coding with Intention',
        heading: 'Essay by Neal',
        url: '/writing/vibe-coding',
        excerpt: 'Speed without comprehension is fragile.',
      },
    ];
    const suggestions = ['What tools does Neal use?', 'What is his engineering philosophy?', 'Quiz me'];
    return {
      handled: true,
      response: finishResponse(replyText, sources, suggestions, userMessage, state),
    };
  }

  return { handled: false };
}
