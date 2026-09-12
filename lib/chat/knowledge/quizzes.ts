import type { QuizQuestion, QuizState, ExpertiseLevel } from '@/lib/chat/types';
import { levenshteinDistance } from '@/lib/chat/text-distance';

export const QUIZZES: QuizQuestion[] = [
  {
    id: 'js-nan',
    topic: 'JavaScript',
    prompt: 'What does `typeof NaN` evaluate to in JavaScript?',
    options: ['"undefined"', '"number"', '"NaN"', '"object"'],
    correctIndex: 1,
    explanation: 'Per the IEEE 754 floating-point specification, NaN is categorized as a numerical value representing an unrepresentable math result. To test for NaN, use `Number.isNaN(val)`.',
    hint: 'Think about the IEEE 754 floating-point standard used by JS numbers.',
    difficulty: 'beginner',
  },
  {
    id: 'react-keys',
    topic: 'React',
    prompt: 'Why does React require a unique `key` prop on elements rendered in a list?',
    options: [
      'To assign unique CSS classes for styling',
      'To identify item identity across renders during Reconciliation',
      'To automatically sort the array alphabetically',
      'To prevent JavaScript memory leaks',
    ],
    correctIndex: 1,
    explanation: 'React uses the `key` prop to match virtual DOM nodes between renders. Stable keys allow React to reorder or preserve stateful components rather than unmounting and recreating them.',
    hint: 'It relates to the Diffing algorithm and component state preservation.',
    difficulty: 'intermediate',
  },
  {
    id: 'nextjs-rsc',
    topic: 'Next.js',
    prompt: 'What is the primary architectural benefit of React Server Components (RSC) in Next.js App Router?',
    options: [
      'Enables 120 FPS client animations',
      'Zero client bundle size contribution for server-only dependencies',
      'Automatically generates unit test suites',
      'Replaces all CSS with inline styles',
    ],
    correctIndex: 1,
    explanation: 'RSC execute only on the server and stream a serialized UI format. Heavy dependencies used on the server (like markdown parsers or DB drivers) never get sent to the client browser.',
    hint: 'Think about JavaScript bundle size shipped over the network.',
    difficulty: 'intermediate',
  },
  {
    id: 'js-float',
    topic: 'JavaScript',
    prompt: 'What does the expression `0.1 + 0.2 === 0.3` evaluate to in JavaScript?',
    options: ['true', 'false', 'undefined', 'TypeError'],
    correctIndex: 1,
    explanation: 'Because JavaScript uses IEEE 754 binary floating-point numbers, 0.1 and 0.2 cannot be represented with exact precision in binary (yielding ~0.30000000000000004). Use `Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON`.',
    hint: 'Computers calculate numbers in base 2 (binary), not base 10.',
    difficulty: 'beginner',
  },
  {
    id: 'css-axis',
    topic: 'CSS',
    prompt: 'In a Flex container with `flex-direction: row`, which property aligns child items along the vertical axis?',
    options: ['justify-content', 'align-items', 'align-content', 'place-self'],
    correctIndex: 1,
    explanation: 'In `row` direction, the Main Axis is horizontal (governed by `justify-content`), while the Cross Axis is vertical (governed by `align-items`).',
    hint: 'Main axis is horizontal; cross axis is vertical.',
    difficulty: 'beginner',
  },
  {
    id: 'interstellar-time',
    topic: 'Interstellar',
    prompt: 'On Miller’s ocean planet in Christopher Nolan’s *Interstellar*, how much Earth time passes for every 1 hour spent on the surface?',
    options: ['1 month', '1 year', '7 years', '25 years'],
    correctIndex: 2,
    explanation: 'The extreme gravitational field of the supermassive black hole Gargantua creates massive gravitational time dilation: 1 hour on Miller’s planet corresponds to approximately 7 Earth years.',
    hint: 'Gargantua’s gravity slows down time dramatically — think in years, not months.',
    difficulty: 'intermediate',
  },
  {
    id: 'ts-satisfies',
    topic: 'TypeScript',
    prompt: 'What is the key advantage of TypeScript’s `satisfies` operator over type annotations (`: Type`)?',
    options: [
      'It disables type checking entirely',
      'It validates that a value conforms to a type without widening its specific literal type',
      'It automatically compiles TypeScript to WebAssembly',
      'It replaces runtime unit tests',
    ],
    correctIndex: 1,
    explanation: '`satisfies` asserts compatibility with an interface or type contract while preserving the most specific literal types and autocomplete inferences of the original expression.',
    hint: 'Preserves literal types rather than widening them.',
    difficulty: 'expert',
  },
];

export class QuizManager {
  static startQuiz(preferredTopic?: string, preferredDifficulty?: ExpertiseLevel): QuizState {
    let pool = QUIZZES;

    if (preferredTopic) {
      const topicMatches = pool.filter(q =>
        q.topic.toLowerCase().includes(preferredTopic.toLowerCase())
      );
      if (topicMatches.length > 0) pool = topicMatches;
    }

    if (preferredDifficulty) {
      const diffMatches = pool.filter(q => q.difficulty === preferredDifficulty);
      if (diffMatches.length > 0) pool = diffMatches;
    }

    const question = pool[Math.floor(Math.random() * pool.length)];
    return {
      question,
      answered: false,
      attempts: 0,
    };
  }

  static parseUserSelection(input: string, options: string[]): number | null {
    const clean = input.trim().toLowerCase();

    // 1. Single letter match: 'A', 'b', 'c)', 'd.'
    const letterMatch = clean.match(/^([a-d])[\s.):-]?/);
    if (letterMatch) {
      const charCode = letterMatch[1].charCodeAt(0);
      const idx = charCode - 97; // 'a' -> 0
      if (idx >= 0 && idx < options.length) return idx;
    }

