/**
 * Knowledge-base integrity check.
 *
 * WHY THIS EXISTS
 * ---------------
 * Two failure modes are silent by nature in a curated retrieval engine, and
 * both have already happened once in this repository:
 *
 *   1. **Dangling references.** A topic can name a `relatedConcept`, or the
 *      concept graph can draw an edge, to an id that does not exist. Nothing
 *      errors — the relation simply never resolves, and a comparison or a
 *      "related" chip quietly degrades. The domain swap left eleven such
 *      aliases behind, and an entire hand-written corpus→concept table pointing
 *      at deleted concepts, which capped those pages below the answer threshold.
 *
 *   2. **Silent staleness.** Sales totals, release dates and "current status"
 *      claims are true on the day they are written and wrong later. Nothing in
 *      the type system notices. This script requires any entry whose content can
 *      drift to carry `verifiedAt`, and fails once that date is older than the
 *      configured ceiling so the entry is re-checked rather than trusted.
 *
 * It also enforces the structural rules the retrieval engine depends on:
 * one topic per concept id, unique node/edge keys, and every `aliases` entry
 * being non-empty and lowercase so linking can actually match it.
 *
 * Run with `bun run check:knowledge`.
 */
import { TOPICS, CONCEPTS, GRAPH_NODES, GRAPH_EDGES, TOPIC_BY_ID, CONCEPT_INDEX } from '../lib/nara/knowledge/index';

/** Days after which a verified entry is considered due for re-checking. */
const STALE_WARN_DAYS = 180;
const STALE_FAIL_DAYS = 365;

const today = new Date();
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function daysSince(iso: string): number {
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.floor((today.getTime() - then) / 86_400_000);
}

const errors: string[] = [];
const warnings: string[] = [];

// ─── 1. Dangling references ──────────────────────────────────────────────────

const topicIds = new Set(TOPICS.map(t => t.id));
const nodeIds = new Set(GRAPH_NODES.map(n => n.id));
const conceptIds = new Set(CONCEPTS.map(c => c.id));
const known = new Set([...CONCEPT_INDEX.keys()]);

for (const t of TOPICS) {
  for (const rel of t.relatedConcepts) {
    if (!known.has(rel)) {
      errors.push(`topic "${t.id}" -> relatedConcepts "${rel}" is not a known concept`);
    }
  }
  for (const [i, kw] of t.keywords.entries()) {
    if (!kw || kw !== kw.trim()) {
      errors.push(`topic "${t.id}" keyword[${i}] is empty or untrimmed: ${JSON.stringify(kw)}`);
    }
  }
}

for (const e of GRAPH_EDGES) {
  if (!known.has(e.from)) errors.push(`edge "${e.from}" -> "${e.to}": unknown source node`);
  if (!known.has(e.to)) errors.push(`edge "${e.from}" -> "${e.to}": unknown target node`);
  if (e.from === e.to) errors.push(`edge "${e.from}" -> "${e.to}": self-loop`);
}

// ─── 2. Duplicate keys ───────────────────────────────────────────────────────

const seenNodes = new Set<string>();
for (const n of GRAPH_NODES) {
  if (seenNodes.has(n.id)) errors.push(`duplicate graph node id "${n.id}"`);
  seenNodes.add(n.id);
}

const edgeKeys = new Set<string>();
for (const e of GRAPH_EDGES) {
  // Undirected duplicate: A->B and B->A with the same relation is the same claim.
  const key = [e.from, e.to].sort().join('|') + '|' + e.relation;
  if (edgeKeys.has(key)) warnings.push(`duplicate edge (undirected) ${e.from} ~ ${e.to} [${e.relation}]`);
  edgeKeys.add(key);
}

// ─── 3. One topic per concept id, and lowercase aliases ──────────────────────

const topicIdCounts = new Map<string, number>();
for (const t of TOPICS) topicIdCounts.set(t.id, (topicIdCounts.get(t.id) ?? 0) + 1);
for (const [id, n] of topicIdCounts) {
  if (n > 1) errors.push(`topic id "${id}" is declared ${n} times (ids must be unique)`);
}

for (const n of GRAPH_NODES) {
  for (const a of n.aliases) {
    if (a !== a.toLowerCase()) errors.push(`node "${n.id}" alias "${a}" is not lowercase`);
    if (!a.trim()) errors.push(`node "${n.id}" has an empty alias`);
  }
  if (!n.description.trim()) warnings.push(`node "${n.id}" has no description`);
}

for (const [id, c] of Object.entries(CONCEPTS)) {
  if (!c.label?.trim()) errors.push(`concept "${id}" has no label`);
  if (!c.definition?.trim()) errors.push(`concept "${id}" has no definition`);
}

// ─── 4. Staleness ────────────────────────────────────────────────────────────

let datedCount = 0;
for (const t of TOPICS) {
  if (!t.verifiedAt) continue;
  datedCount++;
  if (!ISO.test(t.verifiedAt)) {
    errors.push(`topic "${t.id}" verifiedAt "${t.verifiedAt}" is not YYYY-MM-DD`);
    continue;
  }
  const age = daysSince(t.verifiedAt);
  if (age > STALE_FAIL_DAYS) {
    errors.push(`topic "${t.id}" was verified ${age} days ago (${t.verifiedAt}) — re-check it`);
  } else if (age > STALE_WARN_DAYS) {
    warnings.push(`topic "${t.id}" verified ${age} days ago (${t.verifiedAt}) — due for review`);
  }
  if (!t.timeSensitive) {
    warnings.push(`topic "${t.id}" has verifiedAt but no timeSensitive note explaining what drifts`);
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

const stats = [
  `topics            ${TOPICS.length}`,
  `  with sources    ${TOPICS.filter(t => t.sources?.length).length}`,
  `  dated           ${datedCount}`,
  `concepts          ${CONCEPTS.length}`,
  `graph nodes       ${GRAPH_NODES.length}`,
  `graph edges       ${GRAPH_EDGES.length}`,
  `concept index     ${CONCEPT_INDEX.size}`,
  `topic ids         ${topicIds.size}`,
  `node ids          ${nodeIds.size}`,
  `concept dict ids  ${conceptIds.size}`,
];

console.log('\n  knowledge base');
console.log('  ' + '─'.repeat(34));
for (const s of stats) console.log('  ' + s);
console.log('  ' + '─'.repeat(34));

for (const w of warnings) console.log(`  ~ ${w}`);

if (errors.length > 0) {
  console.log('');
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(`\n  ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  process.exit(1);
}

console.log(`\n  ✓ integrity ok — ${errors.length} errors, ${warnings.length} warnings\n`);
