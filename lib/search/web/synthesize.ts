import type { WebSourceItem } from './types';
import { cleanSnippet, formatSearchTitle } from './text';

// Splits sentences while preserving common abbreviations like U.S., Dr., etc.
export function splitSentences(text: string): string[] {
  const protectedText = text
    .replace(/\bU\.S\./g, 'U_S_DOT')
    .replace(/\bDr\./g, 'Dr_DOT')
    .replace(/\bMr\./g, 'Mr_DOT')
    .replace(/\bMrs\./g, 'Mrs_DOT')
    .replace(/\be\.g\./g, 'e_g_DOT')
    .replace(/\bi\.e\./g, 'i_e_DOT');

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map(s =>
      s
        .replace(/U_S_DOT/g, 'U.S.')
        .replace(/Dr_DOT/g, 'Dr.')
        .replace(/Mr_DOT/g, 'Mr.')
        .replace(/Mrs_DOT/g, 'Mrs.')
        .replace(/e_g_DOT/g, 'e.g.')
        .replace(/i_e_DOT/g, 'i.e.')
    );
}

function extractKeywords(s: string): Set<string> {
  const words = s.toLowerCase().match(/\b[a-z0-9]{4,}\b/g) || [];
  return new Set(words);
}

function hasHighOverlap(newWords: Set<string>, existingWordSets: Set<string>[]): boolean {
  if (newWords.size === 0) return true;
  for (const existing of existingWordSets) {
    let intersection = 0;
    for (const w of newWords) {
      if (existing.has(w)) intersection++;
    }
    const overlapRatio = intersection / Math.min(newWords.size, existing.size);
    if (overlapRatio >= 0.55) return true;
  }
  return false;
}

const META_SENTENCE_REGEX = /^(in our|in this (post|blog|article|guide|overview|release)|what's new|how to upgrade|for a list of|read more|click here|discover enterprise|we shared step-by-step|all rights reserved|sign up|subscribe|let's dive in|check out|take a look|learn more|explore how)/i;
const HYPE_SENTENCE_REGEX = /(is here|is packed with|is full of|one of the most|in this blog|stay tuned|follow us on|don't miss out)/i;
const TRUNCATED_TAIL_REGEX = /\b(the|a|an|and|or|of|to|in|for|with|on|at|from|by|is|was|are|were|u\.s\.?)$/i;

/**
 * Synthesizes a clean, factual markdown overview from multiple web sources.
 */
export function synthesizeTruthOverview(query: string, sources: WebSourceItem[]): string {
  if (sources.length === 0) return '';

  const displayTitle = formatSearchTitle(query);
  const collectedSentences: string[] = [];
  const existingWordSets: Set<string>[] = [];

  for (const src of sources) {
    const rawSentences = splitSentences(src.snippet);
    for (const raw of rawSentences) {
      let s = cleanSnippet(raw);
      if (s.length < 25 || s.length > 280) continue;
      if (META_SENTENCE_REGEX.test(s) || HYPE_SENTENCE_REGEX.test(s)) continue;
      if (/cookies|privacy policy|terms of use|subscribe|all rights reserved|click here|sign up/i.test(s)) continue;

      const bareText = s.replace(/[.!?]+$/, '').trim();
      if (TRUNCATED_TAIL_REGEX.test(bareText)) continue;

      if (!/[.!?]$/.test(s)) {
        s += '.';
      }

      const words = extractKeywords(s);
      if (!hasHighOverlap(words, existingWordSets)) {
        existingWordSets.push(words);
        collectedSentences.push(s);
        if (collectedSentences.length >= 4) break;
      }
    }
    if (collectedSentences.length >= 4) break;
  }

  if (collectedSentences.length === 0) {
    return cleanSnippet(sources[0]?.snippet || '');
  }

  // Lead paragraph (up to 2 cohesive introductory sentences)
  const leadParagraph = collectedSentences.slice(0, 2).join(' ');
  const bulletPoints = collectedSentences.slice(2);

  let formatted = `### ${displayTitle}\n\n${leadParagraph}`;

  if (bulletPoints.length > 0) {
    formatted += '\n\n' + bulletPoints.map(p => {
      if (p.includes(':') && p.indexOf(':') < 40) {
        const [heading, ...rest] = p.split(':');
        return `- **${heading.trim()}**: ${rest.join(':').trim()}`;
      }
      return `- ${p}`;
    }).join('\n');
  }

  return formatted;
}
