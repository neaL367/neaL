/**
 * Nara V2 barrel — the public surface of the engine.
 *
 * Everything outside `lib/nara` imports from here. Keeping one entry point is
 * what makes it possible to delete `lib/chat` and `lib/search` wholesale
 * without leaving a second, subtly different code path behind.
 */
export { respond, respond as default, createState, sanitizeState } from './respond';
export type { RespondInput, RespondOutput } from './respond';
export { analyze } from './language/query';
export { normalize, looksNonEnglish, isEffectivelyEmpty } from './language/normalize';
export { tokenize, contentTokens, stem, indexVariants } from './language/text';
export { retrieve, computeConfidence } from './retrieval/index';
export { compose } from './compose/index';
export type * from './types';

import { respond as _respond } from './respond';
import type { ComposedAnswer } from './types';

/**
 * Convenience wrapper used by the API route: one message in, one answer out.
 */
export function answer(message: string, state?: unknown): ComposedAnswer {
  return _respond({ message, state }).answer;
}
