/**
 * Client-side helpers for the chat UI.
 *
 * These exist so the UI does not depend on the legacy `lib/chat` tree. The
 * important property is that NOTHING here is trusted: the server re-validates
 * all of it. `sanitizeState` on the server is the authority, and the client
 * copy only prevents obviously malformed data from being persisted and sent in
 * the first place.
 */
import type { DialogueState } from './types';
import { createState, sanitizeState } from './dialogue/state';

export { createState as createInitialState, sanitizeState, STATE_VERSION } from './dialogue/state';
export type { DialogueState };

/**
 * Strip characters the engine cannot use from in-progress input.
 *
 * Deliberately NOT the legacy rule. The legacy `stripNonEnglish` was
 * `/[^\x20-\x7E\s]/`, which deleted every non-ASCII character — including the
 * curly apostrophe (U+2019) and en/em dashes that the site's own content uses,
 * and that users type routinely ("don’t", "Nara’s"). It also rejected them at
 * the API boundary with a 400.
 *
 * This removes only things with no textual meaning: emoji, pictographs and
 * control characters. Letters, apostrophes, dashes, CJK and accented text all
 * survive, and the engine's own `normalize()` handles them properly.
 */
export function stripUnusableInput(value: string): string {
  return value
    // Control characters, excluding tab/newline.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Emoji and pictographic symbols.
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]/gu, '')
    // Zero-width and bidi-control characters.
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, '');
}

/** Maximum accepted input length, mirrored from the API route. */
export const MAX_INPUT_LENGTH = 500;

/**
 * Parse persisted session state.
 *
 * Wrapped in try/catch because `localStorage` content is not guaranteed to be
 * valid JSON — a partially written or hand-edited value used to throw during
 * render, which broke the chat panel entirely rather than starting fresh.
 */
export function parseStoredState(raw: string | null): DialogueState {
  if (!raw) return createState();
  try {
    return sanitizeState(JSON.parse(raw));
  } catch {
    return createState();
  }
}
