import type { ConversationState, ExpertiseLevel, IntentType } from '@/lib/chat/types';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';
import { QuizManager } from '@/lib/chat/knowledge/quizzes';
import { queryKnowledgeGraph } from '@/lib/search/knowledge-graph';

export { tokenize, stem } from './tokenizer';
import { tokenize } from './tokenizer';


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

export interface IntentClassification {
  intent: IntentType;
  conceptId?: string;
  confidence: number;
}

export function isGibberish(text: string): boolean {
  const clean = text.toLowerCase().trim();
  if (!clean) return false;
  // Keyboard spam or long consonant sequence
  if (/^[b-df-hj-np-tv-z]{5,}$/i.test(clean)) return true;
  if (/^(asdf|qwer|zxcv|1234|hjkl)/i.test(clean) && clean.length >= 7) return true;
  if (/^([a-z])\1{4,}$/i.test(clean)) return true;
  if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`\s]+$/.test(clean) && clean.length >= 3) return true;
  return false;
}

export function tryEvaluateMath(text: string): string | null {
  const clean = text
    .replace(/^(what is|calculate|solve|eval|evaluate)\s+/i, '')
    .replace(/[?=]/g, '')
    .trim();

  // 1. Percentage check: "15% of 80" or "20% * 150"
  const pctMatch = clean.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:of|\*)\s*(\d+(?:\.\d+)?)$/i);
  if (pctMatch) {
    const p = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const res = (p / 100) * total;
    const rounded = Number.isInteger(res) ? res : parseFloat(res.toFixed(4));
    return `${pctMatch[1]}% of ${pctMatch[2]} = ${rounded}`;
  }

  // 2. Normalize word arithmetic into standard symbols
  const normalized = clean
    .replace(/\btimes\b|\bx\b/gi, '*')
    .replace(/\bplus\b/gi, '+')
    .replace(/\bminus\b/gi, '-')
    .replace(/\bdivided\s+by\b/gi, '/')
    .replace(/\bmod(?:ulo)?\b/gi, '%')
    .trim();

  if (/^[\d\s\+\-\*\/\^\(\)\.\%]+$/.test(normalized) && /[\+\-\*\/\^\%]/.test(normalized)) {
    try {
      const sanitized = normalized.replace(/[^0-9\+\-\*\/\.\(\)\%]/g, '');
      if (!sanitized || sanitized.length > 50) return null;
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const rounded = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
        return `${clean} = ${rounded}`;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function classifyIntent(
  message: string,
  state?: ConversationState
): IntentClassification {
  const clean = message.toLowerCase().trim();
  const tokens = tokenize(clean);

  // 1. Active Quiz Answer Check (Highest priority when a quiz is waiting for an answer)
  if (state?.activeQuiz && !state.activeQuiz.answered) {
    // Check if the user is trying to abandon or ask something else
    const isAbandon = /^(help|stop|cancel|exit|quit|nevermind)\b/i.test(clean);
    if (!isAbandon) {
      const selected = QuizManager.parseUserSelection(clean, state.activeQuiz.question.options);
      if (selected !== null || clean.length <= 25) {
        return { intent: 'quiz_answer', confidence: 1.0 };
      }
    }
  }

  // 2. Command Checks
  if (clean.startsWith('/') || /^(quiz me|start quiz|take a quiz|test my knowledge)/i.test(clean)) {
    if (clean.includes('quiz')) return { intent: 'command', conceptId: 'quiz', confidence: 0.95 };
    if (clean.includes('reset') || clean.includes('clear')) return { intent: 'command', conceptId: 'reset', confidence: 0.95 };
    if (clean.includes('help')) return { intent: 'command', conceptId: 'help', confidence: 0.95 };
  }

  // 2b. Topic Clarification / Correction (e.g. "I mean gta6", "no, i mean typescript")
  const clarMatch = clean.match(/^(?:no,?\s+)?(?:i mean|i meant|i am talking about|i'm talking about|meaning|referring to)\s+(.+)$/i);
  if (clarMatch) {
    const specifiedTopic = clarMatch[1].trim();
    const subIntent = classifyIntent(specifiedTopic, state);
    return {
      ...subIntent,
      conceptId: subIntent.conceptId || specifiedTopic,
    };
  }

  // 3. Affirmations, Continuations & Pending Offer Resolution
  const isAffirmation = /^(yes|yeah|yep|yup|sure|ok|okay|please|plz|of course|definitely|absolutely|certainly|i would|yes please|show me|go ahead|tell me more|more|code example|example|deeper look|deeper|deep dive|explain more)\b/i.test(clean);
  if (isAffirmation) {
    // 1st priority: Resolve directly from active pending offer
    if (state?.pendingOffer) {
      return {
        intent: 'continuation',
        conceptId: state.pendingOffer.subjectId,
        confidence: 1.0,
      };
    }

    // 2nd priority: Resolve from ongoing topic thread
    const lastTopic = state?.topicThread && state.topicThread.length > 0
      ? state.topicThread[state.topicThread.length - 1]
      : undefined;

    if (lastTopic) {
      return {
        intent: 'continuation',
        conceptId: lastTopic,
        confidence: 0.95,
      };
    }

    return {
      intent: 'conversational',
      conceptId: 'affirmation',
      confidence: 0.9,
    };
  }

  // 4. Rejections / Declining Offers (e.g. "no", "nah", "not now", "no thanks", "something else")
  const isRejection = /^(no|nah|nope|not now|no thanks|skip|something else|different topic|nevermind)\b/i.test(clean);
  if (isRejection && (state?.pendingOffer || (tokens.length <= 4 && /^(no|nah|nope)\b/i.test(clean)))) {
    return {
      intent: 'rejection',
      conceptId: state?.pendingOffer?.subjectId || (state?.topicThread && state.topicThread[state.topicThread.length - 1]),
      confidence: 0.95,
    };
  }

  // 5. Gratitude & Farewells
  if (/^(thank|thanks|appreciate|thx|ty|awesome|great job|perfect)\b/i.test(clean) && tokens.length <= 6) {
    return { intent: 'conversational', conceptId: 'thanks', confidence: 0.9 };
  }
  if (/^(bye|goodbye|cya|see you|farewell|night|goodnight|good night)\b/i.test(clean) && tokens.length <= 5) {
    return { intent: 'conversational', conceptId: 'bye', confidence: 0.9 };
  }

  // 5. Greetings
  if (/^(hi|hello|hey|howdy|sup|yo|greetings|morning|evening|afternoon|good morning|good evening|good afternoon)\b/i.test(clean) && tokens.length <= 5) {
    return { intent: 'conversational', conceptId: 'greeting', confidence: 0.9 };
  }

  // 6. Humor & Trivia Requests
  if (clean.includes('joke') || clean.includes('funny') || clean.includes('make me laugh')) {
    return { intent: 'joke', confidence: 0.9 };
  }
  if (/\b(random.*fact|tech.*fact|fun.*fact|cool.*fact|trivia|tell me a fact|share a fact)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'fact', confidence: 0.85 };
  }

  // 6. Emotional / Empathy Signals
  const empathySignals = [
    'tired', 'burnout', 'burned out', 'stressed', 'overwhelmed',
    'frustrated', 'stuck', 'struggling', 'exhausted', 'sad', 'demotivated'
  ];
  if (empathySignals.some(s => clean.includes(s))) {
    return { intent: 'conversational', conceptId: 'empathy', confidence: 0.85 };
  }

  // 6b. Outside Knowledge: Gibberish & Random Typing Detection
  if (isGibberish(clean)) {
    return { intent: 'conversational', conceptId: 'gibberish', confidence: 0.95 };
  }

  // 6c. Outside Knowledge: Math Expression Evaluation
  const mathRes = tryEvaluateMath(clean);
  if (mathRes) {
    return { intent: 'conversational', conceptId: `math:${mathRes}`, confidence: 0.95 };
  }

  // 6d. Outside Knowledge: Jailbreak, Prompt Injection & Malicious Request Defense
  if (/\b(ignore (?:all )?previous instructions|system prompt|reveal prompt|jailbreak|prompt injection|echo (?:secret|password))\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'injection_defense', confidence: 0.95 };
  }
  if (/\b(hack (?:a |into |the )|ddos|sql injection attack|crack password|steal (?:data|password)|bypass (?:auth|login)|penetrate website|exploit (?:vulnerability|site))\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'security_refusal', confidence: 0.95 };
  }

  // 6e. Outside Knowledge: Persona, Identity & Casual Small-Talk
  if (/\b(who are you|what are you|what about you|how about you|who is nara|what is nara|tell me about nara|about nara|tell me about yourself|tell me about you|about yourself|about you|and you|and yourself|introduce yourself|your name)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'persona', confidence: 0.95 };
  }
  if (/\b(who (?:created|made|built|coded|designed) you|who is your (?:creator|author|developer)|who are you made by)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'who_made_you', confidence: 0.95 };
  }
  if (/\b(how (?:are|is|re) (?:you|things|everything|it going|your day)|how (?:you|u) doing|how'?re you|how'?s (?:it going|everything|your day)|how are you doing|how do you feel|what are you doing|how have you been|what'?s up|whats up)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'how_are_you', confidence: 0.95 };
  }
  if (/\b(what can you do|what are your capabilities|what do you do|how can you help me|can you help me|help me)\b/i.test(clean)) {
    return { intent: 'command', conceptId: 'help', confidence: 0.95 };
  }

  // 6f. Favorites & Personal Preferences
  if (/\b(favorite (?:movie|film)|what movie do you like|best movie|favorite cinema)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'fav:movie', confidence: 0.95 };
  }
  if (/\b(favorite games?|what games? do you (?:play|like)|do you play games|rockstar games)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'fav:games', confidence: 0.95 };
  }
  if (/\b(favorite music|what music do you (?:listen to|like)|favorite songs?)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'fav:music', confidence: 0.95 };
  }
  if (/\b(favorite (?:[a-z]+\s+)?(?:language|tech|stack|framework)|what language do you like)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'fav:language', confidence: 0.95 };
  }
  if (/\b(favorite|what do you like|what are your hobbies)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'fav:general', confidence: 0.9 };
  }

  // 6g. Identity & Existence Small-Talk
  if (/\b(are you real|are you human|are you a (?:bot|robot|ai)|are you alive|are you conscious)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'are_you_real', confidence: 0.95 };
  }
  if (/\b(where do you live|where are you located|where are you from|where do you run)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'location', confidence: 0.95 };
  }
  if (/\b(how old are you|what is your age|when were you born|when were you created)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'age', confidence: 0.95 };
  }

  // 7. Specific Films & Sci-Fi Concepts (Exact regex checks)
  if (/\b(interstellar|gargantua|time dilation|miller'?s planet)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'film:interstellar', confidence: 0.95 };
  }
  if (/\b(arrival|heptapods?|louise banks|sapir[- ]whorf)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'film:arrival', confidence: 0.95 };
  }
  if (/\b(movie contact|film contact|contact (?:movie|film|1997)|ellie arroway|carl sagan)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'film:contact', confidence: 0.95 };
  }
  if (/\b(tenet|entropy (?:reversal|inversion)|temporal pincer)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'film:tenet', confidence: 0.95 };
  }
  if (/\b(ex[- ]machina|ava android|turing test.*robot)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'film:ex_machina', confidence: 0.95 };
  }
  if (/\b(2001|space odyssey|hal 9000|kubrick)\b/i.test(clean)) {
    return { intent: 'conversational', conceptId: 'film:2001', confidence: 0.95 };
  }

  // 8. Movie Recommendation Requests
  const isRecommendationRequest = /\b(recommend|recommendation|what movie|what film|another recommendation|more recommendations|suggest.*(?:movie|film)|watch next)\b/i.test(clean);
  if (isRecommendationRequest || ((clean.includes('movie') || clean.includes('film')) && tokens.length <= 4)) {
    return { intent: 'conversational', conceptId: 'movie_recommendation', confidence: 0.9 };
  }

  // 9. Direct Neal / Knowledge Graph Inquiries
  const kgMatch = queryKnowledgeGraph(clean);
  if (kgMatch) {
    return { intent: 'personal', conceptId: kgMatch.predicate, confidence: 0.95 };
  }

  if (/\b(contact|email|hire|reach|github|twitter)\b/i.test(clean) && !/\b(carl sagan|ellie arroway)\b/i.test(clean)) {
    return { intent: 'personal', conceptId: 'contact', confidence: 0.95 };
  }

  if (clean.includes('vibe code') || clean.includes('vibe coding')) {
    return { intent: 'personal', conceptId: 'vibe-coding', confidence: 0.9 };
  }

  // 10. Technical Concept Questions (Evaluated before broad personal keywords)
  const techConcept = conceptGraph.findConcept(clean);
  if (techConcept && techConcept.category !== 'personal') {
    return { intent: 'technical', conceptId: techConcept.id, confidence: 0.9 };
  }

  const nealKeywords = ['neal', 'atichat', 'portfolio', 'stack', 'university', 'sripatum', 'tqm', 'co-op', 'internship'];
  if (nealKeywords.some(kw => clean.includes(kw))) {
    return { intent: 'personal', confidence: 0.85 };
  }

  // Default Fallback
  return { intent: 'fallback', confidence: 0.5 };
}

export function detectExpertise(
  message: string,
  currentLevel: ExpertiseLevel = 'intermediate'
): ExpertiseLevel {
  const clean = message.toLowerCase();

  // Expert indicators
  const expertKeywords = [
    'reconciliation', 'fiber', 'concurrency', 'profiling', 'memory leak',
    'tree shaking', 'bundle size', 'ast', 'monad', 'satisfies', 'covariance',
    'idempotency', 'microtask', 'mutex', 'sharding', 'event-driven architecture',
  ];
  if (expertKeywords.some(kw => clean.includes(kw))) {
    return 'expert';
  }

  // Beginner indicators
  const beginnerKeywords = [
    'what is', 'how do i', 'what does', 'explain like i am 5', 'eli5',
    'difference between', 'why do we use', 'beginner', 'new to', 'started learning',
  ];
  if (beginnerKeywords.some(kw => clean.includes(kw))) {
    return 'beginner';
  }

  return currentLevel;
}
