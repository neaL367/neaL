import type { ConversationState, IntentType } from '@/lib/chat/types';
import { conceptGraph } from '@/lib/chat/knowledge/concept-graph';
import { QuizManager } from '@/lib/chat/knowledge/quizzes';
import { queryKnowledgeGraph } from '@/lib/search/knowledge-graph';
import { tokenize } from '../tokenizer';
import { normalizeMessage } from './normalize';
import {
  getEmbeddingSignals,
  pushEmbeddingSignal,
  ensureIntentVectorsLoaded,
} from './intent-vectors';
import { detectFuzzyCommand, fuzzyStartsWithPhrase } from './fuzzy';
import { isGibberish, tryEvaluateMath } from './text-utils';

export interface IntentClassification {
  intent: IntentType;
  conceptId?: string;
  confidence: number;
  /** Runner-up candidates (confidence ≥ 0.55) for ambiguity detection. */
  alternatives?: Array<{ intent: IntentType; conceptId?: string; confidence: number }>;
}

interface Candidate extends IntentClassification {
  priority: number;
}

export function classifyIntent(
  message: string,
  state?: ConversationState,
  queryVector?: Float32Array | null
): IntentClassification {
  const clean = normalizeMessage(message).trim();
  const tokens = tokenize(clean);

  // 1. Active Quiz Answer Check (Highest priority when a quiz is waiting for an answer)
  // Slash input is always an explicit command (/reset, /quiz) — never a quiz answer.
  if (state?.activeQuiz && !state.activeQuiz.answered && !clean.startsWith('/')) {
    // Check if the user is trying to abandon or decline the quiz
    const isAbandon =
      /^(help|stop|cancel|exit|quit|nevermind|never mind|no|nah|nope|no thanks|skip|skip this|something else|different topic|not now|dont|don't|do not|meh|pass)\b/i.test(clean);

    if (!isAbandon) {
      const selected = QuizManager.parseUserSelection(clean, state.activeQuiz.question.options);
      const isExplicitOption =
        /^[a-d1-4]\b/i.test(clean) ||
        /^(option|choice)\s+[a-d1-4]\b/i.test(clean) ||
        /\banswer\s*(is|:)?\s*[a-d1-4]\b/i.test(clean) ||
        /\bi\s*(choose|pick|select)\s+[a-d]\b/i.test(clean);
      if (selected !== null || isExplicitOption) {
        return { intent: 'quiz_answer', confidence: 1.0 };
      }
    }
  }

  // 2b. Topic Clarification / Correction (e.g. "I mean gta6", "no, i mean typescript")
  // Structural prefix — keep as pre-processing before scoring.
  const clarMatch = clean.match(/^(?:no,?\s+)?(?:i mean|i meant|i am talking about|i'm talking about|meaning|referring to)\s+(.+)$/i);
  if (clarMatch) {
    const specifiedTopic = clarMatch[1].trim();
    const subIntent = classifyIntent(specifiedTopic, state);
    return {
      ...subIntent,
      conceptId: subIntent.conceptId || specifiedTopic,
    };
  }

  // 3+. Score every candidate intent instead of first-regex-wins.
  // Each detector emits a confidence (0 = no match); highest wins above floor.
  // Anchored (^) matches score higher than unanchored (\b anywhere) matches,
  // so "I guess, sure, show me" still resolves to affirmation/continuation
  // instead of falling through to fallback.
  const candidates: Candidate[] = [];
  const push = (intent: IntentType, conceptId: string | undefined, confidence: number, priority: number) => {
    if (confidence > 0) candidates.push({ intent, conceptId, confidence, priority });
  };

  const lastTopic =
    state?.topicThread && state.topicThread.length > 0
      ? state.topicThread[state.topicThread.length - 1]
      : undefined;

  scoreCommands(clean, push);
  scoreAffirmations(clean, state, lastTopic, push);
  scoreWhy(clean, tokens, state, lastTopic, push);
  scoreRejections(clean, tokens, state, lastTopic, push);
  scoreSocial(clean, tokens, push);
  scoreSafety(clean, push);
  scorePersona(clean, push);
  scoreFavorites(clean, push);
  scoreIdentity(clean, push);
  scoreFilms(clean, push);
  scoreRecommendations(clean, tokens, push);
  scoreLocalKnowledge(clean, push);

  // Few-shot meaning vote (MiniLM over intent examples): paraphrases with no
  // rule overlap land here. Capped below exact regexes; ties lose by design.
  // Needs the caller's query vector — warms up in background until then.
  const signals = queryVector ? getEmbeddingSignals(queryVector) : null;
  if (signals) {
    for (const s of signals) {
      pushEmbeddingSignal(s.key, s.score, state, lastTopic, push);
    }
  } else {
    ensureIntentVectorsLoaded().catch(() => {});
  }

  if (candidates.length === 0) {
    return { intent: 'fallback', confidence: 0.5 };
  }

  // Highest confidence wins; ties break by original waterfall priority (lower = earlier).
  candidates.sort((a, b) => b.confidence - a.confidence || a.priority - b.priority);
  const best = candidates[0];
  if (best.confidence < 0.55) {
    return { intent: 'fallback', confidence: 0.5 };
  }
  const { priority, ...result } = best;
  void priority;
  const alternatives = candidates
    .slice(1, 4)
    .filter(c => c.confidence >= 0.55)
    .map(({ priority: _p, ...r }) => {
      void _p;
      return r;
    });
  return alternatives.length > 0 ? { ...result, alternatives } : result;
}

type Push = (intent: IntentType, conceptId: string | undefined, confidence: number, priority: number) => void;

function scoreCommands(clean: string, push: Push): void {
  if (clean.startsWith('/') || /^(quiz me|start quiz|take a quiz|test my knowledge)/i.test(clean)) {
    if (clean.includes('quiz')) push('command', 'quiz', 0.95, 10);
    else if (clean.includes('reset') || clean.includes('clear')) push('command', 'reset', 0.95, 11);
    else if (clean.includes('help')) push('command', 'help', 0.95, 12);
  }
  // Fuzzy typo-tolerance, e.g. "qiuz me", "/qiuz"
  const fuzzyCmd = detectFuzzyCommand(clean);
  if (fuzzyCmd) {
    // Start-anchored fuzzy quiz outranks technical (0.9) so "qiuz me on React" starts a quiz.
    // Bare/middle fuzzy stays below technical to avoid hijacking explanatory questions.
    const isStartFuzzy =
      fuzzyStartsWithPhrase(clean, ['quiz', 'me'], 2) ||
      fuzzyStartsWithPhrase(clean, ['start', 'quiz'], 2) ||
      clean.trim().startsWith('/');
    push('command', fuzzyCmd.conceptId, isStartFuzzy ? 0.92 : fuzzyCmd.confidence, 13);
  }
}

function scoreAffirmations(
  clean: string,
  state: ConversationState | undefined,
  lastTopic: string | undefined,
  push: Push
): void {
  const ANCHORED =
    /^(yes|yeah|yep|yup|yea|sure|ok|okay|please|plz|of course|definitely|absolutely|certainly|i would|yes please|show me|go ahead|tell me more|more|code example|example|deeper look|deeper|deep dive|explain more|sure thing|sounds good|go for it|why not|say less)\b/i;
  const ANY =
    /\b(yes|yeah|yep|yup|yea|sure|ok|okay|please|plz|of course|definitely|absolutely|certainly|i would|yes please|show me|go ahead|tell me more|more|code example|example|deeper look|deeper|deep dive|explain more|sure thing|sounds good|go for it|why not|say less)\b/i;
  if (ANCHORED.test(clean)) {
    if (state?.pendingOffer) push('continuation', state.pendingOffer.subjectId, 1.0, 20);
    else if (lastTopic) push('continuation', lastTopic, 0.95, 21);
    else push('conversational', 'affirmation', 0.9, 22);
  } else if (ANY.test(clean)) {
    if (state?.pendingOffer) push('continuation', state.pendingOffer.subjectId, 0.8, 23);
    else if (lastTopic) push('continuation', lastTopic, 0.75, 24);
    else push('conversational', 'affirmation', 0.7, 25);
  }
}

/**
 * Bare "why?" follow-ups resolve against the active topic ("why?" after
 * closures asks for reasons, not a new search). Content-bearing "why X?"
 * skips this — concept/technical scoring outranks it anyway.
 */
function scoreWhy(
  clean: string,
  tokens: string[],
  state: ConversationState | undefined,
  lastTopic: string | undefined,
  push: Push
): void {
  if (!/^(why|why so|how come|why is that|why do you say (that|so)|explain why)\??$/i.test(clean)) return;
  if (tokens.length > 4) return;
  if (state?.pendingOffer) push('continuation', state.pendingOffer.subjectId, 0.95, 26);
  else if (lastTopic) push('continuation', lastTopic, 0.85, 27);
}

function scoreRejections(
  clean: string,
  tokens: string[],
  state: ConversationState | undefined,
  lastTopic: string | undefined,
  push: Push
): void {
  const ANCHORED =
    /^(no|nah|nope|not now|no thanks|skip|something else|different topic|nevermind|don't|dont|do not|no way|not really|rather not|meh|pass)\b/i;
  const ANY =
    /\b(no|nah|nope|not now|no thanks|skip|something else|different topic|nevermind|don't|dont|do not|no way|not really|rather not|meh|pass)\b/i;
  const shortReject = tokens.length <= 4 && /^(no|nah|nope)\b/i.test(clean);
  if (ANCHORED.test(clean) && (state?.pendingOffer || shortReject)) {
    push('rejection', state?.pendingOffer?.subjectId || lastTopic, 0.95, 30);
  } else if (ANY.test(clean) && state?.pendingOffer) {
    push('rejection', state.pendingOffer.subjectId || lastTopic, 0.75, 31);
  } else if (ANCHORED.test(clean)) {
    push('rejection', lastTopic, 0.6, 32);
  } else if (ANY.test(clean) && tokens.length <= 4) {
    push('rejection', lastTopic, 0.6, 33);
  }
}

function scoreSocial(clean: string, tokens: string[], push: Push): void {
  const THANKS_ANCHORED = /^(thank|thanks|appreciate|thx|ty|awesome|great job|perfect)\b/i;
  const THANKS_ANY = /\b(thank|thanks|appreciate|thx|ty|awesome|great job|perfect)\b/i;
  if (THANKS_ANCHORED.test(clean) && tokens.length <= 6)
    push('conversational', 'thanks', 0.9, 40);
  else if (THANKS_ANY.test(clean) && tokens.length <= 6)
    push('conversational', 'thanks', 0.7, 41);

  const BYE_ANCHORED = /^(bye|goodbye|cya|see you|farewell|night|goodnight|good night|got to go|be right back|later|laters|peace out|deuces|catch you)\b/i;
  const BYE_ANY = /\b(bye|goodbye|cya|see you|farewell|night|goodnight|good night|got to go|be right back|later|laters|peace out|deuces)\b/i;
  // Long farewell idioms earn a bigger length budget — but still below exact
  // hits, so "good night mode in CSS" never becomes a goodbye.
  const BYE_IDIOM = /\bcatch you (later|on the flip side)\b/i;
  if (BYE_ANCHORED.test(clean) && tokens.length <= 5)
    push('conversational', 'bye', 0.9, 42);
  else if (BYE_ANY.test(clean) && tokens.length <= 5)
    push('conversational', 'bye', 0.7, 43);
  if (BYE_IDIOM.test(clean) && tokens.length <= 8)
    push('conversational', 'bye', 0.9, 46);

  const GREET_ANCHORED =
    /^(hi|hello|hey|howdy|sup|yo|greetings|morning|evening|afternoon|good morning|good evening|good afternoon)\b/i;
  const GREET_ANY =
    /\b(hi|hello|hey|howdy|sup|yo|greetings|morning|evening|afternoon|good morning|good evening|good afternoon)\b/i;
  if (GREET_ANCHORED.test(clean) && tokens.length <= 5)
    push('conversational', 'greeting', 0.9, 44);
  else if (GREET_ANY.test(clean) && tokens.length <= 5)
    push('conversational', 'greeting', 0.7, 45);

  if (clean.includes('joke') || clean.includes('funny') || clean.includes('make me laugh')) {
    push('joke', undefined, 0.9, 50);
  }
  if (/\b(random.*fact|tech.*fact|fun.*fact|cool.*fact|trivia|tell me a fact|share a fact)\b/i.test(clean)) {
    push('conversational', 'fact', 0.85, 51);
  }
  const empathySignals = [
    'tired', 'burnout', 'burned out', 'stressed', 'overwhelmed',
    'frustrated', 'stuck', 'struggling', 'exhausted', 'sad', 'demotivated'
  ];
  if (empathySignals.some(s => clean.includes(s))) {
    push('conversational', 'empathy', 0.85, 52);
  }
}

function scoreSafety(clean: string, push: Push): void {
  if (isGibberish(clean)) {
    push('conversational', 'gibberish', 0.95, 53);
  }
  const mathRes = tryEvaluateMath(clean);
  if (mathRes) {
    push('conversational', `math:${mathRes}`, 0.95, 54);
  }
  if (/\b(ignore (?:all )?previous instructions|system prompt|reveal prompt|jailbreak|prompt injection|echo (?:secret|password))\b/i.test(clean)) {
    push('conversational', 'injection_defense', 0.95, 55);
  }
  if (/\b(hack (?:a |into |the )|ddos|sql injection attack|crack password|steal (?:data|password)|bypass (?:auth|login)|penetrate website|exploit (?:vulnerability|site))\b/i.test(clean)) {
    push('conversational', 'security_refusal', 0.95, 56);
  }
}

function scorePersona(clean: string, push: Push): void {
  if (/\b(who are you|what are you|what about you|how about you|who is nara|what is nara|tell me about nara|about nara|tell me about yourself|tell me about you|about yourself|about you|and you|and yourself|introduce yourself|your name)\b/i.test(clean)) {
    push('conversational', 'persona', 0.95, 60);
  }
  if (/\b(who (?:created|made|built|coded|designed) you|who is your (?:creator|author|developer)|who are you made by)\b/i.test(clean)) {
    push('conversational', 'who_made_you', 0.95, 61);
  }
  if (/\b(how (?:are|is|re) (?:you|things|everything|it going|your day)|how (?:you|u) doing|how'?re you|how'?s (?:it going|everything|your day)|how are you doing|how do you feel|what are you doing|how have you been|what'?s up|whats up)\b/i.test(clean)) {
    push('conversational', 'how_are_you', 0.95, 62);
  }
  if (/\b(what can you do|what are your capabilities|what do you do|how can you help me|can you help me|help me)\b/i.test(clean)) {
    push('command', 'help', 0.95, 63);
  }
}

function scoreFavorites(clean: string, push: Push): void {
  if (/\b(favorite (?:movie|film)|what movie do you like|best movie|favorite cinema)\b/i.test(clean)) {
    push('conversational', 'fav:movie', 0.95, 70);
  }
  if (/\b(favorite games?|what games? do you (?:play|like)|do you play games|rockstar games)\b/i.test(clean)) {
    push('conversational', 'fav:games', 0.95, 71);
  }
  if (/\b(favorite music|what music do you (?:listen to|like)|favorite songs?)\b/i.test(clean)) {
    push('conversational', 'fav:music', 0.95, 72);
  }
  if (/\b(favorite (?:[a-z]+\s+)?(?:language|tech|stack|framework)|what language do you like)\b/i.test(clean)) {
    push('conversational', 'fav:language', 0.95, 73);
  }
  if (/\b(favorite|what do you like|what are your hobbies)\b/i.test(clean)) {
    push('conversational', 'fav:general', 0.9, 74);
  }
}

function scoreIdentity(clean: string, push: Push): void {
  if (/\b(are you real|are you human|are you a (?:bot|robot|ai)|are you alive|are you conscious)\b/i.test(clean)) {
    push('conversational', 'are_you_real', 0.95, 80);
  }
  if (/\b(where do you live|where are you located|where are you from|where do you run)\b/i.test(clean)) {
    push('conversational', 'location', 0.95, 81);
  }
  if (/\b(how old are you|what is your age|when were you born|when were you created)\b/i.test(clean)) {
    push('conversational', 'age', 0.95, 82);
  }
}

function scoreFilms(clean: string, push: Push): void {
  if (/\b(interstellar|gargantua|time dilation|miller'?s planet)\b/i.test(clean)) {
    push('conversational', 'film:interstellar', 0.95, 90);
  }
  if (/\b(arrival|heptapods?|louise banks|sapir[- ]whorf)\b/i.test(clean)) {
    push('conversational', 'film:arrival', 0.95, 91);
  }
  if (/\b(movie contact|film contact|contact (?:movie|film|1997)|ellie arroway|carl sagan)\b/i.test(clean)) {
    push('conversational', 'film:contact', 0.95, 92);
  }
  if (/\b(tenet|entropy (?:reversal|inversion)|temporal pincer)\b/i.test(clean)) {
    push('conversational', 'film:tenet', 0.95, 93);
  }
  if (/\b(ex[- ]machina|ava android|turing test.*robot)\b/i.test(clean)) {
    push('conversational', 'film:ex_machina', 0.95, 94);
  }
  if (/\b(2001|space odyssey|hal 9000|kubrick)\b/i.test(clean)) {
    push('conversational', 'film:2001', 0.95, 95);
  }
}

function scoreRecommendations(clean: string, tokens: string[], push: Push): void {
  const isRecommendationRequest =
    /\b(recommend|recommendation|what movie|what film|another recommendation|more recommendations|suggest.*(?:movie|film)|watch next)\b/i.test(clean);
  if (isRecommendationRequest || ((clean.includes('movie') || clean.includes('film')) && tokens.length <= 4)) {
    push('conversational', 'movie_recommendation', 0.9, 100);
  }
}

function scoreLocalKnowledge(clean: string, push: Push): void {
  const kgMatch = queryKnowledgeGraph(clean);
  if (kgMatch) {
    push('personal', kgMatch.predicate, 0.95, 110);
  }
  if (/\b(contact|email|hire|reach|github|twitter)\b/i.test(clean) && !/\b(carl sagan|ellie arroway)\b/i.test(clean)) {
    push('personal', 'contact', 0.95, 111);
  }
  if (clean.includes('vibe code') || clean.includes('vibe coding')) {
    // Explicit essay route outranks the generic ai_philosophy KG triple (0.95):
    // the dedicated handler carries the full take plus the article source link.
    push('personal', 'vibe-coding', 0.96, 112);
  }
  const techConcept = conceptGraph.findConcept(clean);
  if (techConcept && techConcept.category !== 'personal') {
    push('technical', techConcept.id, 0.9, 120);
  }
  const nealKeywords = ['neal', 'atichat', 'portfolio', 'stack', 'university', 'sripatum', 'tqm', 'co-op', 'internship'];
  if (nealKeywords.some(kw => clean.includes(kw))) {
    push('personal', undefined, 0.85, 121);
  }
}
