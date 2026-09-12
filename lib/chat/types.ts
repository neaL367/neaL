export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export type IntentType =
  | 'quiz_answer'
  | 'command'
  | 'personal'
  | 'technical'
  | 'conversational'
  | 'joke'
  | 'clarification'
  | 'continuation'
  | 'rejection'
  | 'fallback';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  difficulty: ExpertiseLevel;
}

export interface QuizState {
  question: QuizQuestion;
  userAnswerIndex?: number;
  isCorrect?: boolean;
  answered: boolean;
  attempts?: number;
}

export type RetrievalLane = 'topic' | 'kg' | 'bm25' | 'semantic' | 'web';

export interface RetrievalHit {
  id: string;
  title: string;
  heading?: string;
  excerpt: string;
  url?: string;
  score: number;
  lane: RetrievalLane;
  contextSentence?: string;
}

export type ConceptRelation = 'uses' | 'built-on' | 'relates-to' | 'contrasts-with' | 'enables';

export interface ConceptNode {
  id: string;
  label: string;
  aliases: string[];
  description: string;
  category: 'languages' | 'frameworks' | 'architecture' | 'performance' | 'tools' | 'personal';
}

export interface ConceptEdge {
  from: string;
  to: string;
  relation: ConceptRelation;
  annotation?: string;
}

export type OfferType = 'code_example' | 'deep_dive' | 'quiz' | 'topic_exploration';

export interface PendingOffer {
  type: OfferType;
  subjectId: string;
  title: string;
  suggestedAtTurn: number;
}

export interface ConversationState {
  turns: ConversationTurn[];
  topicThread: string[];
  activeQuiz: QuizState | null;
  expertiseLevel: ExpertiseLevel;
  roundRobinCursors: Record<string, number>;
  lastRetrievalHits: RetrievalHit[];
  pendingOffer?: PendingOffer | null;
}

export type NaraStreamChunk =
  | { type: 'text'; payload: string }
  | {
      type: 'sources';
      payload: Array<{
        title: string;
        heading?: string;
        url?: string;
        excerpt: string;
      }>;
    }
  | { type: 'suggestions'; payload: string[] }
  | { type: 'state'; payload: Partial<ConversationState> }
  | { type: 'error'; payload: { code: string; message: string } }
  | { type: 'done' };

export interface ChatRequestBody {
  message: string;
  state?: Partial<ConversationState>;
}
