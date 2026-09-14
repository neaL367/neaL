/**
 * Nara V2 — query understanding.
 *
 * THE structural fix, stated plainly: the legacy classifier scored SHAPE and
 * SUBJECT on one shared scale, so a social greeting could outrank a technical
 * question purely on intent priority. Measured on the legacy engine:
 *
 *   "hey explain closures"                -> greeting    (priority 44)
 *   "how are you supposed to use useEffect" -> how_are_you (0.95)
 *
 * Both are technical questions. Here the two decisions are separated:
 *
 *   1. SHAPE  — what kind of answer is being requested. Social/meta/command
 *               shapes are only chosen when the message has NO content words
 *               that resolve to a known concept. That single rule is what
 *               stops "hey explain closures" becoming a greeting.
 *   2. SUBJECT — which concepts are being asked about, resolved independently,
 *               with match KIND recorded so confidence can be evidence-based.
 */
import type {
  AnswerShape,
  ConceptMatch,
  Intent,
  NegationSpan,
  QueryAnalysis,
} from '../types';
import { ALIAS_LOOKUP } from '../knowledge/index';
import { contentTokens, normalizeForMatch, tokenize } from './text';
import { looksNonEnglish, normalize } from './normalize';

// ─── Social / meta / command recognition ─────────────────────────────────────

