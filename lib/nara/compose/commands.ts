/**
 * Nara V2 — slash-command handling.
 *
 * Deliberately small and separate from composition: commands are a closed
 * vocabulary with deterministic behaviour, and mixing them into the answer
 * composer is what made the legacy `PIPELINE_HANDLERS` order significant.
 */
import type { ComposedAnswer, DialogueState } from '../types';
import { labelFor } from '../knowledge/index';

// ─── Slash commands ──────────────────────────────────────────────────────────

export function runCommand(
  command: string,
  arg: string,
  state: DialogueState,
): ComposedAnswer {
  switch (command) {
    case 'help':
      return {
        kind: 'command',
        text: [
          '**Nara can help with**',
          '',
          '• **Games** — GTA (2D, 3D, HD eras and VI), Red Dead, Max Payne, Bully, Midnight Club, Manhunt, L.A. Noire, The Warriors.',
          '• **The company** — Rockstar Games, Take-Two, and the studios behind each title.',
          '• **Technology & design** — the RAGE engine, RenderWare, Euphoria physics, open-world design, radio and the Expanded & Enhanced upgrade.',
          '• **Controversies & impact** — Hot Coffee, Manhunt 2, the 2022 leak, crunch, GTA V\u2019s sales record.',
          "• **Neal's own work** — his co-op, volunteering, and the writing on this site.",
          '',
          'Everything is answered from what is written on this site. There is no language model behind it, so if the site does not cover something Nara will say so rather than guess.',
        ].join('\n'),
        sources: [],
        suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', '/topics'],
        trace: ['command=help'],
      };

    case 'reset':
    case 'clear':
      return {
        kind: 'command',
        text: 'Cleared. Conversation context reset — ask me anything.',
        sources: [],
        suggestions: ['Tell me about GTA V', 'Who is Neal?'],
        trace: ['command=reset'],
      };

    case 'topics':
      return {
        kind: 'command',
        text: [
          '**What this site covers**',
          '',
          '• **Games** — Grand Theft Auto (2D, 3D and HD eras, Chinatown Wars, the Definitive Edition, GTA VI and its Leonida setting), Red Dead (Revolver, Redemption, Undead Nightmare, Online), Max Payne (1, 2, 3 and the remake), Bully, Midnight Club, Manhunt, L.A. Noire, The Warriors.',
          '• **Company & studios** — Rockstar Games, Take-Two Interactive, Rockstar North, DMA Design, San Diego, Toronto, Leeds, Lincoln, Dundee, plus Sam and Dan Houser, Leslie Benzies and Strauss Zelnick.',
          '• **Technology & design** — the RAGE engine, RenderWare, Euphoria physics, open-world design, radio stations and the Expanded & Enhanced upgrade.',
          '• **Controversies & impact** — Hot Coffee, Manhunt 2, the 2022 GTA VI leak, crunch, the ESRB/BBFC ratings fights and GTA V\u2019s sales record.',
          '• **About Neal** — his co-op, volunteering, and writing.',
          '',
          'Ask about any of these by name.',
        ].join('\n'),
        sources: [],
        suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', 'Explain Hot Coffee'],
        trace: ['command=topics'],
      };

    case 'about':
      return {
        kind: 'command',
        text: 'Nara is the assistant on this site. It answers strictly from the content written here, using local lexical retrieval and no external services or language model.',
        sources: [],
        suggestions: ['Who are you?', 'Tell me about GTA V'],
        trace: ['command=about'],
      };

    case 'debug':
      return {
        kind: 'command',
        text: `Engine v2 — local, deterministic, no external calls.\n\nTurns this session: ${state.turn}\nTopics explained: ${state.explained.length}\nCurrent topic: ${state.topicStack[0] ? labelFor(state.topicStack[0]) : 'none'}`,
        sources: [],
        suggestions: ['Tell me about GTA V'],
        trace: ['command=debug'],
      };

    default:
      return {
        kind: 'command',
        text: `I don't know the command \`/${command}\`. Try \`/help\`.`,
        sources: [],
        suggestions: ['/help'],
        trace: ['command=unknown'],
      };
  }
}
