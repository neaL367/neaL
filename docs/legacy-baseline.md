# Recorded legacy baseline

These are **measured** results, not estimates. They were produced by running the
legacy engine through the same harness (`eval/run.ts`, same 65 golden cases,
same grader) as V2, immediately before the legacy engine was removed from the
repository.

```bash
bun run eval/run.ts --engine=legacy --json
```

> **A note on the numbers below.** The legacy column is a historical record and
> has not been re-measured. The golden set has since been rewritten — the quiz
> feature and the JavaScript/React curriculum were removed and the knowledge base
> was replaced with Rockstar Games — so the current suite is **81** cases, not
> the 65 these figures were taken on. The V2 column is refreshed from the current
> run; the legacy column is frozen at the moment it was measured, on a set that
> no longer exists. Treat the comparison as "what the rebuild changed", not as a
> like-for-like score on today's suite.

## Headline

| Metric | Legacy | V2 | |
| --- | --- | --- | --- |
| Golden cases passing | **41 / 65** (63.1%) | **81 / 81** (100%) | current suite |
| Starter chips returning HTTP 400 | **4** | **0** | fixed |
| Latency p50 | 6.43 ms | 3.16 ms | 2.0× faster |
| Latency p95 | 16.64 ms | 9.66 ms | 1.7× faster |
| Distinct-4gram diversity | 0.606 | 0.578 | comparable |

The four chips that returned HTTP 400 were:

- `What is Neal’s tech stack?`
- `Tell me about Neal’s projects`
- `Tell me about Neal’s work`
- `What is Neal’s stack?`

All four contain a curly apostrophe (U+2019). The legacy input guard was
`/[^\x20-\x7E\s]/`, which rejects every non-ASCII character — so the engine
rejected the site's own starter chips, because the site's own content is written
with typographic apostrophes.

## Per class

The class breakdown below is stated against the **65-case set** the legacy engine
was measured on. Classes have since been re-scoped: `topic` now covers the
Rockstar catalogue, `command` no longer includes a quiz, and `multi` gained a
second case. The legacy figures are the recorded ones.

| Class | Legacy | V2 (as measured) | V2 (current suite) |
| --- | --- | --- | --- |
| retrieval | 5 / 11 | 11 / 11 | 9 / 9 |
| topic | 6 / 10 | 10 / 10 | 28 / 28 |
| compare | 2 / 4 | 4 / 4 | 7 / 7 |
| kg | 1 / 5 | 5 / 5 | 5 / 5 |
| discourse | 2 / 7 | 7 / 7 | 6 / 6 |
| multi | 0 / 1 | 1 / 1 | 2 / 2 |
| negation | 3 / 3 | 3 / 3 | 3 / 3 |
| social | 7 / 7 | 7 / 7 | 7 / 7 |
| command | 6 / 6 | 6 / 6 | 3 / 3 |
| safety | 4 / 6 | 6 / 6 | 5 / 5 |
| graceful | 3 / 3 | 3 / 3 | 3 / 3 |
| variety | 2 / 2 | 2 / 2 | 3 / 3 |

## Why the legacy engine was removed rather than kept

Keeping it would have required keeping `lib/chat` (38 files) and `lib/search`
(18 files) alive purely to be measured. Those modules are also the thing V2
replaces, so shipping them would ship the defect class. The measurement above is
the durable artefact; the implementation is not.

Two smaller capabilities were **not** carried forward, deliberately:

- **Semantic similarity.** The legacy engine declared `@huggingface/transformers`
  in `package.json` and `bun.lock`, but the package was absent from
  `node_modules` — the only one of 296 declared dependencies that was missing.
  `embedText()` therefore returned `null`, the semantic lane was always empty,
  and three of the four confidence signals were dead on arrival. V2 replaces this
  with a build-time PPMI co-occurrence table (`lib/nara/knowledge/expansion.json`)
  that needs no model and no download.
- **Web search.** Removed by decision. V2 makes no outbound requests.
