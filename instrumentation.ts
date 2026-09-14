/**
 * Next.js instrumentation hook.
 *
 * There is deliberately nothing to warm up here. The legacy hook booted a
 * semantic index that tried to load an ONNX model at startup — a package that
 * was declared in `package.json` but absent from `node_modules`, so every boot
 * logged a failure and every embedding lookup returned null.
 *
 * The V2 engine has no model and no runtime index build: its semantic expansion
 * table (`lib/nara/knowledge/expansion.json`) is generated at BUILD time by
 * `scripts/build-semantic.ts` and is plain data at runtime. So the correct
 * warm-up is none at all, and this hook is kept only to document that fact.
 */
export async function register() {
  // Intentionally empty.
}
