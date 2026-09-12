import { pipeline, env } from '@huggingface/transformers';
import { SITE_SECTIONS } from '../lib/search/site-index-data';
import fs from 'node:fs';
import path from 'node:path';

async function buildEmbeddings() {
  console.log('[build-embeddings] Initializing local ONNX model...');
  const cacheDir = path.join(process.cwd(), '.cache', 'models');
  env.cacheDir = cacheDir;

  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    dtype: 'q8',
  });

  console.log(`[build-embeddings] Encoding ${SITE_SECTIONS.length} site sections...`);
  const embeddings = [];

  for (let i = 0; i < SITE_SECTIONS.length; i++) {
    const sec = SITE_SECTIONS[i];
    // Focused input when provided (topic summaries + aliases); full body text
    // otherwise. Stored `text` stays complete for display/summarization.
    const inputContent =
      sec.embedText || `${sec.pageTitle} — ${sec.heading}: ${sec.text}`;

    const output = await extractor(inputContent, {
      pooling: 'mean',
      normalize: true,
    });

    const rawVector = Array.from(output.data as Float32Array);
    // Quantize floats to 4 decimal precision to reduce bundle/JSON size by ~70%
    const vector = rawVector.map((v) => Math.round(v * 10000) / 10000);

    embeddings.push({
      id: sec.id,
      pageTitle: sec.pageTitle,
      heading: sec.heading,
      url: sec.url,
      text: sec.text,
      vector,
    });

    if ((i + 1) % 10 === 0 || i === SITE_SECTIONS.length - 1) {
      console.log(`[build-embeddings] Processed ${i + 1}/${SITE_SECTIONS.length} sections`);
    }
  }

  const outDir = path.join(process.cwd(), 'lib', 'search');
  const outFile = path.join(outDir, 'embeddings.json');

  // Format JSON with inline vectors to optimize file size and git diff readability
  const jsonContent = JSON.stringify(embeddings, null, 2).replace(
    /\[\n\s+([\s\S]*?)\n\s+\]/g,
    (m, inner) => {
      if (!inner.includes('{')) {
        return '[' + inner.replace(/\s+/g, ' ') + ']';
      }
      return m;
    }
  );

  fs.writeFileSync(outFile, jsonContent, 'utf-8');
  console.log(
    `[build-embeddings] Successfully saved embeddings to ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`
  );
}

buildEmbeddings().catch((err) => {
  console.error('[build-embeddings] Failed:', err);
  process.exit(1);
});