    // 2. Digit match: '1', '2', '3', '4'
    const digitMatch = clean.match(/^([1-4])[\s.):-]?/);
    if (digitMatch) {
      const idx = parseInt(digitMatch[1], 10) - 1;
      if (idx >= 0 && idx < options.length) return idx;
    }

    // 3. Ordinal word match
    if (clean.includes('first') || clean.includes('option 1') || clean.includes('option a')) return 0;
    if (clean.includes('second') || clean.includes('option 2') || clean.includes('option b')) return 1;
    if (clean.includes('third') || clean.includes('option 3') || clean.includes('option c')) return 2;
    if (clean.includes('fourth') || clean.includes('option 4') || clean.includes('option d')) return 3;

    // 4. Substring match on option text
    for (let i = 0; i < options.length; i++) {
      const opt = options[i].toLowerCase();
      // If user typed the exact option or a distinctive part
      if (clean === opt || (clean.length >= 4 && opt.includes(clean)) || (opt.length >= 4 && clean.includes(opt))) {
        return i;
      }
    }

    // 5. Typo-tolerant fuzzy match (reuses concept-graph Levenshtein).
    // Catches slightly misspelled full/partial answers, e.g. "ture" -> "true",
    // "reconciliaton" -> "Reconciliation".
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanNorm = normalize(clean);
    if (cleanNorm.length >= 3) {
      const optNorms = options.map(o => normalize(o));

      // 5a. Full-string fuzzy (whole answer with 1-2 typos)
      let bestFullIdx: number | null = null;
      let bestFullDist = Infinity;
      for (let i = 0; i < optNorms.length; i++) {
        const optNorm = optNorms[i];
        if (!optNorm) continue;
        const lenDiff = Math.abs(cleanNorm.length - optNorm.length);
        const maxLen = Math.max(cleanNorm.length, optNorm.length);
        const allowedDiff = maxLen > 30 ? 5 : 3;
        if (lenDiff > allowedDiff) continue;
        const dist = levenshteinDistance(cleanNorm, optNorm);
        const maxAllowed = maxLen >= 30 ? 3 : 2;
        if (dist <= maxAllowed && dist < bestFullDist) {
          bestFullDist = dist;
          bestFullIdx = i;
        }
      }
      if (bestFullIdx !== null) return bestFullIdx;

      // 5b. Token-level fuzzy (distinctive keyword with typo).
      // Requires every distinctive clean word to fuzzy-match some option word,
      // so generic/ambiguous input stays null instead of guessing.
      const cleanWords = cleanNorm.split(' ').filter(w => w.length >= 4);
      if (cleanWords.length > 0) {
        let bestIdx: number | null = null;
        let bestTotal = Infinity;
        let tie = false;
        for (let i = 0; i < optNorms.length; i++) {
          const optWords = optNorms[i].split(' ').filter(w => w.length >= 4);
          if (optWords.length === 0) continue;
          let totalDist = 0;
          let allMatch = true;
          for (const cw of cleanWords) {
            let bestD = Infinity;
            for (const ow of optWords) {
              if (Math.abs(cw.length - ow.length) > 2) continue;
              const d = levenshteinDistance(cw, ow);
              if (d < bestD) bestD = d;
              if (bestD === 0) break;
            }
            const allowed = cw.length >= 4 ? 2 : 1;
            if (bestD > allowed) {
              allMatch = false;
              break;
            }
            totalDist += bestD;
          }
          if (!allMatch) continue;
          if (totalDist < bestTotal) {
            bestTotal = totalDist;
            bestIdx = i;
            tie = false;
          } else if (totalDist === bestTotal) {
            tie = true;
          }
        }
        if (bestIdx !== null && !tie) return bestIdx;
      }
    }

    return null;
  }

  static evaluate(
    userAnswer: string,
    state: QuizState
  ): {
    updatedState: QuizState;
    feedback: string;
  } {
    const selectedIdx = this.parseUserSelection(userAnswer, state.question.options);
    const q = state.question;
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    const correctText = q.options[q.correctIndex];

    if (selectedIdx === null) {
      // Could not parse the answer
      return {
        updatedState: {
          ...state,
          attempts: (state.attempts ?? 0) + 1,
        },
        feedback: `I couldn't quite tell which option you chose! Please reply with **A, B, C, or D** (or the answer text).\n\n**Question:** ${q.prompt}`,
      };
    }

    const isCorrect = selectedIdx === q.correctIndex;
    const updatedState: QuizState = {
      ...state,
      userAnswerIndex: selectedIdx,
      isCorrect,
      answered: true,
      attempts: (state.attempts ?? 0) + 1,
    };

    if (isCorrect) {
      return {
        updatedState,
        feedback: `**Spot on! That's completely correct!**\n\n**Answer:** **${correctLetter}) ${correctText}**\n\n**Why:** ${q.explanation}\n\n*Type "quiz me" or ask for a specific topic to play another round!*`,
      };
    } else {
      const chosenLetter = String.fromCharCode(65 + selectedIdx);
      return {
        updatedState,
        feedback: `Not quite — you selected **${chosenLetter}**, but the correct answer is **${correctLetter}) ${correctText}**.\n\n**Why:** ${q.explanation}\n\n*Ready for another? Just say "quiz me"!*`,
      };
    }
  }

  static formatQuestionPrompt(state: QuizState): string {
    const q = state.question;
    const formattedOptions = q.options
      .map((opt, i) => `**${String.fromCharCode(65 + i)}**) ${opt}`)
      .join('\n');

    return `### Quiz Challenge [${q.topic}] (${q.difficulty})\n\n**${q.prompt}**\n\n${formattedOptions}\n\n*(Type A, B, C, or D to answer)*`;
  }
}