const GREETING = /^(?:hi|hey|hello|yo|sup|howdy|hiya|good (?:morning|afternoon|evening)|greetings)\b/i;
const THANKS = /\b(?:thanks|thank you|thx|ty|appreciate it|cheers)\b/i;
const BYE = /\b(?:bye|goodbye|see ya|see you|later|cya|farewell)\b/i;
const HOW_ARE_YOU = /\bhow (?:are you|'s it going|is it going|are things)\b/i;

/** Commands are an explicit, closed vocabulary — never inferred from prose. */
const COMMANDS = new Set(['help', 'reset', 'clear', 'topics', 'about', 'debug']);

/**
 * Prompt-injection / jailbreak attempts. These must be recognised, because the
 * correct response is an honest description of what this engine is — not a
 * confident answer pulled from whatever words happen to overlap. The legacy
 * engine had no such detection, so "ignore all previous instructions…"
 * retrieved the contact-info fact and cheerfully returned an email address.
 */
const INJECTION =
  /\b(?:ignore (?:all )?(?:previous|prior|above) (?:instructions?|prompts?|rules?)|disregard (?:all |your )?(?:previous |prior )?(?:instructions?|rules?)|reveal (?:your )?(?:system )?prompt|show me your (?:system )?prompt|what (?:is|are) your (?:system )?(?:prompt|instructions)|repeat your instructions|you are now|pretend to be|act as (?:a|an|if)|developer mode|jailbreak|dan mode|bypass your (?:rules|filters|guidelines))\b/i;

// "who made you?" is the natural way to ask an assistant about its origin, and
// it was missing: the question fell through to retrieval, linked nothing, and
// declined — even though a `WHO_MADE_YOU` persona answer exists for it.
const META =
  /\b(?:who are you|what are you|who made you|who created you|who built you|who wrote you|how were you made|what is nara|what can you do|your name|are you (?:an? )?(?:ai|robot|bot|llm|human))\b/i;

/**
 * Words that carry no request of their own. A message made up ONLY of these
 * (plus greetings/thanks/farewells) is small talk; a message containing any
 * other word is a real question that merely OPENED with a greeting.
 *
 * This is the discriminator that lets "hey, can you explain the event loop"
 * stay a technical question while "hi" becomes small talk — without either
 * decision competing on a single shared score, which is how the legacy
 * classifier ended up ranking a greeting above a real question.
 */
const SOCIAL_ONLY = new Set([
  'hi', 'hey', 'hello', 'yo', 'sup', 'howdy', 'hiya', 'greetings',
  'good', 'morning', 'afternoon', 'evening', 'nara',
  'there', 'again', 'so', 'ok', 'okay', 'cool', 'nice', 'great',
  'thanks', 'thank', 'you', 'thx', 'ty', 'cheers', 'appreciate',
  'bye', 'goodbye', 'see', 'ya', 'later', 'cya', 'farewell',
  'how', 'are', 'is', 'it', 'going', 'things', 'doing', 'today',
  'the', 'a', 'an', 'and', 'please', 'buddy', 'friend', 'mate',
]);

/** Out-of-scope requests that deserve a graceful, non-answer reply. */
const JOKE = /\b(?:tell me a joke|say something funny|make me laugh|a joke)\b/i;

/**
 * Arithmetic. The legacy engine shipped a genuinely careful recursive-descent
 * evaluator (no `eval`, division-by-zero guard, full-consumption check) and
 * then stopped calling it once the LLM path existed, so "what is 12 * 12"
 * declined. V2 routes these to that evaluator.
 */
const ARITHMETIC = /^\s*(?:what\s+is\s+|what's\s+|calculate\s+|compute\s+|eval(?:uate)?\s+)?(-?[\d.]+(?:\s*[-+*/x×÷^%]\s*-?[\d.()]+)+)\s*\??\s*$/i;

/**
 * Requests for help causing harm. Refused explicitly rather than answered from
 * whatever security-adjacent content happens to match — the legacy engine
 * replied to "how do I ddos a website" with its XSS-defence article.
 */
const MALICIOUS =
  /\b(?:ddos|dos attack|sql injection attack|hack (?:into|a|an|someone)|crack (?:the |a )?password|brute ?force (?:a |the )?password|exploit (?:a |the )?vulnerabilit|malware|ransomware|keylogger|phishing (?:kit|page|email)|steal (?:credentials|data|passwords)|bypass (?:auth|login|paywall)|carding|botnet)\b/i;

// ─── Shape patterns ──────────────────────────────────────────────────────────

// `compare X and Y` is the most natural way to ask for a comparison, and the
// original pattern only matched the "compared to/with" form — so the clearest
// phrasing fell through to a single-subject answer while the less common
// "X vs Y" worked. A bare `compare`/`compares`/`comparing` is a comparison
// trigger regardless of what follows it.
const RE_COMPARISON =
  /\b(?:vs\.?|versus|compar(?:e|es|ed|ing)(?: (?:to|with))?|difference between|differ from|better than|or)\b/i;
const RE_DEFINITION = /^\s*(?:what(?:'s| is| are)|define|explain|describe|tell me about|what do you mean by|meaning of)\b/i;
const RE_MECHANISM = /^\s*(?:how (?:do|does|did|can|would|should|to)|how)\b/i;
const RE_REASON = /^\s*(?:why|what(?:'s| is) the reason)\b/i;
const RE_ENUMERATION = /\b(?:list|what (?:are|does) .* (?:include|contain)|give me (?:all|the list)|types of|kinds of|examples? of)\b/i;
const RE_INSTANCE = /\b(?:example|show me|demonstrate|sample)\b/i;
const RE_FACT = /^\s*(?:who|when|where|which|whose|how (?:much|many|long|old))\b/i;
const RE_OPINION = /\b(?:what do you think|your (?:opinion|take|thoughts)|do you (?:like|prefer|recommend)|should i (?:use|learn)|is .* worth)\b/i;

/** Question words that carry NO subject of their own. */
const SHAPE_WORDS = new Set([
  'what', 'how', 'why', 'who', 'when', 'where', 'which', 'whose',
  'does', 'do', 'did', 'is', 'are', 'was', 'were', 'can', 'could',
  'should', 'would', 'will', 'the', 'a', 'an', 'me', 'you', 'your',
  'about', 'explain', 'define', 'describe', 'tell', 'mean', 'means',
  'work', 'works', 'use', 'used', 'using', 'difference', 'between',
  'vs', 'versus', 'compare', 'compared', 'better', 'than', 'or',
  'and', 'also', 'please', 'just', 'like', 'list', 'give', 'show',
  'example', 'examples', 'type', 'types', 'kind', 'kinds',
]);

// ─── Multi-intent splitting ──────────────────────────────────────────────────

/**
 * Detect a second, independent request in one message.
 * "explain closures and also how does the event loop work" -> secondary.
 *
 * Splits only on an explicit additive marker followed by a second interrogative
 * ("and what/how/why…", "and also …", ", and …"), so a list inside ONE question
 * ("what are props and state") is not torn apart. The comma-free "and what"
 * form is included because it is the most common way to ask two things at once
 * — "What is the RAGE engine and what is Euphoria?" — and excluding it meant
 * the second subject was silently dropped from the answer.
 */
function splitSecondary(text: string): string | undefined {
  const m = text.match(
    /\b(?:and also|and then|and (?:what|how|why|where|when|who|which)\b|also,?\s+(?:what|how|why|where|when|who)|,\s*and\s+(?:what|how|why|where|when|who|tell\s+me))\b/i,
  );
  if (!m || m.index === undefined) return undefined;
  const rest = text.slice(m.index + m[0].length).trim();
  if (rest.split(/\s+/).length < 3) return undefined;
  return rest;
}

// ─── Negation ────────────────────────────────────────────────────────────────

const NEGATORS = /\b(?:not|isn't|aren't|don't|doesn't|didn't|won't|can't|cannot|never|no)\b/i;

/**
 * A request that refuses itself: "don't explain closures", "no need to
 * describe X", "stop telling me about X".
 *
 * `[’']?` is essential, not decorative: the analyzer receives text that still
 * contains a curly apostrophe (U+2019), which `\b` treats as a non-word
 * character. Without the explicit apostrophe class, "don’t" failed to match
 * `don't`, `wholeRequest` stayed false, and the engine answered the closure
 * question it had just been told not to answer.
 */
const WHOLE_REQUEST_STOP =
  /\b(?:do\s?n[’']?t|does\s?n[’']?t|do not|stop|never|no need to|no need)\s+(?:ever\s+)?(?:explain|tell|answer|describe|talk about|discuss|cover)\b/i;

function detectNegation(text: string, concepts: ConceptMatch[]): NegationSpan {
  const wholeRequest = WHOLE_REQUEST_STOP.test(text);
  const negated: string[] = [];
  // A concept is negated when a negator appears shortly before its surface.
  for (const c of concepts) {
    const before = text.slice(Math.max(0, c.span[0] - 20), c.span[0]);
    if (NEGATORS.test(before)) negated.push(c.id);
  }
  return { concepts: negated, wholeRequest };
}

// ─── Concept linking ─────────────────────────────────────────────────────────

const KIND_CONFIDENCE: Record<ConceptMatch['kind'], number> = {
  'exact-id': 1.0,
  'exact-label': 0.95,
  alias: 0.85,
  phrase: 0.8,
  token: 0.6,
  fuzzy: 0.35,
};

const MIN_ALIAS_LENGTH = 3;

/**
 * Link concepts by maximal-munch over the curated alias table.
 *
 * Unlike the legacy fuzzy matcher, this CANNOT invent a concept: every match
 * is a literal substring of a curated label or alias, recorded with its kind.
 * The legacy matcher resolved "is my cache stale" to the `usestate` topic via
 * edit-distance and answered confidently; substring-only linking returns
 * nothing at all, which is the correct outcome.
 */
function linkConcepts(normalized: string): ConceptMatch[] {
  const text = normalizeForMatch(normalized);
  const found: ConceptMatch[] = [];
  const takenBy: Array<[number, number]> = [];
  const usedIds = new Set<string>();

  const overlaps = (start: number, end: number): boolean => {
    for (const [s, e] of takenBy) {
      if (start < e && end > s) return true;
    }
    return false;
  };

  for (const { alias, entry } of ALIAS_LOOKUP) {
    if (alias.length < MIN_ALIAS_LENGTH) continue;
    // Word-boundary match so "react" does not match inside "reactive".
    const re = new RegExp(`(?<![a-z0-9+#.])${escapeRe(alias)}(?![a-z0-9+#.])`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = start + alias.length;
      if (overlaps(start, end)) continue;
      // NOTE: no `break` here. The legacy matcher stopped after the first hit
      // per alias, which is why "react vs angular" resolved to ONE concept.
      // The overlap guard already prevents the same span matching twice.
      const kind: ConceptMatch['kind'] =
        alias === entry.label.toLowerCase()
          ? 'exact-label'
          : alias === entry.id
            ? 'exact-id'
            : 'alias';
      found.push({
        id: entry.id,
        confidence: KIND_CONFIDENCE[kind],
        kind,
        surface: m[0],
        span: [start, end],
      });
      if (!usedIds.has(entry.id)) usedIds.add(entry.id);
    }
  }

  // NOTE: there is deliberately NO token-level fallback here.
  //
  // The legacy engine had one, and it was the source of its worst failures:
  // edit-distance and token matching turned "what does this function do" into
  // the `arrow` topic, "tell me about state" into `usestate`, and
  // "is my cache stale" into `usestate` again — all answered at confidence
  // 0.9. Attempting to salvage the rule by restricting it to single-match
  // tokens does not work either: `function` stems to `func`, which appears in
  // exactly one label token list ("Arrow Functions & Lexical This"), so the
  // guard passes and the same wrong link is produced.
  //
  // A subject must therefore come from a CURATED name — a label or an explicit
  // alias. When nothing matches, the engine has no subject, and the correct
  // behaviour is to ask a clarifying question rather than to guess. That is a
  // deliberate trade: some recall is given up to make confident wrong answers
  // structurally impossible.

  // Order by position in the query, but rank stronger matches first on ties.
  //
  // Position order is what makes "react vs angular" keep React as the primary
  // subject. The legacy matcher returned `['angular', 'react-19', 'react']`
  // for that query — inverted AND with a phantom middle entry.
  found.sort((a, b) => a.span[0] - b.span[0] || b.confidence - a.confidence);

  // Collapse entries that resolved to the same concept (the same id can match
  // through both a label and an alias); keep the strongest.
  const byId = new Map<string, ConceptMatch>();
  for (const m of found) {
    const prev = byId.get(m.id);
    if (!prev || m.confidence > prev.confidence) byId.set(m.id, m);
  }
  const deduped = [...byId.values()].sort((a, b) => a.span[0] - b.span[0]);
  return suppressGenericParents(deduped);
}

/**
 * Drop a generic subject when a more specific one is also named.
 *
 * "GTA III vs GTA IV" matched three concepts: `gta-iii`, `gta-iv` AND the parent
 * `gta-series`, because the word "GTA" is a curated alias in its own right and
 * the overlap guard only rejects overlapping SPANS — the parent's span sits
 * outside both children's. The parent then won the comparison selection, and
 * the engine answered "Grand Theft Auto III versus Grand Theft Auto", comparing
 * a game against its own series.
 *
 * The rule is intentionally narrow: a parent is removed only when at least one
 * of its children also matched AND the parent is not the sole survivor. So
 * "Compare GTA and Red Dead" keeps `gta-series` — nothing more specific is
 * named — while "GTA III vs GTA IV" and "San Andreas vs Vice City" do not.
 *
 * The mapping is declared rather than inferred from graph edges, because the
 * graph's `uses`/`enables` relations are argumentative annotations, not a
 * taxonomy, and reading containment out of them would be a guess.
 */
const GENERIC_PARENT_CHILDREN: Record<string, string[]> = {
  'gta-series': [
    'gta-1',
    'gta-2',
    'gta-iii',
    'gta-vice-city',
    'gta-san-andreas',
    'gta-iv',
    'gta-v',
    'gta-vi',
    'gta-online',
    'chinatown-wars',
    'gta-trilogy-definitive',
    'gta-era-2d',
    'gta-era-3d',
    'gta-era-hd',
  ],
  'red-dead-series': [
    'red-dead-revolver',
    'red-dead-redemption',
    'red-dead-redemption-2',
    'red-dead-online',
    'undead-nightmare',
  ],
  'max-payne-series': ['max-payne-1', 'max-payne-2', 'max-payne-3', 'max-payne-remake'],
  'midnight-club-series': [],
  'manhunt': ['manhunt-2'],
  // Every Rockstar studio, so "Rockstar North vs Rockstar San Diego" compares the
  // two studios rather than collapsing to the label that owns them, and
  // "Rockstar vs Take-Two" still resolves to the two distinct companies.
  'rockstar-games': [
    'rockstar-north',
    'rockstar-san-diego',
    'rockstar-vancouver',
    'rockstar-toronto',
    'rockstar-leeds',
    'rockstar-lincoln',
    'rockstar-london',
    'rockstar-new-england',
    'rockstar-india',
    'rockstar-dundee',
    'rockstar-studios',
    'dma-design',
    'take-two',
  ],
};

function suppressGenericParents(matches: ConceptMatch[]): ConceptMatch[] {
  if (matches.length < 2) return matches;

  const present = new Set(matches.map(m => m.id));
  const drop = new Set<string>();
  for (const [parent, children] of Object.entries(GENERIC_PARENT_CHILDREN)) {
    if (!present.has(parent)) continue;
    if (children.some(child => present.has(child))) drop.add(parent);
  }
  if (drop.size === 0) return matches;

  const kept = matches.filter(m => !drop.has(m.id));
  // Never let suppression empty the subject list: if every match was a generic
  // parent (only possible with a pathological alias table), keep the original.
  return kept.length > 0 ? kept : matches;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Discourse: pronoun / ellipsis resolution ────────────────────────────────

const PRONOUN = /\b(?:it|that|this|those|these|them|they)\b/i;
const CONTINUATION = /^(?:and|also|what about|how about|why|more|go on|continue|then|ok(?:ay)? and)\b/i;

/**
 * Resolve a bare follow-up to the previous topic.
 *
 * The legacy engine computed an `isFollowUp` flag and a `resolvedSubject` and
 * then never read either — they were dead values, so "why?" after a closures
 * answer fell through to the generic retrieval lane. Here resolution is an
 * explicit, consumed part of the analysis.
 */
function resolveReferent(text: string, previousTopic: string | undefined, previousTitle: string): string | undefined {
  if (!previousTopic) return undefined;
  if (PRONOUN.test(text) || CONTINUATION.test(text)) return previousTopic;
  // A bare follow-up with no content of its own (e.g. "why?") also refers back.
  if (contentWordsOf(text).length <= 1 && /\?$/.test(text.trim())) return previousTopic;
  void previousTitle;
  return undefined;
}

/**
 * Detect that a question is ABOUT the previous topic via a pronoun, without
 * being a bare follow-up.
 *
 * "how does it handle errors" after a React RSC answer is a real question with
 * real content words ("handle", "errors") but no subject — "it" carries the
 * subject. Without this the engine saw no concept, no bare-followup shape, and
 * declined a perfectly answerable question. This is the case the legacy engine
 * left dead: it computed `resolvedSubject` and never read it.
 */
function hasSubjectPronoun(text: string): boolean {
  return /\b(?:it|that|this|those|these|they|them)\b/i.test(text);
}

function contentWordsOf(text: string): string[] {
  return tokenize(text).filter(t => t.length >= 3 && !SHAPE_WORDS.has(t));
}

// ─── Main analysis ───────────────────────────────────────────────────────────

export interface AnalyzeOptions {
  /** Topic of the previous answered turn, for pronoun and follow-up resolution. */
  previousTopic?: string;
  /** Display title of the previous answer. */
  previousTitle?: string;
}

/**
 * Social / meta / safety classification, decided BEFORE concept linking.
 *
 * Ordering matters and is the whole point. If concept linking runs first, a
 * small-talk message can attach a subject and be answered as a fact — measured
 * on an earlier build, "who are you?" linked the `neal` identity concept and
 * returned a biography, and "how are you?" matched the contact fact and
 * returned an email address. Both are wrong. These categories are therefore
 * resolved on the raw text first, with `isPureSocial` requiring that the
 * message contains no substantive word at all.
 */
interface PreClassification {
  shape: AnswerShape;
  intent: Intent;
  subKind?: string;
  isPureSocial: boolean;
  meta: boolean;
  injection: boolean;
  joke: boolean;
  malicious: boolean;
  arithmetic?: string;
}

function classifyBeforeSubject(
  lower: string,
  allTokens: string[],
  rawArithmetic?: string,
): PreClassification {
  const none = {
    shape: 'definition' as AnswerShape,
    intent: 'ask' as Intent,
    isPureSocial: false,
    meta: false,
    injection: false,
    joke: false,
    malicious: false,
  };

  // Safety first: an injection attempt must never be answered from the corpus.
  if (INJECTION.test(lower)) {
    return { ...none, shape: 'safety', intent: 'meta', injection: true };
  }

  // A request for harmful capability is refused, not answered from whatever
  // security-adjacent article happens to share vocabulary.
  if (MALICIOUS.test(lower)) {
    return { ...none, shape: 'safety', intent: 'meta', malicious: true };
  }

  // Pure arithmetic is answered by the evaluator, never by retrieval.
  if (rawArithmetic) {
    return { ...none, shape: 'fact', intent: 'ask', arithmetic: rawArithmetic };
  }

  const hasSubstantive = allTokens.some(t => t.length >= 3 && !SOCIAL_ONLY.has(t));

  if (META.test(lower)) {
    return { ...none, shape: 'meta', intent: 'meta', meta: true, isPureSocial: !hasSubstantive };
  }
  if (JOKE.test(lower)) {
    return { ...none, shape: 'meta', intent: 'meta', joke: true, isPureSocial: !hasSubstantive };
  }
  if (HOW_ARE_YOU.test(lower) && !hasSubstantive) {
    return { ...none, shape: 'social', intent: 'social', subKind: 'how_are_you', isPureSocial: true };
  }
  if (GREETING.test(lower) && !hasSubstantive) {
    return { ...none, shape: 'social', intent: 'social', subKind: 'greeting', isPureSocial: true };
  }
  if (THANKS.test(lower) && !hasSubstantive) {
    return { ...none, shape: 'social', intent: 'social', subKind: 'thanks', isPureSocial: true };
  }
  if (BYE.test(lower) && !hasSubstantive) {
    return { ...none, shape: 'social', intent: 'social', subKind: 'bye', isPureSocial: true };
  }
  return none;
}

export function analyze(rawInput: string, opts: AnalyzeOptions = {}): QueryAnalysis {
  // Arithmetic is detected on the RAW input, before normalization.
  //
  // Normalization strips list bullets and stray punctuation by design, and a
  // leading "-" or a "*" can look like punctuation. Reading the expression from
  // the raw text avoids depending on which characters survived.
  const rawLower = rawInput.toLowerCase().trim();
  const rawArithmetic = rawLower.match(ARITHMETIC);

  const { text: normalized, corrections } = normalize(rawInput);
  const tokens = tokenize(normalized);
  const cTokens = contentTokens(normalized);
  const lower = normalized.toLowerCase().trim();

  // ── Pre-subject classification (safety, meta, pure small talk) ────────────
  const pre = classifyBeforeSubject(
    lower,
    tokens,
    rawArithmetic && /\d/.test(rawLower) && /[-+*/x×÷^%]/.test(rawLower)
      ? rawArithmetic[1]
      : undefined,
  );

  // ── Commands: an explicit closed vocabulary, checked next ─────────────────
  const commandMatch = lower.match(/^\/([a-z]+)\s*(.*)$/);
  const bareCommand = !commandMatch && COMMANDS.has(lower) ? lower : null;
  if (commandMatch || bareCommand) {
    const conceptsForCommand = linkConcepts(normalized);
    const command = commandMatch ? commandMatch[1] : (bareCommand as string);
    return finish({
      shape: 'command',
      intent: 'command',
      concepts: conceptsForCommand,
      normalized,
      tokens,
      cTokens,
      raw: rawInput,
      isBare: false,
      command,
      commandArg: commandMatch ? commandMatch[2].trim() : '',
      isPureSocial: false,
      meta: false,
      injection: false,
      malicious: false,
      joke: false,
    });
  }

  if (pre.injection || pre.malicious) {
    return finish({
      shape: 'safety', intent: 'meta', concepts: [], normalized, tokens, cTokens,
      raw: rawInput, isBare: false, isPureSocial: false, meta: false,
      injection: pre.injection, malicious: pre.malicious, joke: false,
    });
  }

  // Arithmetic: answered by the evaluator in composition, never by retrieval.
  if (pre.arithmetic !== undefined) {
    return finish({
      shape: 'fact', intent: 'ask', concepts: [], normalized, tokens, cTokens,
      raw: rawInput, isBare: false, arithmetic: pre.arithmetic,
      isPureSocial: false, meta: false, injection: false, malicious: false, joke: false,
    });
  }

  // Pure small talk / meta / joke: answer as conversation and DO NOT retrieve.
  if (pre.isPureSocial || pre.meta || pre.joke) {
    return finish({
      shape: pre.shape,
      intent: pre.intent,
      concepts: [],
      normalized,
      tokens,
      cTokens,
      raw: rawInput,
      isBare: cTokens.length === 0,
      subKind: pre.subKind,
      isPureSocial: pre.isPureSocial,
      meta: pre.meta,
      injection: false,
      malicious: false,
      joke: pre.joke,
    });
  }

  // ── Subject linking (only for real requests now) ──────────────────────────
  let concepts = linkConcepts(normalized);
  let resolvedReferent = resolveReferent(normalized, opts.previousTopic, opts.previousTitle ?? '');
  // A pronoun subject ("how does IT handle errors") with no named concept reads
  // as a question about the previous topic. Marked so retrieval can apply the
  // appropriate (moderate) confidence rather than treating it as an exact hit.
  let pronounSubject = false;
  if (!resolvedReferent && concepts.length === 0 && opts.previousTopic && hasSubjectPronoun(normalized)) {
    resolvedReferent = opts.previousTopic;
    pronounSubject = true;
  }
  const secondary = splitSecondary(normalized);
  if (secondary) {
    // A second clause is only useful if it names a subject of its own, so link
    // it and append anything the primary clause did not already cover. The
    // composer answers the first subject and adds the second as a short
    // additional note, which is why this must produce real concepts rather than
    // the previous dead `secondary` string that nothing ever read.
    const extra = linkConcepts(secondary).filter(c => !concepts.some(x => x.id === c.id));
    if (extra.length > 0 && concepts.length > 0) {
      concepts = [...concepts, ...extra].sort((a, b) => a.span[0] - b.span[0]);
    }
  }
  const negation = detectNegation(normalized, concepts);
  const hasSubject = concepts.length > 0;
  const isNonEnglish = looksNonEnglish(normalized);

  // "no, I mean X" — a correction, which must override the previous topic.
  if (hasSubject && /^(?:no|nope|not that|i mean|i meant)\b/i.test(lower)) {
    return finish({
      shape: 'definition', intent: 'correct', concepts, normalized, tokens, cTokens,
      raw: rawInput, isBare: false, resolvedReferent,
      isPureSocial: false, meta: false, injection: false, malicious: false, joke: false,
    });
  }

  // ── Shape: decided independently of the subject ───────────────────────────
  const shape = decideShape(lower, cTokens, hasSubject);
  const intent: Intent = resolvedReferent && !hasSubject ? 'followup' : 'ask';

  return finish({
    shape,
    intent,
    concepts,
    normalized,
    tokens,
    cTokens,
    raw: rawInput,
    isBare: cTokens.length === 0,
    resolvedReferent: hasSubject ? undefined : resolvedReferent,
    pronounSubject,
    secondary,
    negation,
    isNonEnglish,
    corrections,
    isPureSocial: false,
    meta: false,
    injection: false,
    malicious: false,
    joke: false,
  });
}

interface FinishInput {
  shape: AnswerShape;
  intent: Intent;
  concepts: ConceptMatch[];
  normalized: string;
  tokens: string[];
  cTokens: string[];
  raw: string;
  isBare: boolean;
  resolvedReferent?: string;
  secondary?: string;
  negation?: NegationSpan;
  isNonEnglish?: boolean;
  subKind?: string;
  corrections?: Array<{ from: string; to: string }>;
  isPureSocial: boolean;
  meta: boolean;
  injection: boolean;
  malicious: boolean;
  joke: boolean;
  command?: string;
  commandArg?: string;
  arithmetic?: string;
  pronounSubject?: boolean;
}

function finish(i: FinishInput): QueryAnalysis {
  return {
    raw: i.raw,
    normalized: i.normalized,
    tokens: i.tokens,
    contentTokens: i.cTokens,
    shape: i.shape,
    intent: i.intent,
    concepts: i.concepts,
    negation: i.negation ?? { concepts: [], wholeRequest: false },
    resolvedReferent: i.resolvedReferent,
    isBare: i.isBare,
    secondary: i.secondary,
    isNonEnglish: i.isNonEnglish ?? false,
    isPureSocial: i.isPureSocial,
    meta: i.meta,
    injection: i.injection,
    malicious: i.malicious,
    joke: i.joke,
    subKind: i.subKind,
    command: i.command,
    commandArg: i.commandArg,
    arithmetic: i.arithmetic,
    pronounSubject: i.pronounSubject ?? false,
    corrections: i.corrections ?? [],
  };
}

function decideShape(lower: string, cTokens: string[], hasSubject: boolean): AnswerShape {
  // Comparison needs at least two known subjects, or an explicit "vs".
  if (/\b(?:vs\.?|versus)\b/i.test(lower)) return 'comparison';
  if (RE_COMPARISON.test(lower) && hasSubject) return 'comparison';
  if (RE_OPINION.test(lower)) return 'opinion';
  if (RE_REASON.test(lower)) return 'reason';
  if (RE_MECHANISM.test(lower)) return 'mechanism';
  if (RE_INSTANCE.test(lower)) return 'instance';
  if (RE_ENUMERATION.test(lower)) return 'enumeration';
  if (RE_DEFINITION.test(lower)) return 'definition';
  if (RE_FACT.test(lower)) return 'fact';
  // A bare subject ("closures") or a short subject phrase reads as "tell me
  // about X", which is a definition request.
  if (hasSubject) return 'definition';
  if (cTokens.length > 0) return 'definition';
  return 'definition';
}
