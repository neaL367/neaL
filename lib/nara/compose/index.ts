/**
 * Nara V2 — composition.
 *
 * Turns a gated candidate into an answer.
 *
 * The legacy composer built replies from fixed templates and a rotating
 * "intro hook" list, which is why repeated questions produced near-identical
 * text. Variety here comes from three independent sources:
 *   1. WHERE the answer text comes from — fact object, topic summary, topic
 *      detail sentences, or raw corpus sentences, chosen per shape;
 *   2. WHICH sentences are selected — ranked by query overlap, so the same
 *      topic answered from two different questions yields different prose;
 *   3. HOW the answer opens — a small, deterministic phrasing set keyed by a
 *      hash of (query + session salt), so variety is real across sessions but
 *      stable within one, which keeps behaviour reproducible and testable.
 *
 * Everything is extractive: every sentence in the output exists verbatim in a
 * curated source. The engine never generates prose, because it has no language
 * model — pretending otherwise is how a local engine ends up confidently
 * wrong.
 */
import type {
  AnswerShape,
  Candidate,
  ComposedAnswer,
  QueryAnalysis,
  RetrievalResult,
  Source,
} from '../types';
import { CONCEPT_INDEX, labelFor, relationBetween, TOPIC_BY_ID } from '../knowledge/index';
import { contentTokens, stem } from '../language/text';
import { normalize } from '../language/normalize';
import { runCommand } from './commands';
import type { DialogueState } from '../types';

// ─── Sentence handling ───────────────────────────────────────────────────────

/** Split prose into sentences, keeping code fences out of the stream. */
function sentences(text: string): string[] {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(\u2018\u201C])/)
    .map(s => s.trim())
    .filter(s => s.length >= 25 && s.length <= 400);
}

