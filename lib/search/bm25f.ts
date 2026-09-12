import type {
  DocumentSection,
  FieldType,
  InvertedIndexPosting,
  ScoredSection,
  TermEntry,
} from './types';
import { stemWord } from '@/lib/chat/tokenizer';
export { stemWord };

const FIELD_WEIGHTS: Record<FieldType, number> = {
  title: 4.0,
  heading: 3.0,
  summary: 2.5,
  body: 1.0,
};

const FIELD_B: Record<FieldType, number> = {
  title: 0.3,
  heading: 0.5,
  summary: 0.6,
  body: 0.75,
};

const K1 = 1.2;

export class BM25FEngine {
  private sections: Map<string, DocumentSection> = new Map();
  private invertedIndex: Map<string, TermEntry> = new Map();
  private avgFieldLengths: Record<FieldType, number> = {
    title: 1,
    heading: 1,
    summary: 1,
    body: 1,
  };
  private totalSections: number = 0;
  private vocabulary: Set<string> = new Set();

  constructor(sections: DocumentSection[]) {
    this.buildIndex(sections);
  }

  public getVocabulary(): string[] {
    return Array.from(this.vocabulary);
  }

  private buildIndex(sections: DocumentSection[]): void {
    this.totalSections = sections.length;
    const fieldTotals: Record<FieldType, number> = {
      title: 0,
      heading: 0,
      summary: 0,
      body: 0,
    };

    // 1. Calculate average field lengths & save sections
    for (const sec of sections) {
      this.sections.set(sec.id, sec);
      for (const f of ['title', 'heading', 'summary', 'body'] as FieldType[]) {
        fieldTotals[f] += sec.fieldLengths[f] || 0;
      }
    }

    for (const f of ['title', 'heading', 'summary', 'body'] as FieldType[]) {
      this.avgFieldLengths[f] = Math.max(
        1,
        fieldTotals[f] / Math.max(1, this.totalSections)
      );
    }

    // 2. Populate postings
    const docTermMap: Map<string, Map<string, InvertedIndexPosting[]>> = new Map();

    for (const sec of sections) {
      for (const field of ['title', 'heading', 'summary', 'body'] as FieldType[]) {
        const tokens = sec.fieldTokens[field];
        const positionsMap: Map<string, number[]> = new Map();

        tokens.forEach((token, pos) => {
          this.vocabulary.add(token);
          const stemmed = stemWord(token);
          this.vocabulary.add(stemmed);

          if (!positionsMap.has(stemmed)) {
            positionsMap.set(stemmed, []);
          }
          positionsMap.get(stemmed)!.push(pos);
        });

        for (const [stemmed, positions] of positionsMap.entries()) {
          if (!docTermMap.has(stemmed)) {
            docTermMap.set(stemmed, new Map());
          }
          const termDocs = docTermMap.get(stemmed)!;
          if (!termDocs.has(sec.id)) {
            termDocs.set(sec.id, []);
          }
          termDocs.get(sec.id)!.push({
            sectionId: sec.id,
            field,
            tf: positions.length,
            positions,
          });
        }
      }
    }

    // 3. Compute IDF and finalize inverted index
    for (const [stemmed, termDocs] of docTermMap.entries()) {
      const df = termDocs.size;
      // Lucene / BM25 IDF formula
      const idf = Math.log(
        1 + (this.totalSections - df + 0.5) / (df + 0.5)
      );

      const allPostings: InvertedIndexPosting[] = [];
      for (const postings of termDocs.values()) {
        allPostings.push(...postings);
      }

      this.invertedIndex.set(stemmed, {
        df,
        idf: Math.max(0.1, idf),
        postings: allPostings,
        sectionPostings: termDocs,
      });
    }
  }

