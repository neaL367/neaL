export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { semanticIndex } = await import('@/lib/search/semantic-index');
      await semanticIndex.initialize();
    } catch (err) {
      console.warn('[instrumentation] SemanticIndex warm-up skipped or failed:', err);
    }
  }
}
