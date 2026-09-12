import type { RetrievalHit } from '@/lib/chat/types';
import fs from 'node:fs';
import path from 'node:path';
import precomputedEmbeddings from './embeddings.json';

export interface SectionEmbedding {
  id: string;
  pageTitle: string;
  heading: string;
  url: string;
  text: string;
  vector: number[];
}

export class SemanticIndex {
  private embeddings: SectionEmbedding[] = [];
  private vectorMatrix: Float32Array = new Float32Array(0);
  private readonly VECTOR_DIM = 384;
  private readonly MAX_CACHE_SIZE = 128;
  private queryCache = new Map<string, Float32Array>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractor: any = null;
  private initPromise: Promise<void> | null = null;
  private isReady = false;

  constructor() {
    this.loadPrecomputedEmbeddings();
  }

  private loadPrecomputedEmbeddings(): void {
    try {
      if (Array.isArray(precomputedEmbeddings) && precomputedEmbeddings.length > 0) {
        this.embeddings = precomputedEmbeddings as SectionEmbedding[];
      } else {
        const filePath = path.join(process.cwd(), 'lib', 'search', 'embeddings.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.embeddings = JSON.parse(raw) as SectionEmbedding[];
        }
      }
      this.syncVectorMatrix();
    } catch {
      this.embeddings = [];
      this.vectorMatrix = new Float32Array(0);
    }
  }

  private syncVectorMatrix(): void {
    const count = this.embeddings.length;
    if (count === 0) {
      this.vectorMatrix = new Float32Array(0);
      return;
    }

    this.vectorMatrix = new Float32Array(count * this.VECTOR_DIM);
    for (let i = 0; i < count; i++) {
      const vec = this.embeddings[i].vector;
      const offset = i * this.VECTOR_DIM;
      const len = Math.min(vec.length, this.VECTOR_DIM);
      for (let j = 0; j < len; j++) {
        this.vectorMatrix[offset + j] = vec[j] ?? 0;
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Dynamically import @huggingface/transformers
        const { pipeline, env } = await import('@huggingface/transformers');
        env.cacheDir = path.join(process.cwd(), '.cache', 'models');

        // Use 8-bit quantized all-MiniLM-L6-v2 (~22MB)
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          dtype: 'q8',
        });
        this.isReady = true;
      } catch (err) {
        console.warn('[SemanticIndex] Note: Model pipeline init deferred or offline:', err);
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  async search(query: string, limit: number = 3): Promise<RetrievalHit[]> {
    if (this.embeddings.length === 0) {
      this.loadPrecomputedEmbeddings();
    }

    if (this.embeddings.length === 0 || this.vectorMatrix.length === 0) {
      return [];
    }

    try {
      if (!this.extractor) {
        await this.initialize();
      }

      if (!this.extractor) {
        return [];
      }

      const normalizedQuery = query.trim().toLowerCase();
      let queryVector = this.queryCache.get(normalizedQuery);

      if (!queryVector) {
        // Generate query embedding via ONNX
        const output = await this.extractor(query, {
          pooling: 'mean',
          normalize: true,
        });

        queryVector = new Float32Array(output.data as Float32Array);

        // LRU eviction if cache exceeds threshold
        if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
          const oldestKey = this.queryCache.keys().next().value;
          if (oldestKey) this.queryCache.delete(oldestKey);
        }
        this.queryCache.set(normalizedQuery, queryVector);
      }

      // Fast contiguous memory dot product (cosine similarity)
      const count = this.embeddings.length;
      const scored: { section: SectionEmbedding; score: number }[] = new Array(count);

      for (let i = 0; i < count; i++) {
        let dot = 0;
        const offset = i * this.VECTOR_DIM;
        for (let j = 0; j < this.VECTOR_DIM; j++) {
          dot += queryVector[j] * this.vectorMatrix[offset + j];
        }
        scored[i] = {
          section: this.embeddings[i],
          score: dot,
        };
      }

      // Sort descending by similarity and filter out noise below threshold (0.35)
      scored.sort((a, b) => b.score - a.score);
      const relevant = scored.filter((item) => item.score >= 0.35);

      return relevant.slice(0, limit).map((item) => ({
        id: item.section.id,
        title: item.section.pageTitle,
        heading: item.section.heading,
        excerpt: item.section.text.slice(0, 220),
        url: item.section.url,
        score: item.score,
        lane: 'semantic' as const,
        contextSentence: item.section.text,
      }));
    } catch (err) {
      console.warn('[SemanticIndex] Search fallback:', err);
      return [];
    }
  }

  // Helper used by offline build script
  setPrecomputedEmbeddings(embeddings: SectionEmbedding[]): void {
    this.embeddings = embeddings;
    this.syncVectorMatrix();
  }
}

export const semanticIndex = new SemanticIndex();

// Non-blocking background pre-warming to eliminate first-request cold start
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    semanticIndex.initialize().catch(() => {});
  }, 1000);
}
