import type { HandlerContext, HandlerResult } from './types';
import { finishResponse } from './types';
import {
  GREETINGS,
  PERSONAS,
  THANKS_RESPONSES,
  FAREWELLS,
  EMPATHY_RESPONSES,
  JOKES,
  TECH_FACTS,
  FAVORITES,
  IDENTITY_QA,
  MOVIE_RECOMMENDATION_SETS,
  FILM_KNOWLEDGE,
  HOW_ARE_YOU,
  WHO_MADE_YOU,
  INJECTION_DEFENSE,
  GIBBERISH_RESPONSES,
  getRoundRobinItem,
} from '@/lib/chat/knowledge/personas';

function replyWithRoundRobin(
  category: string,
  items: readonly string[] | string[],
  suggestions: string[],
  userMessage: string,
  state: HandlerContext['state'],
  cursors: Record<string, number>,
  textTransform?: (text: string) => string
): HandlerResult {
  const item = getRoundRobinItem(category, items, cursors);
  const finalText = textTransform ? textTransform(item.text) : item.text;
  return {
    handled: true,
    response: finishResponse(
      finalText,
      [],
      suggestions,
      userMessage,
      { ...state, roundRobinCursors: item.updatedCursors }
    ),
  };
}

export function handleConversational(ctx: HandlerContext): HandlerResult {
  const { userMessage, state, intentResult } = ctx;
  const { intent, conceptId } = intentResult;
  const roundRobinCursors = { ...state.roundRobinCursors };

  // 1. REJECTIONS & DECLINED OFFERS
  if (intent === 'rejection') {
    const replyText = "Got it, no problem! We can leave that aside. What would you like to explore instead? You can ask about Neal's portfolio, another web concept, or type `/quiz` to test your frontend skills.";
    const suggestions = ['Tell me about Neal’s projects', 'How does the event loop work?', 'Quiz me on React'];
    return {
      handled: true,
      response: finishResponse(
        replyText,
        [],
        suggestions,
        userMessage,
        { ...state, roundRobinCursors },
        null
      ),
    };
  }

  // 2. CONVERSATIONAL & PERSONA INTENTS
  if (intent === 'conversational') {
    if (conceptId === 'greeting') {
      return replyWithRoundRobin('greetings', GREETINGS, ['Who is Neal?', 'What projects has he built?', 'Quiz me on code'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'bye') {
      return replyWithRoundRobin('byes', FAREWELLS, ['Start a new topic', 'Quiz me before I go'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'thanks') {
      return replyWithRoundRobin('thanks', THANKS_RESPONSES, ['Tell me about Next.js', 'Quiz me!', 'What are closures?'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'empathy') {
      return replyWithRoundRobin('empathy', EMPATHY_RESPONSES, ['Tell me a joke', 'Share a random tech fact', 'Start a light quiz'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'affirmation') {
      const replyText = "Awesome! What would you like to dive into? We can explore Neal's portfolio, break down technical concepts like closures or the event loop, or test your frontend skills with a quick quiz!";
      const suggestions = ['Explain closures', 'What is Neal’s stack?', 'Quiz me on React'];
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, roundRobinCursors },
          null
        ),
      };
    }

    if (conceptId === 'movie_recommendation') {
      return replyWithRoundRobin('movie_recs', MOVIE_RECOMMENDATION_SETS, ['Tell me about Arrival', 'Why time dilation in Interstellar?', 'Another recommendation'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'persona') {
      return replyWithRoundRobin('personas', PERSONAS, ['Who is Neal?', 'What is Neal’s stack?', 'Quiz me on React'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'how_are_you') {
      return replyWithRoundRobin('how_are_you', HOW_ARE_YOU, ['What is Neal’s stack?', 'Quiz me on React', 'Tell me a joke'], userMessage, state, roundRobinCursors);
    }

    if (conceptId?.startsWith('fav:')) {
      const favKey = conceptId.slice(4);
      const favText = FAVORITES[favKey] || FAVORITES.general;
      const suggestions = ['Tell me about Interstellar', 'What is Neal’s stack?', 'Quiz me on React'];
      return {
        handled: true,
        response: finishResponse(
          favText,
          [],
          suggestions,
          userMessage,
          { ...state, roundRobinCursors }
        ),
      };
    }

    if (conceptId === 'are_you_real' || conceptId === 'location' || conceptId === 'age') {
      const replyText = IDENTITY_QA[conceptId];
      const suggestions = ['Who made you?', 'What is Neal’s stack?', 'Quiz me on code'];
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, roundRobinCursors }
        ),
      };
    }

    if (conceptId === 'who_made_you') {
      return replyWithRoundRobin('who_made_you', WHO_MADE_YOU, ['What is Neal’s stack?', 'Where did Neal study?', 'Tell me about his co-op'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'injection_defense') {
      return replyWithRoundRobin('injection', INJECTION_DEFENSE, ['Explain closures', 'What is Neal’s stack?', 'Quiz me on TypeScript'], userMessage, state, roundRobinCursors);
    }

    if (conceptId === 'security_refusal') {
      const replyText = "I cannot assist with unauthorized hacking, exploiting vulnerabilities, or bypassing security controls.\n\nHowever, I can explain defensive web security principles — such as how to prevent **SQL injection**, implement a **Content Security Policy (CSP)**, secure **CORS**, or protect against **XSS**!";
      const suggestions = ['Explain XSS prevention', 'What is CORS?', 'How to secure JWTs?'];
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, roundRobinCursors }
        ),
      };
    }

    if (conceptId?.startsWith('film:')) {
      const filmKey = conceptId.slice(5);
      const film = FILM_KNOWLEDGE[filmKey];
      if (film) {
        const topicThread = [...(state.topicThread || []).slice(-9), film.title];
        return {
          handled: true,
          response: finishResponse(
            film.text,
            [],
            film.suggestions,
            userMessage,
            { ...state, roundRobinCursors, topicThread }
          ),
        };
      }
    }

    if (conceptId === 'gibberish') {
      return replyWithRoundRobin('gibberish', GIBBERISH_RESPONSES, ['What is Neal’s stack?', 'Quiz me on React', 'Explain Closures'], userMessage, state, roundRobinCursors);
    }

    if (conceptId?.startsWith('math:')) {
      const mathExpr = conceptId.slice(5);
      const replyText = `**Calculation Result:**\n\n\`${mathExpr}\`\n\n*Need any other calculations, or want to explore Neal's projects?*`;
      const suggestions = ['What is Neal’s tech stack?', 'Explain Closures', 'Quiz me!'];
      return {
        handled: true,
        response: finishResponse(
          replyText,
          [],
          suggestions,
          userMessage,
          { ...state, roundRobinCursors }
        ),
      };
    }

    if (conceptId === 'fact') {
      return replyWithRoundRobin(
        'facts',
        TECH_FACTS,
        ['Another fact!', 'Tell me a joke', 'Quiz me!'],
        userMessage,
        state,
        roundRobinCursors,
        t => `${t}\n\n*Curious about anything else, or ready for a quiz?*`
      );
    }
  }

  // 3. JOKES
  if (intent === 'joke') {
    return replyWithRoundRobin(
      'jokes',
      JOKES,
      ['Another joke!', 'Tell me a cool tech fact', 'Quiz me on TypeScript'],
      userMessage,
      state,
      roundRobinCursors,
      t => `${t}\n\n*Want another one, or should we switch back to coding questions?*`
    );
  }

  return { handled: false };
}