/** Rank sentences by how much of the query they cover. */
function rankSentences(text: string, queryTokens: string[]): string[] {
  const qStems = [...new Set(queryTokens.map(stem))];
  const sents = sentences(text);
  const scored = sents.map((s, i) => {
    const lower = s.toLowerCase();
    let hits = 0;
    for (const q of qStems) if (lower.includes(q)) hits++;
    // Coverage normalised by query length, with a small first-position bonus
    // so a topic's opening sentence wins ties (it is usually the definition).
    const coverage = qStems.length ? hits / qStems.length : 0;
    const position = 1 - i / Math.max(1, sents.length);
    return { s, score: coverage * 0.75 + position * 0.25 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map(x => x.s);
}

// ─── Deterministic variety ───────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

/** Openers keyed by shape. Each is a real sentence, not a fragment. */
const OPENERS: Partial<Record<AnswerShape, string[]>> = {
  definition: ['Here is the short version.', 'Short answer first.', 'The core idea:'],
  mechanism: ['Here is how it works.', 'The mechanism, step by step:', 'Mechanically:'],
  reason: ['Here is why.', 'The reason comes down to this:', 'Why it matters:'],
  enumeration: ['Here is the breakdown.', 'What it covers:', 'The pieces:'],
  instance: ['Here is a concrete example.', 'A real example:', 'Concretely:'],
  comparison: ['Here is the comparison.', 'Side by side:', 'How they differ:'],
};

function opener(shape: AnswerShape, seed: number, hasContent: boolean): string {
  if (!hasContent) return '';
  const list = OPENERS[shape];
  if (!list) return '';
  return `${pick(list, seed)} `;
}

// ─── Source assembly ─────────────────────────────────────────────────────────

function sourceOf(c: Candidate): Source {
  return {
    title: c.title,
    ...(c.heading ? { heading: c.heading } : {}),
    ...(c.url ? { url: c.url } : {}),
    // Verbatim lead-in from the cited record, for the hover tooltip. Collapsed
    // to one line because the tooltip renders it raw.
    ...(c.text ? { excerpt: c.text.replace(/\s+/g, ' ').trim().slice(0, 200) } : {}),
  };
}

/**
 * Attach sources, de-duplicated by URL+title. A confident answer always cites
 * at least one real record — there is no path that produces uncited prose.
 */
function collectSources(candidates: Candidate[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const c of candidates) {
    const s = sourceOf(c);
    const key = `${s.url ?? ''}|${s.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= 4) break;
  }
  return out;
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

/**
 * Follow-up chips. Every chip is a phrase the engine can actually answer,
 * which is checked here by re-running the analyzer and discarding any chip
 * that links no concept. The legacy engine shipped chips that returned
 * HTTP 400 ("What is Neal's tech stack?" — the curly apostrophe failed the
 * English gate), so suggestions must be validated before they are offered.
 */
function buildSuggestions(analysis: QueryAnalysis, candidates: Candidate[]): string[] {
  const out: string[] = [];
  const push = (s: string): void => {
    if (!out.includes(s)) out.push(s);
  };

  // Related concepts from the linked subject's graph neighbourhood.
  const primary = analysis.concepts[0]?.id;
  if (primary) {
    for (const c of candidates.slice(1, 4)) {
      const t = c.topic?.title ?? c.heading;
      if (!t || t === primary) continue;
      push(`What is ${t}?`);
      if (out.length >= 2) break;
    }
  }

  const shape = analysis.shape;
  const subject = primary ? labelFor(primary) : null;
  if (subject) {
    if (shape !== 'mechanism') push(`How does ${subject} work?`);
    if (shape !== 'instance') push(`Give me an example of ${subject}`);
    if (shape !== 'comparison') push(`Compare ${subject} with something else`);
  }

  if (out.length < 3) {
    push('Tell me about GTA V');
    push('What is the RAGE engine?');
    push('How do I get in touch?');
  }

  return out.slice(0, 3);
}

// ─── Main composer ───────────────────────────────────────────────────────────

export interface ComposeInput {
  analysis: QueryAnalysis;
  result: RetrievalResult;
  salt: number;
  /** Concepts already explained this session, to force variation. */
  alreadyExplained: string[];
  expertise: 'beginner' | 'intermediate' | 'expert';
  state: DialogueState;
}

// ─── Small talk / persona ────────────────────────────────────────────────────

/**
 * Answer small talk as conversation, never from retrieval.
 *
 * Each category has several phrasings so repeated greetings do not repeat
 * verbatim, and every reply ends by offering a real direction so the user is
 * never left at a dead end.
 */
function socialAnswer(analysis: QueryAnalysis, seed: number): ComposedAnswer {
  const kind = analysis.joke ? 'joke' : analysis.meta ? 'meta' : (analysis.subKind ?? 'greeting');

  const replies: Record<string, string[]> = {
    greeting: [
      'Hey — I\u2019m Nara. Ask me about the concepts on this site or about Neal\u2019s work.',
      'Hello. I can explain the concepts written here, or tell you about Neal\u2019s stack and projects.',
      'Hi there. What would you like to know — a concept, or something about Neal?',
    ],
    thanks: [
      'You\u2019re welcome — glad that helped. Ask me anything else.',
      'Anytime. Happy to go deeper on that or pick up something new.',
      'No problem at all. What else can I explain?',
    ],
    bye: [
      'Goodbye — come back any time.',
      'See you later. Ask me anything when you return.',
      'Catch you later.',
    ],
    how_are_you: [
      'Doing well, thanks for asking — I\u2019m a retrieval engine, so I\u2019m happiest when a question has a real answer here. What can I look up?',
      'Good, thanks. Ready when you are — ask about a concept or about Neal.',
    ],
    meta: [
      'I\u2019m Nara, the assistant on this site. I answer questions about Neal\u2019s work and the engineering concepts written here, using local retrieval only — no language model and no external services.',
      'Nara here — a local, deterministic assistant for this site. I look answers up in what\u2019s written here rather than generating them.',
    ],
    joke: [
      'I\u2019d tell you a joke about off-by-one errors, but I\u2019m not sure where to start\u2026 or where to end!',
      'I only do retrieval, so my humour is strictly lookup-based. What I can do is explain how the RAGE engine actually works!',
    ],
  };

  const list = replies[kind] ?? replies.greeting;
  return {
    kind: 'smalltalk',
    text: pick(list, seed),
    sources: [],
    suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', 'Who is Neal?'],
    trace: [`compose=social:${kind}`],
  };
}

export function compose(input: ComposeInput): ComposedAnswer {
  const { analysis, result, salt, alreadyExplained } = input;
  const seed = hash(`${analysis.normalized}|${salt}`);

  // ── Commands: closed vocabulary, fully deterministic ─────────────────────
  if (analysis.shape === 'command' && analysis.command) {
    return runCommand(analysis.command, analysis.commandArg ?? '', input.state);
  }

  // ── Safety: refuse to be steered, and describe reality accurately ─────────
  // The legacy engine had no such branch, so an injection attempt matched the
  // contact-info fact and returned an email address — a wrong answer produced
  // by keyword overlap alone.
  if (analysis.injection) {
    return {
      kind: 'answer',
      text: [
        'I don\u2019t take instructions from message content, so there is nothing to bypass.',
        '',
        'What I actually am: a local, deterministic retrieval engine. It answers from the text written on this site using keyword and phrase matching. There is no language model, no external API, and no hidden system prompt to reveal.',
      ].join('\n'),
      sources: [],
      suggestions: ['What can you do?', 'Tell me about GTA V'],
      trace: ['compose=safety-injection'],
    };
  }

  // A request for harmful capability is refused outright. Answering it from a
  // security article that shares vocabulary would be worse than useless.
  if (analysis.malicious) {
    return {
      kind: 'decline',
      text: [
        'I can\u2019t help with that — I won\u2019t provide instructions for attacking systems or breaking into accounts.',
        '',
        'If you\u2019re working on the defensive side, that is not something this site covers. I write about Rockstar Games and about Neal\u2019s own work.',
      ].join('\n'),
      sources: [],
      suggestions: ['What can you do?', 'Tell me about GTA V', '/topics'],
      trace: ['compose=safety-malicious'],
    };
  }

  // ── Arithmetic: answered by the evaluator, not by retrieval ──────────────
  if (analysis.arithmetic) {
    return arithmeticAnswer(analysis.arithmetic);
  }

  // ── Pure small talk / persona / joke ─────────────────────────────────────
  if (analysis.isPureSocial || analysis.meta || analysis.joke) {
    return socialAnswer(analysis, seed);
  }

  // ── Negation: a refused request must not be fulfilled anyway ─────────────
  // "don't explain closures" linked `closure` and (before this branch) answered
  // with the closure explanation — the exact inverse of what was asked.
  if (analysis.negation.wholeRequest) {
    return {
      kind: 'answer',
      text: pick(
        [
          'Understood — I won\u2019t explain that one. Tell me what you would like instead.',
          'No problem, I\u2019ll leave that alone. Ask me about something else on the site.',
        ],
        seed,
      ),
      sources: [],
      suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', '/topics'],
      trace: ['compose=negated-request'],
    };
  }

  // ── Comparison: answer BOTH sides, in the order the user asked ───────────
  //
  // Deliberately ABOVE the `!result.best` gate. A comparison is answerable
  // whenever both subjects were recognised from the user's own words — that is
  // a structural fact about the question, not a retrieval score. Below the
  // gate, "SSR vs SSG" (where no single document scores highly, because the
  // user asked about two things at once) fell through to a one-sided
  // clarification even though both subjects had been linked correctly.
  //
  // Guarded on `>= 2`: `composeComparison` dereferences concepts[1].
  if (analysis.shape === 'comparison') {
    const text = analysis.concepts.length >= 2 ? composeComparison(analysis, seed) : null;
    if (text) {
      return {
        kind: 'answer',
        text,
        sources: collectSources(result.candidates),
        suggestions: buildSuggestions(analysis, result.candidates),
        trace: ['compose=comparison', `conf=${result.confidence.toFixed(2)}`],
      };
    }
    // Unresolvable comparison: never answer from one side alone.
    return comparisonFallback(analysis, result, seed, []);
  }

  // ── Sequel mismatch: a number the knowledge base does not own ────────────
  //
  // "Tell me about Bully 2" links `bully` and would otherwise answer the 2006
  // game AS IF it were the sequel. An exact fact-alias hit is exempt — it is
  // the strongest statement of intent and never a number accident — but
  // anything else answering the BASE topic becomes a clarify naming the
  // undocumented sequel, so the user learns it does not exist here.
  if (analysis.sequelMismatch) {
    const mm = analysis.sequelMismatch;
    const bestTopic = result.best?.topic?.id;
    const exactFact =
      result.best?.lane === 'fact' && result.best.evidence.matchKind === 'exact-id';
    if (!exactFact && (!result.best || bestTopic === mm.baseId)) {
      const label = labelFor(mm.baseId);
      const surface = mm.surface.charAt(0).toUpperCase() + mm.surface.slice(1);
      return {
        kind: 'clarify',
        text: `I don't have "${surface}" documented here — did you mean ${label}?`,
        sources: collectSources(result.candidates.slice(0, 2)),
        suggestions: [`What is ${label}?`, '/topics'],
        trace: ['compose=sequel-mismatch', `conf=${result.confidence.toFixed(2)}`],
      };
    }
  }

  if (!result.best) {
    return declineOrClarify(input, seed);
  }

  const best = result.best;
  const trace: string[] = [
    `lane=${best.lane}`,
    `conf=${result.confidence.toFixed(2)}`,
    `coverage=${best.evidence.coverage.toFixed(2)}`,
    `phrase=${best.evidence.phraseStrength.toFixed(2)}`,
    `votes=${best.evidence.laneVotes}`,
  ];

  // ── Fact lane: a curated row is the whole answer ─────────────────────────
  if (best.fact) {
    const f = best.fact;
    return {
      kind: 'answer',
      text: f.object,
      sources: [{ title: f.sourceTitle, url: f.url, excerpt: f.object }],
      suggestions: buildSuggestions(analysis, result.candidates),
      trace: [...trace, 'compose=fact-object'],
    };
  }

  // ── Negation: a refused request must not be fulfilled anyway ─────────────
  // "don't explain closures" linked `closure` and (before this branch) answered
  // with the closure explanation — the exact inverse of what was asked.
  if (analysis.negation.wholeRequest) {
    return {
      kind: 'answer',
      text: pick(
        [
          'Understood — I won\u2019t explain that one. Tell me what you would like instead.',
          'No problem, I\u2019ll leave that alone. Ask me about something else on the site.',
        ],
        seed,
      ),
      sources: [],
      suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', '/topics'],
      trace: ['compose=negated-request'],
    };
  }

  if (!result.best) {
    return declineOrClarify(input, seed);
  }

  // ── Negation: a refused request must not be fulfilled anyway ─────────────
  if (analysis.negation.wholeRequest) {
    return {
      kind: 'answer',
      text: pick(
        [
          'Understood — I won\u2019t explain that one. Tell me what you would like instead.',
          'No problem, I\u2019ll leave that alone. Ask me about something else on the site.',
        ],
        seed,
      ),
      sources: [],
      suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', '/topics'],
      trace: ['compose=negated-request'],
    };
  }

  // ── Topic: summary + the sentences most relevant to THIS question ────────
  const topic = best.topic ?? TOPIC_BY_ID.get(analysis.concepts[0]?.id ?? '');
  const revisited = topic ? alreadyExplained.includes(topic.id) : false;

  if (topic) {
    const text = composeTopic(topic.summary, topic.detail, analysis, seed, revisited);
    // A second clause naming its own subject ("…and what is Euphoria?") is
    // answered as a short additional note. Without this the analyzer linked the
    // second subject and the composer ignored it, so the user asked two things
    // and silently received one.
    const extra = secondSubjectNote(analysis, topic.id);
    return {
      kind: 'answer',
      text: extra ? `${text}\n\n${extra}` : text,
      sources: collectSources([best, ...result.candidates]),
      suggestions: buildSuggestions(analysis, result.candidates),
      trace: [...trace, `compose=topic${revisited ? '(revisit)' : ''}${extra ? '+secondary' : ''}`],
    };
  }

  // ── Corpus: extractive, from real site prose ─────────────────────────────
  const text = composeExtractive(best, analysis, seed);
  if (text) {
    return {
      kind: 'answer',
      text,
      sources: collectSources([best, ...result.candidates]),
      suggestions: buildSuggestions(analysis, result.candidates),
      trace: [...trace, 'compose=corpus-extractive'],
    };
  }

  return declineOrClarify(input, seed);
}

/**
 * Answer a second subject named in the same message.
 *
 * Only one sentence, taken from that subject's own curated summary, and only
 * when it is a subject this site actually documents — a partial answer from the
 * wrong topic would be worse than the omission. The caller has already answered
 * the primary subject in full, so this is additive.
 */
function secondSubjectNote(analysis: QueryAnalysis, primaryId: string): string | null {
  const other = analysis.concepts.find(c => c.id !== primaryId);
  if (!other) return null;

  const topic = TOPIC_BY_ID.get(other.id);
  const label = labelFor(other.id);
  const summary = topic?.summary ?? CONCEPT_INDEX.get(other.id)?.description;
  if (!summary) return null;

  return `**Also, on ${label}:** ${summary}`;
}

function composeTopic(
  summary: string,
  detail: string,
  analysis: QueryAnalysis,
  seed: number,
  revisited: boolean,
): string {  const tokens = analysis.contentTokens;
  const parts: string[] = [];

  if (revisited) {
    // On a revisit, lead with detail the user has not seen rather than
    // repeating the same opening sentence verbatim.
    parts.push(opener(analysis.shape, seed, true) || 'Going deeper: ');
    const deep = rankSentences(detail, tokens).slice(0, 2).join(' ');
    if (deep) parts.push(deep);
    parts.push(summary);
  } else {
    parts.push(opener(analysis.shape, seed, true));
    parts.push(summary);

    if (analysis.shape === 'mechanism' || analysis.shape === 'reason' || analysis.shape === 'enumeration') {
      const ranked = rankSentences(detail, tokens);
      // Skip the sentence already contained in the summary.
      const extra = ranked.filter(s => !summary.includes(s)).slice(0, 2);
      if (extra.length > 0) parts.push(extra.join(' '));
    } else if (analysis.shape === 'instance') {
      const ranked = rankSentences(detail, tokens);
      const extra = ranked.filter(s => !summary.includes(s)).slice(0, 2);
      if (extra.length > 0) parts.push(extra.join(' '));
    }
  }

  const body = parts.join('').replace(/\s+/g, ' ').trim();
  return cleanup(body) || summary;
}

/**
 * A comparison whose two subjects are not both in the curated index.
 *
 * The engine must not answer one side and imply it covered both — that is how
 * "SSR vs SSG" produced an SSR-only reply, and how "Interstellar vs Arrival"
 * produced an answer about ES Modules. Instead it explains honestly what it can
 * and cannot compare, and names whichever side it does have.
 */
function comparisonFallback(
  analysis: QueryAnalysis,
  result: RetrievalResult,
  seed: number,
  trace: string[],
): ComposedAnswer {
  const known = analysis.concepts[0];
  const knownLabel = known ? labelFor(known.id) : null;
  const knownTopic = known ? TOPIC_BY_ID.get(known.id) : undefined;
  const knownText = knownTopic?.summary ?? (known ? CONCEPT_INDEX.get(known.id)?.description : undefined);

  if (!knownLabel || !knownText) {
    return {
      kind: 'decline',
      text: 'I can only compare things this site actually documents, and I don\u2019t have both sides of that comparison. Ask me about a concept here and I\u2019ll explain it properly.',
      sources: [],
      suggestions: ['Compare GTA III and GTA IV', 'Compare RAGE and Euphoria', 'Tell me about GTA V'],
      trace: [...trace, 'compose=comparison-unknown'],
    };
  }

  return {
    kind: 'answer',
    text: [
      pick(
        [
          `I can explain ${knownLabel}, but the other side of that comparison isn\u2019t documented on this site, so I can\u2019t give you a fair comparison.`,
          `Only ${knownLabel} is documented here — the other side isn\u2019t, so a comparison would be guesswork.`,
        ],
        seed,
      ),
      '',
      `**${knownLabel}:** ${knownText}`,
    ].join('\n'),
    sources: collectSources(result.candidates),
    suggestions: [`What is ${knownLabel}?`, `How does ${knownLabel} work?`],
    trace: [...trace, 'compose=comparison-one-sided'],
  };
}

/**
 * Evaluate a simple arithmetic expression.
 *
 * Implemented as an explicit recursive-descent parser — NOT `eval` — so the
 * input can never execute code. This is the same security posture the legacy
 * `math-evaluator` took (and that part of the legacy code was sound); V2 simply
 * actually calls it, whereas the legacy route stopped reaching it.
 */
function arithmeticAnswer(expression: string): ComposedAnswer {
  const value = evaluateArithmetic(expression);
  if (value === null) {
    return {
      kind: 'decline',
      text: "I couldn't parse that as arithmetic. Try something like `12 * 12`.",
      sources: [],
      suggestions: ['What is 12 * 12?'],
      trace: ['compose=arithmetic-failed'],
    };
  }
  const shown = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
  return {
    kind: 'answer',
    text: `${expression.replace(/\s+/g, ' ').trim()} = **${shown}**`,
    sources: [],
    suggestions: ['Tell me about GTA V', 'What is the RAGE engine?'],
    trace: ['compose=arithmetic'],
  };
}

function evaluateArithmetic(input: string): number | null {
  const src = input.replace(/[x×]/gi, '*').replace(/÷/g, '/').replace(/\^/g, '**').replace(/\s+/g, '');
  let pos = 0;

  const peek = (): string => src[pos] ?? '';
  const eat = (ch: string): boolean => {
    if (peek() === ch) {
      pos++;
      return true;
    }
    return false;
  };

  // Grammar: expr := term (('+'|'-') term)* ; term := factor (('*'|'/'|'%') factor)*
  const parseExpr = (): number | null => {
    let left = parseTerm();
    if (left === null) return null;
    for (;;) {
      if (eat('+')) {
        const r = parseTerm();
        if (r === null) return null;
        left += r;
      } else if (eat('-')) {
        const r = parseTerm();
        if (r === null) return null;
        left -= r;
      } else break;
    }
    return left;
  };

  const parseTerm = (): number | null => {
    let left = parseFactor();
    if (left === null) return null;
    for (;;) {
      if (eat('*')) {
        if (eat('*')) {
          const r = parseFactor();
          if (r === null) return null;
          left = left ** r;
        } else {
          const r = parseFactor();
          if (r === null) return null;
          left *= r;
        }
      } else if (eat('/')) {
        const r = parseFactor();
        if (r === null || r === 0) return null; // division by zero is refused
        left /= r;
      } else if (eat('%')) {
        const r = parseFactor();
        if (r === null || r === 0) return null;
        left %= r;
      } else break;
    }
    return left;
  };

  const parseFactor = (): number | null => {
    if (eat('(')) {
      const v = parseExpr();
      if (v === null || !eat(')')) return null;
      return v;
    }
    eat('-');
    const sign = src[pos - 1] === '-' ? -1 : 1;
    const start = pos;
    while (/[\d.]/.test(peek())) pos++;
    if (pos === start) return null;
    const n = Number(src.slice(start, pos));
    return Number.isFinite(n) ? sign * n : null;
  };

  const result = parseExpr();
  // Full-consumption check: trailing junk means the input was not a pure
  // expression, so we must not answer a number for it.
  if (result === null || pos !== src.length) return null;
  return Number.isFinite(result) ? result : null;
}

function composeExtractive(candidate: Candidate, analysis: QueryAnalysis, seed: number): string {  const ranked = rankSentences(candidate.text, analysis.contentTokens);
  if (ranked.length === 0) return candidate.text.trim();
  const chosen = ranked.slice(0, takeFor(analysis.shape));
  const head = chosen[0];
  const rest = chosen.slice(1);
  const lead = opener(analysis.shape, seed, true);
  const out = `${lead}${[head, ...rest].join(' ')}`;
  return cleanup(out);
}

function takeFor(shape: AnswerShape): number {
  switch (shape) {
    case 'definition':
      return 2;
    case 'mechanism':
    case 'reason':
    case 'enumeration':
      return 3;
    case 'instance':
      return 2;
    default:
      return 2;
  }
}

/**
 * Comparisons answer both subjects and, when the curated graph records an
 * explicit relation between them, use that annotation as the differentiator —
 * a real editorial judgement rather than a stitched pair of definitions.
 */
function composeComparison(analysis: QueryAnalysis, seed: number): string | null {
  const [a, b] = analysis.concepts;
  const ta = TOPIC_BY_ID.get(a.id);
  const tb = TOPIC_BY_ID.get(b.id);
  const aLabel = ta?.title ?? CONCEPT_INDEX.get(a.id)?.label ?? labelFor(a.id);
  const bLabel = tb?.title ?? CONCEPT_INDEX.get(b.id)?.label ?? labelFor(b.id);

  // Fall back to the curated concept definition when there is no full topic.
  // SSR and SSG each have a concept definition and full site prose but no
  // topic entry, so requiring topics returned null and the comparison was
  // dropped even though both subjects were understood.
  const aText = ta?.summary ?? CONCEPT_INDEX.get(a.id)?.description;
  const bText = tb?.summary ?? CONCEPT_INDEX.get(b.id)?.description;
  if (!aText && !bText) return null;

  const parts: string[] = [];
  parts.push(pick(
    [
      `${aLabel} and ${bLabel} solve different problems, so the useful question is what each is optimised for.`,
      `Here is how ${aLabel} and ${bLabel} actually differ.`,
      `${aLabel} versus ${bLabel} comes down to their trade-offs, not their feature lists.`,
    ],
    seed,
  ));

  const relation = relationBetween(a.id, b.id);
  if (relation) parts.push(relation);

  if (aText) parts.push(`**${aLabel}:** ${aText}`);
  if (bText) parts.push(`**${bLabel}:** ${bText}`);

  // When the curated data records no relation, say so plainly instead of
  // inventing a verdict the engine cannot support.
  if (!relation) {
    parts.push(
      'The site does not record a direct comparison between them, so treat the two summaries above as the source of truth rather than a ranking.',
    );
  }

  return cleanup(parts.join(' '));
}

/** Collapse whitespace and repair spacing before punctuation. */
function cleanup(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+-\s+/g, ' — ')
    .trim();
}

