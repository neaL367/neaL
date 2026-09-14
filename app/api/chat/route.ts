/**
 * Nara chat API — V2 engine.
 *
 * Architecture:
 *   respond()  ->  SSE stream
 *
 * Everything substantive happens synchronously inside `respond()`, which is a
 * pure local function: analysis, retrieval, evidence gating and extractive
 * composition. There is no model call, no embedding call and no outbound
 * request, so there is nothing to await before the first token. The legacy route
 * awaited an embedding for every message (a lane that was in fact dead, because
 * the model package was never installed) and paid that latency for nothing.
 *
 * Streaming cadence is preserved from the legacy route because it is a real
 * part of the product: the answer is revealed at a readable pace rather than
 * appearing all at once.
 */
import { respond } from '@/lib/nara/respond';
import { checkRateLimit } from '@/lib/nara/rate-limit';

/** Maximum accepted message length. Bounds work per request. */
const MAX_MESSAGE_LENGTH = 500;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  const signal = req.signal;

  try {
    // Abuse guard first: sliding window per IP, 429 with Retry-After.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      return json(
        { error: 'Too many messages — please slow down and try again in a moment.' },
        429,
        { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) },
      );
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body?.message === 'string' ? body.message : '';

    if (!raw.trim()) {
      return json({ error: 'Please provide a valid non-empty message.' }, 400);
    }

    const message = raw.trim().slice(0, MAX_MESSAGE_LENGTH);

    // State from the client is UNTRUSTED. `respond` runs it through
    // `sanitizeState`, which validates every field and rebuilds anything
    // structured (a quiz is restored from the server bank by id only), so a
    // crafted payload cannot inject content into an answer.
    const result = respond({ message, state: body?.state });

    const encoder = new TextEncoder();
    let cancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        const onAbort = () => {
          cancelled = true;
          try {
            controller.close();
          } catch {
            // Already closed.
          }
        };

        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });

        try {
          const emit = (event: string, data: unknown) => {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
            );
          };

          const words = result.answer.text.match(/\S+\s*/g) ?? [result.answer.text];
          let chunk = '';

          for (let i = 0; i < words.length; i++) {
            if (signal.aborted || cancelled) break;

            const token = words[i];
            chunk += token;

            const endOfSentence = /[.!?]\s*$/.test(token);
            const last = i === words.length - 1;

            if (endOfSentence || i % 3 === 2 || last) {
              if (chunk.length > 0) {
                emit('text', chunk);
                // A pause after a structural line (heading or list item) reads
                // as deliberate; jitter keeps the rhythm from sounding robotic.
                const structural = /(^|\n)\s*(#{1,6}\s|[-*+•]\s|\d+[.)]\s)/.test(chunk);
                const base = endOfSentence ? 40 : structural ? 70 : 20;
                const jitter = Math.random() * 24 - 12;
                chunk = '';
                if (!last) await sleep(Math.max(0, base + jitter));
                continue;
              }
              if (!last) await sleep(endOfSentence ? 40 : 20);
            }
          }

          if (signal.aborted || cancelled) return;

          if (result.answer.sources.length > 0) emit('sources', result.answer.sources);
          if (result.answer.suggestions.length > 0) emit('suggestions', result.answer.suggestions);

          emit('state', result.state);
          emit('done', {});
          controller.close();
        } catch (err) {
          console.error('[API/chat] Streaming error:', err);
          try {
            controller.close();
          } catch {
            // Already closed.
          }
        } finally {
          signal.removeEventListener('abort', onAbort);
        }
      },
      cancel() {
        cancelled = true;
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    });
  } catch (error) {
    console.error('[API/chat] Handler error:', error);
    return json({ error: 'Internal assistant error. Please try again.' }, 500);
  }
}

function json(payload: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}
