import type { HandlerContext, HandlerResult } from './types';
import { finishResponse } from './types';
import { createInitialConversationState } from '@/lib/chat/state';
import { QuizManager } from '@/lib/chat/knowledge/quizzes';

export function handleQuizAndCommands(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, intentResult, entities } = ctx;
  const { intent, conceptId } = intentResult;
  let activeQuiz = state.activeQuiz;

  // 1. ACTIVE QUIZ ANSWER
  if (intent === 'quiz_answer' && activeQuiz && !activeQuiz.answered) {
    const evalResult = QuizManager.evaluate(userMessage, activeQuiz);
    activeQuiz = evalResult.updatedState;
    const replyText = evalResult.feedback;
    const suggestions = ['Quiz me again!', 'Tell me about React', 'What is Next.js App Router?'];

    return {
      handled: true,
      response: finishResponse(
        replyText,
        [],
        suggestions,
        userMessage,
        {
          ...state,
          activeQuiz,
        },
        null
      ),
    };
  }

  // 2. COMMAND HANDLING
  if (intent === 'command') {
    if (conceptId === 'quiz') {
      const preferredTopics = entities.concepts.length > 0 ? entities.concepts : undefined;
      activeQuiz = QuizManager.startQuiz(preferredTopics, state.expertiseLevel);
      const replyText = QuizManager.formatQuestionPrompt(activeQuiz);
      const suggestions = ['A', 'B', 'C', 'D'];

      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          {
            ...state,
            activeQuiz,
          },
          null
        ),
      };
    }

    if (conceptId === 'reset' || conceptId === 'clear') {
      const replyText = 'Conversation state has been reset. What would you like to explore next?';
      const suggestions = ['Tell me about Neal’s projects', 'How does the event loop work?', 'Quiz me!'];

      return {
        handled: true,
        response: {
          text: replyText,
          sources: [],
          suggestions,
          updatedState: createInitialConversationState(),
        },
      };
    }

    if (conceptId === 'help') {
      const replyText = `### How to Interact with Nara\n\nI can help you explore Neal's portfolio, understand complex engineering concepts, or test your skills:\n\n- **Explore Neal's Work:** Ask *"What is Neal's tech stack?"*, *"Where did Neal do his co-op?"*, or *"Tell me about his vibe coding essay"*.\n- **Learn Technical Concepts:** Ask *"Explain React Server Components"*, *"What is a closure?"*, or *"How does the event loop work?"*.\n- **Interactive Quizzes:** Type \`/quiz\` or *"Quiz me on JavaScript"*.\n- **Reset Session:** Type \`/reset\` or \`/clear\`.\n- **Chat:** Ask for jokes, sci-fi movie picks, or tech trivia!`;
      const suggestions = ['What is Neal’s stack?', 'Quiz me on React', 'Explain Closures'];

      return {
        handled: true,
        response: finishResponse(replyText, [], suggestions, userMessage, state),
      };
    }
  }

  return { handled: false };
}
