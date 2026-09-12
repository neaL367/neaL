/**
 * TextRank Extractive Summarizer
 * Graph-based ranking algorithm using PageRank over sentence similarity graphs.
 */

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map(s => s.trim())
    .filter(s => s.length >= 20 && !s.startsWith('#') && !s.startsWith('```'));
}

function tokenizeSentence(sentence: string): Set<string> {
  const words = sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
  return new Set(words);
}

function calculateSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const word of tokensA) {
    if (tokensB.has(word)) intersection++;
  }

  // Jaccard similarity normalized by logarithmic length
  const logLen = Math.log(tokensA.size) + Math.log(tokensB.size);
  if (logLen === 0) return 0;

  return intersection / logLen;
}

export function extractKeySentences(text: string, count: number = 2): string[] {
  const sentences = splitIntoSentences(text);
  if (sentences.length <= count) return sentences;

  const sentenceTokens = sentences.map(tokenizeSentence);
  const n = sentences.length;

  // Build flattened adjacency matrix (n x n)
  const similarityMatrix = new Float32Array(n * n);
  const weightSums = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const rowOffset = i * n;
    for (let j = i + 1; j < n; j++) {
      const sim = calculateSimilarity(sentenceTokens[i], sentenceTokens[j]);
      similarityMatrix[rowOffset + j] = sim;
      similarityMatrix[j * n + i] = sim;
      weightSums[i] += sim;
      weightSums[j] += sim;
    }
  }

  // Pre-allocated ping-pong buffers for PageRank scores (zero allocations in loop)
  let scores = new Float64Array(n);
  scores.fill(1.0);
  let nextScores = new Float64Array(n);
  const dampingFactor = 0.85;
  const baseScore = 1.0 - dampingFactor;
  const iterations = 15;

  for (let iter = 0; iter < iterations; iter++) {
    nextScores.fill(baseScore);

    for (let i = 0; i < n; i++) {
      let incoming = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j && weightSums[j] > 0) {
          incoming += (similarityMatrix[j * n + i] / weightSums[j]) * scores[j];
        }
      }
      nextScores[i] += dampingFactor * incoming;
    }

    const temp = scores;
    scores = nextScores;
    nextScores = temp;
  }

  // Pair sentences with scores and original index
  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scores[index],
  }));

  // Select top N scored sentences
  const topScored = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  // Re-sort selected sentences by original chronological index for coherent narrative flow
  return topScored
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);
}
