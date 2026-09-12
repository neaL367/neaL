import type { DocumentSection } from './types';
import { TOPICS, CONCEPTS } from '@/lib/chat/knowledge/topics';
import { GENERATED_SECTIONS } from './site-index-data.generated';

// Generated rows carry no embedText of their own; the mapping below defaults
// them to heading + summary. Typed explicitly so the union stays assignable.
const PAGE_SECTIONS: RawSectionConfig[] = GENERATED_SECTIONS;

/**
 * Site search index: FULL page/post content generated from MDX sources
 * (see scripts/build-site-index.ts) plus curated TOPICS/CONCEPTS entries.
 * Never hand-copy post text here — edit the MDX and regenerate.
 */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

interface RawSectionConfig {
  id: string;
  slug: string;
  url: string;
  pageTitle: string;
  heading: string;
  level: number;
  summary?: string;
  publishedAt?: string;
  text: string;
  embedText?: string;
}

export const SITE_SECTIONS: DocumentSection[] = [
  ...PAGE_SECTIONS,
  // ─── Curated knowledge (TOPICS + CONCEPTS) ───────────────────────────────
  // Indexed here so BM25 and semantic lanes cover concepts, not just pages.
  // Ids intentionally match the topic/concept retrieval lanes (`topic:<id>`,
  // `concept:<id>`) so RRF fuses cross-lane votes for the same doc instead
  // of surfacing duplicates.
  ...TOPICS.map(
    (t): RawSectionConfig => ({
      id: `topic:${t.id}`,
      slug: 'topics',
      url: '/',
      pageTitle: t.title,
      heading: t.title,
      level: 2,
      summary: t.summary,
      text: `${t.summary}\n\n${t.detail}`,
      embedText: `${t.title}. ${t.summary} Also known as: ${[...t.keywords, ...(t.phrases || [])].join(', ')}.`,
    })
  ),
  ...Object.entries(CONCEPTS)
    .filter(([id]) => !TOPICS.some(t => t.id === id))
    .map(
      ([id, c]): RawSectionConfig => ({
        id: `concept:${id}`,
        slug: 'concepts',
        url: '/',
        pageTitle: c.label,
        heading: c.label,
        level: 2,
        summary: c.definition.slice(0, 160),
        text: c.definition,
      })
    ),
].map((raw) => {
  const titleTokens = tokenize(raw.pageTitle);
  const headingTokens = tokenize(raw.heading);
  const summaryTokens = tokenize(raw.summary || '');
  const bodyTokens = tokenize(raw.text);

  return {
    ...raw,
    // Dense vectors want heading-led, moderately-sized input: full bodies
    // dilute short sections, but pure heading+summary starves rich ones.
    // Full text stays for BM25 recall and display/summarization.
    embedText:
      raw.embedText ||
      `${raw.heading}. ${raw.summary || ''} ${raw.text.slice(0, 300)}`.trim(),
    sentences: splitSentences(raw.text),
    fieldTokens: {
      title: titleTokens,
      heading: headingTokens,
      summary: summaryTokens,
      body: bodyTokens,
    },
    fieldLengths: {
      title: titleTokens.length,
      heading: headingTokens.length,
      summary: summaryTokens.length,
      body: bodyTokens.length,
    },
  };
});