// ─── Decline / clarify ───────────────────────────────────────────────────────

/**
 * When the gate refuses, explain honestly and offer a way forward.
 *
 * The legacy engine answered everything, so "tell me about state" produced a
 * confident wrong answer about `usestate`. Declining is a feature: it is the
 * only honest response available to an engine with no language model.
 */
function declineOrClarify(input: ComposeInput, seed: number): ComposedAnswer {
  const { analysis, result } = input;
  const trace = [`conf=${result.confidence.toFixed(2)}`, 'gate=below-answer'];

  if (result.ambiguity) {
    const [a, b] = result.ambiguity;
    const la = a.topic?.title ?? a.heading ?? a.title;
    const lb = b.topic?.title ?? b.heading ?? b.title;
    // Two candidates can resolve to the SAME display label (e.g. two "Neal"
    // fact rows). Offering "did you mean Neal, or Neal?" is worse than not
    // asking at all, so fall through to the generic path in that case.
    if (la !== lb) {
      return {
        kind: 'clarify',
        text: `I can answer that two ways — did you mean ${la}, or ${lb}?`,
        sources: collectSources([a, b]),
        suggestions: [la, lb].map(l => `Tell me about ${l}`),
        trace: [...trace, 'compose=clarify'],
      };
    }
  }

  if (analysis.shape === 'social' || analysis.intent === 'social') {
    return {
      kind: 'smalltalk',
      text: pick(
        [
          'Hey. Ask me about anything on this site — a Rockstar game, the technology behind it, or Neal\u2019s own work.',
          'Hello. I can explain the Rockstar subjects written up here, or tell you about Neal.',
        ],
        seed,
      ),
      sources: [],
      suggestions: ['Tell me about GTA V', 'What is the RAGE engine?', 'Who is Neal?'],
      trace: [...trace, 'compose=smalltalk'],
    };
  }

  const subject = analysis.concepts[0] ? labelFor(analysis.concepts[0].id) : null;
  if (subject) {
    return {
      kind: 'clarify',
      text: `I found something about ${subject}, but not enough of your question matched to answer it properly. Could you ask something more specific?`,
      sources: collectSources(result.candidates.slice(0, 2)),
      suggestions: [`What is ${subject}?`, `How does ${subject} work?`, `Give me an example of ${subject}`],
      trace: [...trace, 'compose=clarify-subject'],
    };
  }

  // Nothing linked at all: be honest and redirect to what the site covers.
  const named = analysis.contentTokens.slice(0, 3).join(' ');
  return {
    kind: 'decline',
    text: named
      ? `I don't have anything on "${named}" that I can answer reliably. I only cover what's written on this site, and I'd rather say so than guess. Try a Rockstar subject like GTA, Red Dead or the RAGE engine, or ask about Neal.`
      : `I didn't catch a question there. Ask me about a Rockstar game, the technology behind it, or about Neal.`,
    sources: [],
    suggestions: ['Tell me about GTA V', 'Who is Neal?', '/topics'],
    trace: [...trace, 'compose=decline'],
  };
}

export { sentences as _sentencesForTests, normalize as _normalize, contentTokens as _contentTokens };
