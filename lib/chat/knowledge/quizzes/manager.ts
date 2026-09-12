import type { QuizState, ExpertiseLevel } from '@/lib/chat/types';
import { levenshteinDistance } from '@/lib/chat/text-distance';
import { QUIZZES } from './questions';

export class QuizManager {
  static startQuiz(preferredTopic?: string | string[], preferredDifficulty?: ExpertiseLevel): QuizState {
    let pool = QUIZZES;

    // Try each preferred topic in specificity order; first one with matches wins.
    // (Entity ids like "react-19" rarely equal quiz topic names like "React",
    // so fall through the ranked concept list instead of all-or-nothing.)
    // Matching is bidirectional: "react-19" narrows to "React" quizzes.
    const prefs = Array.isArray(preferredTopic)
      ? preferredTopic
      : preferredTopic
        ? [preferredTopic]
        : [];
    for (const pref of prefs) {
      const low = pref.toLowerCase();
      const topicMatches = pool.filter(q => {
        const topic = q.topic.toLowerCase();
        return topic.includes(low) || low.includes(topic);
      });
      if (topicMatches.length > 0) {
        pool = topicMatches;
        break;
      }
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

    // 0. Natural answer phrasing anywhere: "my answer is B", "answer: c", "I choose A"
    const answerMatch = clean.match(/(?:\banswer\s*(?:is|:)?|\bchoice|\boption|\bletter|\bi\s*(?:choose|pick|select|think))\s*\(?([a-d1-4])\)?(?![a-z0-9])/);
    if (answerMatch) {
      const token = answerMatch[1];
      const idx = /[a-d]/.test(token) ? token.charCodeAt(0) - 97 : parseInt(token, 10) - 1;
      if (idx >= 0 && idx < options.length) return idx;
    }

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
            // Strict for short words: dist-2 on ≤6 chars collides
            // ("reset"≈"test" hijacked /reset mid-quiz). Longer words keep 2.
            const allowed = cw.length >= 7 ? 2 : 1;
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

