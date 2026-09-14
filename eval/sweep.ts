/**
 * Threshold sweep for the retrieval confidence gate.
 *
 * WHY THIS EXISTS
 * ---------------
 * `ANSWER_CONFIDENCE` / `CLARIFY_CONFIDENCE` in `lib/nara/retrieval/index.ts`
 * were hand-set. With 126 golden cases the operating point can be MEASURED:
 * this script re-runs the eval set across candidate answer thresholds and
 * prints score + latency per value, so any future proposal to move the gate
 * comes with numbers instead of intuition.
 *
 * The script never writes code — it only reports. Adopting a new threshold is
 * a deliberate edit to the pinned defaults plus an update of the comment there.
 *
 * Run with `bun run eval:sweep`.
 */
import { execFileSync } from 'node:child_process';

const ANSWER_VALUES = [0.4, 0.45, 0.5, 0.55, 0.6];

interface SweepRow {
  answer: number;
  passed: number;
  total: number;
  failedIds: string[];
  p50: number;
  p95: number;
}

function runOnce(answer: number): SweepRow {
  const out = execFileSync('bun', ['eval/run.ts', '--json'], {
    env: { ...process.env, NARA_ANSWER_CONF: String(answer) },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const report = JSON.parse(out) as {
    total: number;
    passed: number;
    ms: { p50: number; p95: number };
    results: Array<{ id: string; pass: boolean }>;
  };
  return {
    answer,
    passed: report.passed,
    total: report.total,
    failedIds: report.results.filter(r => !r.pass).map(r => r.id),
    p50: report.ms.p50,
    p95: report.ms.p95,
  };
}

const rows = ANSWER_VALUES.map(runOnce);

console.log('\n  threshold sweep (NARA_ANSWER_CONF, CLARIFY pinned at 0.22)');
console.log('  ' + '─'.repeat(66));
for (const r of rows) {
  const mark = r.passed === r.total ? '✓' : '✗';
  console.log(
    `  ${mark} answer=${r.answer.toFixed(2)}  ${r.passed}/${r.total}  p50=${r.p50}ms p95=${r.p95}ms` +
      (r.failedIds.length ? `  fails: ${r.failedIds.join(', ')}` : ''),
  );
}
console.log('  ' + '─'.repeat(66));

const best = Math.max(...rows.map(r => r.passed));
const winners = rows.filter(r => r.passed === best).map(r => r.answer.toFixed(2));
console.log(`  best score ${best}/${rows[0].total} at answer=[${winners.join(', ')}]\n`);
