// Barrel: preserves `@/lib/chat/nlp` import path.
// Logic lives in ./nlp/* modules, each under 400 lines.
export { tokenize, stem } from './tokenizer';
export type { ExtractedEntities } from './nlp/entities';
export { extractEntities } from './nlp/entities';
export type { IntentClassification } from './nlp/classify';
export { classifyIntent } from './nlp/classify';
export { detectExpertise } from './nlp/expertise';
export { isGibberish, tryEvaluateMath } from './nlp/text-utils';
export {
  detectFuzzyCommand,
  fuzzyContainsWord,
  fuzzyStartsWithPhrase,
  fuzzyWordMatch,
  strippedWords,
} from './nlp/fuzzy';
export type { FuzzyCommand } from './nlp/fuzzy';
