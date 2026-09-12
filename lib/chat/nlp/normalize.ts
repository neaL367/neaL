/**
 * Typing-style normalizer: maps the way people actually type (slang,
 * abbreviations, elongations, common typos) onto the canonical words the
 * intent patterns, concept graph, and retrieval lanes understand.
 *
 * Idempotent: running it twice changes nothing. Letters-only elongation
 * collapse keeps math, code, URLs, and emoji-adjacent punctuation intact.
 * Applied once in route.ts and defensively inside classify/extract so
 * direct callers (scripts, tests) get identical behavior.
 */

const ELONGATED_RE = /([a-z])\1{2,}/g;

// Whole-word chat vocabulary. Values are canonical English.
const CHAT_MAP: Record<string, string> = {
  // Pronouns / verbs
  u: 'you',
  ur: 'your',
  urs: 'yours',
  r: 'are',
  im: 'i am',
  imma: 'i am going to',
  ive: 'i have',
  youre: 'you are',
  theyre: 'they are',
  // Politeness
  pls: 'please',
  plz: 'please',
  thx: 'thanks',
  ty: 'thank you',
  tysm: 'thank you',
  thankyou: 'thank you',
  sry: 'sorry',
  np: 'no problem',
  yw: 'you are welcome',
  // Contractions without apostrophes
  dont: 'do not',
  doesnt: 'does not',
  cant: 'cannot',
  wont: 'will not',
  isnt: 'is not',
  arent: 'are not',
  wasnt: 'was not',
  werent: 'were not',
  havent: 'have not',
  hasnt: 'has not',
  didnt: 'did not',
  couldnt: 'could not',
  shouldnt: 'should not',
  wouldnt: 'would not',
  // Casual verbs
  gimme: 'give me',
  lemme: 'let me',
  wanna: 'want to',
  gonna: 'going to',
  gotta: 'got to',
  kinda: 'kind of',
  sorta: 'sort of',
  dunno: 'do not know',
  // Shortenings / typos
  bout: 'about',
  abt: 'about',
  tel: 'tell',
  msg: 'message',
  info: 'information',
  pic: 'picture',
  dev: 'developer',
  docs: 'documentation',
  thru: 'through',
  tho: 'though',
  coz: 'because',
  cuz: 'because',
  cos: 'because',
  wat: 'what',
  wut: 'what',
  teh: 'the',
  js: 'javascript',
  ts: 'typescript',
  // Fillers / acronyms worth expanding
  btw: 'by the way',
  fyi: 'for your information',
  tbh: 'to be honest',
  idk: 'i do not know',
  nvm: 'never mind',
  hbu: 'how about you',
  wbu: 'what about you',
  brb: 'be right back',
  gtg: 'got to go',
  g2g: 'got to go',
  l8r: 'later',
  omg: 'oh my god',
  // Gen-z agreement (bare "bet" / "fr" / "ong" / "facts" = "you're right")
  bet: 'yes',
  fr: 'yes',
  ong: 'yes',
  facts: 'yes',
  // Millennial shorthand
  probs: 'probably',
  def: 'definitely',
  totes: 'totally',
  uni: 'university',
  fml: 'i am frustrated',
  hiya: 'hi',
  heyo: 'hey',
  preesh: 'appreciate',
  thanking: 'thank',
  // Boomer politeness (kept, mapped to canonical forms)
  kindly: 'please',
  dear: '',
  regards: 'thanks',
  // Elongated doubles left after collapse (heyyy -> heyy -> hey)
  heyy: 'hey',
  hii: 'hi',
  yoo: 'yo',
  yess: 'yes',
  noo: 'no',
};

export function normalizeMessage(raw: string): string {
  let s = raw.toLowerCase();
  // Collapse letter runs of 3+ to 2 ("pleaase" -> "please", "heyyy" -> "heyy").
  s = s.replace(ELONGATED_RE, '$1$1');
  const out: string[] = [];
  for (const tok of s.split(/\s+/)) {
    if (!tok) continue;
    // Look up the word without attached punctuation ("tysm!" -> "tysm"),
    // but keep the original token when nothing maps (code/math intact).
    const lookup = tok.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    const mapped = CHAT_MAP[lookup] ?? tok;
    if (mapped) out.push(mapped);
  }
  return out.join(' ');
}