  /**
   * Search sections using field-weighted BM25F, positional proximity, and phrase matching.
   */
  public search(
    searchTerms: string[],
    primaryTerms: string[] = [],
    rawQuery: string = ''
  ): ScoredSection[] {
    if (searchTerms.length === 0) return [];

    const stemmedSearch = searchTerms.map((t) => stemWord(t));
    const stemmedPrimary = (primaryTerms.length > 0 ? primaryTerms : searchTerms).map((t) =>
      stemWord(t)
    );
    const cleanRaw = rawQuery.toLowerCase().trim();

    // Map: sectionId -> partial scores
    const sectionMatches: Map<
      string,
      {
        bm25: number;
        matchedTerms: Set<string>;
        matchedPrimaryTerms: Set<string>;
        positions: number[];
      }
    > = new Map();

    for (const term of stemmedSearch) {
      const entry = this.invertedIndex.get(term);
      if (!entry) continue;

      // Use pre-computed section groupings to eliminate per-search heap allocations
      const sectionPostings =
        entry.sectionPostings || new Map<string, InvertedIndexPosting[]>();

      for (const [secId, postings] of sectionPostings.entries()) {
        const sec = this.sections.get(secId);
        if (!sec) continue;

        if (!sectionMatches.has(secId)) {
          sectionMatches.set(secId, {
            bm25: 0,
            matchedTerms: new Set(),
            matchedPrimaryTerms: new Set(),
            positions: [],
          });
        }
        const state = sectionMatches.get(secId)!;
        state.matchedTerms.add(term);
        if (stemmedPrimary.includes(term)) {
          state.matchedPrimaryTerms.add(term);
        }

        // Calculate normalized field frequency
        let normTf = 0;
        for (const p of postings) {
          const w = FIELD_WEIGHTS[p.field] || 1.0;
          const b = FIELD_B[p.field] || 0.75;
          const len = sec.fieldLengths[p.field] || 1;
          const avgLen = this.avgFieldLengths[p.field] || 1;

          const lenNorm = 1 - b + b * (len / avgLen);
          normTf += (w * p.tf) / lenNorm;

          // Collect body/heading positions for proximity
          if (p.field === 'body' || p.field === 'heading') {
            state.positions.push(...p.positions);
          }
        }

        // BM25 term contribution
        const termScore = entry.idf * ((normTf * (K1 + 1)) / (normTf + K1));
        state.bm25 += termScore;
      }
    }

    // Convert matches to ranked ScoredSection
    const results: ScoredSection[] = [];

    for (const [secId, match] of sectionMatches.entries()) {
      const sec = this.sections.get(secId)!;
      // Coverage is ratio of user's core concepts present (or expanded if synonyms matched)
      const primaryCoverage =
        match.matchedPrimaryTerms.size / Math.max(1, stemmedPrimary.length);
      const fallbackCoverage =
        Math.min(1, match.matchedTerms.size / Math.max(1, stemmedPrimary.length));
      const coverageRatio = Math.max(primaryCoverage, fallbackCoverage * 0.8);

      // 1. Proximity bonus: check minimum span of matching terms in the passage
      let proximityBonus = 0;
      if (match.positions.length >= 2 && match.matchedTerms.size >= 2) {
        const sortedPos = [...match.positions].sort((a, b) => a - b);
        let minSpan = 9999;
        for (let i = 0; i < sortedPos.length - 1; i++) {
          const diff = sortedPos[i + 1] - sortedPos[i];
          if (diff > 0 && diff < minSpan) {
            minSpan = diff;
          }
        }
        if (minSpan <= 15) {
          proximityBonus = 2.0 / (minSpan + 1);
        }
      }

      // 2. Exact phrase bonus
      let phraseBonus = 0;
      if (cleanRaw.length > 4 && sec.text.toLowerCase().includes(cleanRaw)) {
        phraseBonus = 4.0;
      } else if (
        cleanRaw.length > 4 &&
        sec.heading.toLowerCase().includes(cleanRaw)
      ) {
        phraseBonus = 6.0;
      }

      const totalScore = match.bm25 + proximityBonus + phraseBonus;

      results.push({
        section: sec,
        bm25Score: match.bm25,
        coverageRatio,
        matchedTokens: Array.from(match.matchedTerms),
        proximityBonus,
        phraseBonus,
        totalScore,
      });
    }

    // Sort descending by total score
    return results.sort((a, b) => b.totalScore - a.totalScore);
  }
}
