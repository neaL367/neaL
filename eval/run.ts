/**
 * Nara evaluation harness.
 *
 * Usage:
 *   bun run eval/run.ts                 # evaluate the engine (default: v2)
 *   bun run eval/run.ts --json          # machine-readable output
 *   bun run eval/run.ts --write-baseline # record eval/baseline.json
 *
 * The harness never streams and never rate-limits: it drives the engine
 * directly so results are deterministic and comparable across runs.
 *
 * This once had a second adapter that drove the legacy engine, so the two could
 * be scored side by side. That engine has been deleted (see
 * `docs/legacy-baseline.md` for its measured results, which were 41/65 with 4
 * starter chips returning HTTP 400). Keeping an entire second engine alive in
 * the repository purely to keep scoreboarding it is not a good trade, so the
 * numbers are recorded and the code is gone.
 */
import { GOLDEN, MUST_NOT_400, type GoldenCase } from './golden';

interface CaseResult {
  id: string;
  cls: string;
  q: string;
  pass: boolean;
  failures: string[];
  answerText: string;
  state: unknown;
  ms: number;
}

interface Report {
  engine: 'v2';
  total: number;
  passed: number;
  failed: number;
  ms: { p50: number; p95: number; total: number };
  diversification: number;
  chips400: string[];
  byClass: Record<string, { pass: number; total: number }>;
  results: CaseResult[];
}

const args = process.argv.slice(2);
const writeBaseline = args.includes('--write-baseline') || args.includes('--baseline');
const jsonOut = args.includes('--json');
const engine = 'v2' as const;

interface Source {
  title: string;
  heading?: string;
  url?: string;
}

interface EngineResult {
  text: string;
  state: unknown;
  sources: Source[];
}

async function run(c: GoldenCase): Promise<EngineResult> {
  const mod = await import('@/lib/nara');
  const pre = c.pre ? [...c.pre] : [];

  // `pre` alternates user (even index) / assistant (odd index). Assistant lines
  // are fed back as the previous answer title so pronoun resolution has a
  // referent to work with — that is what makes the discourse cases meaningful.
  let state: unknown = mod.createState(20240607);
  let text = '';
  let sources: Source[] = [];

  const script: Array<{ role: 'user' | 'assistant'; text: string }> = [];
  for (let i = 0; i < pre.length; i++) {
    script.push({ role: i % 2 === 1 ? 'assistant' : 'user', text: pre[i] });
  }
  script.push({ role: 'user', text: c.q });

  for (const turn of script) {
    if (turn.role === 'assistant') {
      state = {
        ...(state as Record<string, unknown>),
        lastAnswerTitle: turn.text.slice(0, 200),
      };
      continue;
    }
    const res = mod.respond({ message: turn.text, state });
    text = res.answer.text;
    sources = res.answer.sources;
    state = res.state;
  }

  return { text: text || '[empty]', state, sources };
}

// ─── Grading ─────────────────────────────────────────────────────────────────

