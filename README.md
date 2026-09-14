# Neal — portfolio site with a local assistant

A Next.js 16 App Router portfolio. The notable part is **Nara**, the chat
assistant: a retrieval engine that answers questions from a curated knowledge
base using only what has been written into it, with **no language model, no API
key and no outbound network request**.

The site's subject matter is **Rockstar Games** — its games, studios, technology
and controversies — alongside pages about this site's author. The assistant no
longer teaches a JavaScript/React curriculum; that corpus and the quiz feature
built on it were removed. See [Knowledge base](#knowledge-base).

## Nara

Nara is a deterministic retrieval engine. It is not a chatbot that has been
prompted to stay on topic — there is nothing to steer, because there is no model
generating text. Every sentence in an answer exists verbatim in a curated
source.

### How it works

```
message
  └─ analyze      shape the question (safety / small talk / command / comparison /
                  definition / mechanism) BEFORE deciding what it is about
  └─ retrieve     fact lane + lexical lanes (BM25F) + concept-graph lane +
                  offline expansion lane, fused with Reciprocal Rank Fusion
  └─ gate         evidence-based confidence decides answer / clarify / decline
  └─ compose      extractive assembly from the winning source
  └─ record       dialogue state for follow-ups
```

The design principle: **a confident wrong answer is worse than no answer.**
Recall is deliberately traded away to make false subjects structurally
impossible. When the knowledge base does not cover something, Nara says so.

### Three things that are unusual

**Question shape is decided before topic routing.** An earlier design matched
keywords first, which meant `"hey, explain the RAGE engine"` matched the
*greeting* handler and replied with small talk. Intent is now established first,
and small talk never reaches retrieval.

**Confidence is measured from evidence, not from keyword overlap.** A concept
merely being *mentioned* is not evidence that it answers the question. The
confidence score combines alias coverage, phrase strength, whether the document
is the primary subject, concept linking, curation and cross-lane agreement. A
document with no concept link is capped below the answer threshold — which is
why corpus sections are mapped to concepts by a scorer rather than by a
hand-written table (see `conceptsForCorpusSection`).

**Semantic similarity is compiled, not computed.** Related terms are mined at
build time from how the curated prose uses words together (PPMI co-occurrence),
then frozen into `lib/nara/knowledge/expansion.json`. At runtime that is a hash
lookup — no ONNX runtime, no model download, and nothing that can silently
return `null`.

### Commands

| Command | Effect |
| --- | --- |
| `/help` | What Nara can do |
| `/topics` | What the site covers |
| `/about` | What Nara is |
| `/debug` | Session state |
| `/reset` | Clear conversation context |

Prose works too, and a message may name two subjects: "What is the RAGE engine
and what is Euphoria?" is answered as the first subject plus a short note on the
second. A list inside a single question ("what are GTA and Red Dead") is *not*
split, because the clause detector requires an additive marker followed by a
second interrogative.

### Knowledge base

The knowledge base is curated data, not a model. Four layers, all in
`lib/nara/data/`:

| Layer | File | What it provides |
| --- | --- | --- |
| Topics | `topics/rockstar-games-topics.ts`, `topics/rockstar-company-topics.ts` | The games, studios, technology and controversies, with summary + detail prose |
| Concepts | `topics/concepts-dict.ts` | The short canonical identity of each subject |
| Graph | `concept-graph-data.ts` | Nodes, aliases and the annotated relations between them |
| Facts | `knowledge-graph-data.ts` | Exact answers (dates, contact, links) with their aliases |

**The prose in the topic files is a stub.** It is factually correct and
deliberately short; it exists so the retrieval structure — ids, aliases,
relations, keyword forms — is complete and testable. Because composition is
extractive, whatever you write into `summary` and `detail` is exactly what gets
quoted back. Replacing the text needs no code changes.

What must *not* be renamed casually is a topic's `id`, its `keywords`/`phrases`,
and its `relatedConcepts`: the id joins the topic to the concept graph and the
facts, and the keyword/phrase lists are what make "Vice City" and "the one set in
Miami" reach the same record.

Two data rules the tests enforce:

- **One topic per concept.** A concept that borrows another concept's topic has
  no label of its own, which is how comparing RAGE against Euphoria once printed
  the same name on both sides. `euphoria` is a separate topic for this reason.
- **`phrases` become matchable aliases; `keywords` do not.** A topic whose title's
  bare form doesn't include the obvious short name needs an explicit `phrase`
  (see `table-tennis`), or the obvious question links nothing.

### Layout

```
lib/nara/
  types.ts              the type surface
  respond.ts            single entry point: analyze -> retrieve -> compose
  language/
    normalize.ts        conservative text normalisation
    text.ts             tokenize / stem / index variants
    lexicon.ts          corpus-derived stemming exceptions
    query.ts            analysis: shape, subject, referent, negation
  retrieval/
    lexical.ts          BM25F + fact lookup
    index.ts            lanes + RRF fusion + confidence
    expand.ts           offline query expansion
  compose/
    index.ts            extractive composition
    commands.ts         slash commands
  dialogue/state.ts     validated conversation state
  knowledge/
    index.ts            the unified concept index
    corpus.json         generated: the site's own prose
    expansion.json      generated: PPMI term associations
  data/                 curated content (topics, concepts, graph, facts, films)
```

### Regenerating the knowledge base

`corpus.json` and `expansion.json` are generated from the MDX sources. Run this
after editing any page content:

```bash
bun run build:knowledge     # corpus, then semantic expansion
```

Both scripts fail loudly rather than emitting degraded data: the corpus builder
refuses to write a section containing markup residue and validates the stemmer's
silent-e coverage against the corpus, and the expansion miner requires a minimum
term frequency before associating anything.

### Testing

```bash
bun run eval              # 138 golden cases
bun run eval:sweep        # threshold operating-point sweep (report only)
bun run test:language     # 72 language/stemmer invariants
```

Current state: **138/138** golden cases, **72/72** language invariants, p50
latency ~7.5 ms, p95 budget 200 ms, and **0** starter chips rejected. The
knowledge base holds **93 topics** (26 date-stamped) over **97 graph nodes**;
`bun run check:knowledge` additionally enforces alias-ownership (no two real
entries may claim one alias) and flags date-bearing sentences the extractive
composer cannot quote.

For comparison, the engine this replaced scored 41/65 on its own (smaller) set
and rejected four of its own starter chips with HTTP 400 — all four contained a
typographic apostrophe, which the old input guard `/[^\x20-\x7E\s]/` treated as
invalid. Full measured results: [`docs/legacy-baseline.md`](docs/legacy-baseline.md).

## Site

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
bun run lint
```

Content lives in `app/writing/posts/` as MDX. `app/rss`, `app/sitemap.ts`,
`app/robots.ts` and `app/manifest.ts` are generated from that content.

## Privacy

The assistant makes no network requests. There is no analytics on the chat
endpoint, no logging of message content, and no third-party service. The only
outbound-facing behaviour in the app is the rate limiter on `/api/chat`, which
counts requests per IP in memory and does not persist them.