const GRACEFUL_MARKERS =
  /\b(i (don’t|don't|do not) have|not in (my|the) (index|corpus)|nothing (in|on) (my|the)|i couldn’t find|i could not find|couldn’t find|no (section|information|material) (on|about)|outside (what|the scope)|don’t have (a|any) (section|information)|do not have (a|any))\b/i;

/**
 * Sources may be delivered two ways: inline in the text (legacy formatting) or
 * as structured records in `answer.sources` (V2, which the client renders). The
 * check accepts either, because scanning only the text reported a correct,
 * fully-cited fact answer as uncited.
 */
function grade(c: GoldenCase, text: string, sources: Source[] = []): string[] {
  const failures: string[] = [];
  const e = c.expect;

  if (!text || text === '[empty]') {
    failures.push('empty answer');
    return failures;
  }

  if (e.graceful) {
    if (!GRACEFUL_MARKERS.test(text)) {
      failures.push('expected an honest decline, got a non-declining answer');
    }
  }

  for (const t of e.terms ?? []) {
    let re: RegExp;
    try {
      re = new RegExp(t, 'i');
    } catch {
      failures.push(`bad regex in expect.terms: ${t}`);
      continue;
    }
    if (!re.test(text)) failures.push(`missing required ${t}`);
  }

  for (const t of e.notTerms ?? []) {
    let re: RegExp;
    try {
      re = new RegExp(t, 'i');
    } catch {
      failures.push(`bad regex in expect.notTerms: ${t}`);
      continue;
    }
    if (re.test(text)) failures.push(`forbidden ${t} present`);
  }

  if (e.cites) {
    const inline = text.includes('/writing/') || /https?:\/\//.test(text) ||
      text.includes('**Source') || text.includes('Source:');
    if (!inline && sources.length === 0) failures.push('expected a citation/source link');
  }

  return failures;
}

function pct(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Math.round(sorted[Math.max(0, idx)] * 100) / 100;
}

/** Fraction of distinct 4-grams across all answers — lower means more repetitive. */
function diversification(answers: string[]): number {
  const grams = new Set<string>();
  let total = 0;
  for (const a of answers) {
    const words = a.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    for (let i = 0; i + 4 <= words.length; i++) {
      grams.add(words.slice(i, i + 4).join(' '));
      total++;
    }
  }
  return total === 0 ? 0 : Math.round((grams.size / total) * 1000) / 1000;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const results: CaseResult[] = [];
  const latencies: number[] = [];
  const answers: string[] = [];

  for (const c of GOLDEN) {
    const t0 = performance.now();
    let text = '';
    let sources: Source[] = [];
    let state: unknown = null;
    try {
      const r = await run(c);
      text = r.text;
      state = r.state;
      sources = r.sources;
    } catch (err) {
      text = `[THREW] ${(err as Error).message}`;
    }
    const ms = performance.now() - t0;
    latencies.push(ms);
    answers.push(text);

    const failures = grade(c, text, sources);
    results.push({ id: c.id, cls: c.class, q: c.q, pass: failures.length === 0, failures, answerText: text, state, ms });
  }

  // Suggestion chips must never be rejected.
  const chips400: string[] = [];
  for (const chip of MUST_NOT_400) {
    try {
      const r = await run({ id: 'chip', q: chip, expect: {}, class: 'chip', why: '' });
      if (/English only/.test(r.text)) chips400.push(chip);
    } catch {
      chips400.push(`${chip} [THREW]`);
    }
  }

  const byClass: Record<string, { pass: number; total: number }> = {};
  for (const r of results) {
    byClass[r.cls] ??= { pass: 0, total: 0 };
    byClass[r.cls].total++;
    if (r.pass) byClass[r.cls].pass++;
  }

  const passed = results.filter(r => r.pass).length;
  const report: Report = {
    engine,
    total: results.length,
    passed,
    failed: results.length - passed,
    ms: { p50: pct(latencies, 50), p95: pct(latencies, 95), total: Math.round(latencies.reduce((a, b) => a + b, 0)) },
    diversification: diversification(answers),
    chips400,
    byClass,
    results,
  };

  if (writeBaseline) {
    const fs = await import('node:fs');
    fs.writeFileSync('eval/baseline.json', JSON.stringify(report, null, 2));
    console.log(`\nWrote eval/baseline.json (${passed}/${results.length} passing)`);
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // Human report
  console.log(`\n${'='.repeat(72)}`);
  console.log(`  NARA EVAL — engine: ${engine}`);
  console.log(`${'='.repeat(72)}\n`);
  console.log(`  score          ${passed}/${results.length}  (${((passed / results.length) * 100).toFixed(1)}%)`);
  console.log(`  latency        p50 ${report.ms.p50}ms   p95 ${report.ms.p95}ms   total ${report.ms.total}ms`);
  console.log(`  diversity      ${report.diversification} distinct-4gram ratio (higher = less repetitive)`);
  console.log(`  chips 400ing   ${chips400.length}${chips400.length ? ' -> ' + chips400.slice(0, 5).join(' | ') : ''}`);

  console.log('\n  BY CLASS');
  for (const [cls, s] of Object.entries(byClass).sort()) {
    const bar = '█'.repeat(Math.round((s.pass / s.total) * 20)).padEnd(20, '·');
    console.log(`    ${cls.padEnd(12)} ${bar} ${s.pass}/${s.total}`);
  }

  const failures = results.filter(r => !r.pass);
  if (failures.length) {
    console.log(`\n  FAILING (${failures.length})`);
    for (const f of failures) {
      console.log(`\n    ✗ ${f.id}  [${f.cls}]`);
      console.log(`      q: ${f.q}`);
      for (const msg of f.failures) console.log(`      - ${msg}`);
      const snippet = f.answerText.replace(/\s+/g, ' ').slice(0, 150);
      console.log(`      got: ${snippet}${f.answerText.length > 150 ? '…' : ''}`);
    }
  } else {
    console.log('\n  ✓ all cases passing');
  }
  console.log('');
}

main().catch(err => {
  console.error('[eval] fatal:', err);
  process.exit(1);
});
