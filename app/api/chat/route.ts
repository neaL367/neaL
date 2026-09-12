import type { ConversationState } from '@/lib/chat/types';
import { sanitizeConversationState } from '@/lib/chat/state';
import { ENGLISH_ONLY_ERROR, isEnglishText } from '@/lib/chat/english';
import { tokenize, extractEntities, classifyIntent, detectExpertise, normalizeMessage, ensureIntentVectorsLoaded } from '@/lib/chat/nlp';
import { semanticIndex } from '@/lib/search/semantic-index';
import { checkRateLimit } from '@/lib/chat/rate-limit';
import { orchestrateRetrieval } from '@/lib/chat/retrieval';
import { buildResponse } from '@/lib/chat/response-builder';

// Delay helper for natural streaming cadence
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  const signal = req.signal;

  try {
    // 0. Abuse guard first: sliding window per IP, 429 with Retry-After.
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many messages — please slow down and try again in a moment.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(limit.resetMs / 1000)),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));

    // 1. Robust input extraction & validation
    const rawMessage =
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.query === 'string'
          ? body.query
          : '';

    const useWebSearch = Boolean(body?.webSearch);
    // Normalize typing style first (slang, elongations, typos) so every
    // downstream lane sees canonical English; then validate + bound.
    const cleanMessage = normalizeMessage(rawMessage.trim()).slice(0, 500);

    if (!cleanMessage) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid non-empty message.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isEnglishText(cleanMessage)) {
      return new Response(
        JSON.stringify({ error: ENGLISH_ONLY_ERROR }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Bound incoming state to prevent memory abuse (single factory)
    const state: ConversationState = sanitizeConversationState(body?.state);

    // 3. NLP Analysis & Classification (rolling expertise window from recent user turns)
    const recentUserTexts = state.turns
      .filter(t => t.role === 'user')
      .map(t => t.text)
      .slice(-2);
    state.expertiseLevel = detectExpertise(cleanMessage, state.expertiseLevel, recentUserTexts);
    // One cached forward pass serves both the few-shot intent vote and the
    // semantic retrieval lane below; warms intent examples in background.
    ensureIntentVectorsLoaded().catch(() => {});
    const queryVector = await semanticIndex.embedText(cleanMessage);
    const tokens = tokenize(cleanMessage);
    const entities = extractEntities(cleanMessage, tokens, state);
    const intentResult = classifyIntent(cleanMessage, state, queryVector);

    // 4. Multi-lane retrieval
    const lastActiveTopic = state.topicThread && state.topicThread.length > 0
      ? state.topicThread[state.topicThread.length - 1]
      : undefined;

    const previousUserTurn = state.turns
      ? [...state.turns].reverse().find(t => t.role === 'user' && t.text.trim().toLowerCase() !== cleanMessage.toLowerCase())
      : undefined;

    const retrievalResult = await orchestrateRetrieval(cleanMessage, 3, {
      intent: intentResult.intent,
      conceptId: intentResult.conceptId,
      detectedConcepts: entities.concepts,
      webSearch: useWebSearch,
      activeTopic: lastActiveTopic,
      previousQuery: previousUserTurn?.text,
    });

    // 5. Assemble response
    const built = buildResponse(cleanMessage, state, intentResult, entities, retrievalResult);

    if (!built.text || built.text.trim().length === 0) {
      built.text = "I'm not sure how to answer that right now. Try rephrasing, or ask me about Neal's projects, tech concepts, or type `/quiz`!";
    }

    // 6. ReadableStream with SSE formatting
    const encoder = new TextEncoder();
    let isStreamCancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        const onAbort = () => {
          isStreamCancelled = true;
          try {
            controller.close();
          } catch {
            // Already closed
          }
        };

        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });

        try {
          // Tokenize into words with preserved whitespace (zero dropped spaces)
          const wordTokens = built.text.match(/\S+\s*/g) || [built.text];
          let currentChunk = '';
          let inCodeBlock = false;
          let didEmitAnyText = false;

          for (let i = 0; i < wordTokens.length; i++) {
            if (signal.aborted || isStreamCancelled) break;

            const token = wordTokens[i];
            currentChunk += token;

            // Track markdown code block boundaries
            if (token.includes('```')) {
              inCodeBlock = !inCodeBlock;
            }

            // In code blocks: stream line-by-line with minimal delay (flicker-free)
            // In prose: batch every ~3 words or sentence endings for natural conversational pace
            const isEndOfSentence = /[.!?]\s*$/.test(token) && !inCodeBlock;
            const isBatchReady = inCodeBlock ? currentChunk.includes('\n') : (i % 3 === 2);
            const isLast = i === wordTokens.length - 1;

            if (isEndOfSentence || isBatchReady || isLast) {
              if (currentChunk.length > 0) {
                const sseEvent = `event: text\ndata: ${JSON.stringify(currentChunk)}\n\n`;
                controller.enqueue(encoder.encode(sseEvent));
                didEmitAnyText = true;
                // Longer pause after headings / list items sells the "typing" illusion
                const isStructuralBoundary =
                  !inCodeBlock &&
                  (/(^|\n)\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s)/.test(currentChunk) ||
                    /\n\s*$/.test(currentChunk));
                const baseDelay = inCodeBlock
                  ? 5
                  : isEndOfSentence
                    ? 40
                    : isStructuralBoundary
                      ? 70
                      : 20;
                // Small randomized jitter (±12ms prose, ±3ms code) breaks mechanical regularity
                const spread = inCodeBlock ? 3 : 12;
                const jittered = Math.max(
                  0,
                  baseDelay + Math.random() * 2 * spread - spread
                );
                currentChunk = '';
                await sleep(jittered);
                continue;
              }

              const delay = inCodeBlock ? 5 : isEndOfSentence ? 40 : 20;
              await sleep(delay);
            }
          }

          if (!didEmitAnyText && !signal.aborted && !isStreamCancelled) {
            const fallback = "I don't have a specific answer for that. Try asking about Neal's projects, tech stack, or type `/quiz`!";
            controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(fallback)}\n\n`));
          }

          if (signal.aborted || isStreamCancelled) return;

          // Emit auxiliary events
          if (built.sources && built.sources.length > 0) {
            controller.enqueue(encoder.encode(`event: sources\ndata: ${JSON.stringify(built.sources)}\n\n`));
          }
          if (built.suggestions && built.suggestions.length > 0) {
            controller.enqueue(encoder.encode(`event: suggestions\ndata: ${JSON.stringify(built.suggestions)}\n\n`));
          }

          // Emit synchronized state & finish
          controller.enqueue(encoder.encode(`event: state\ndata: ${JSON.stringify(built.updatedState)}\n\n`));
          controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
          controller.close();
        } catch (err) {
          console.error('[API/chat] Streaming error:', err);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        } finally {
          signal.removeEventListener('abort', onAbort);
        }
      },
      cancel() {
        isStreamCancelled = true;
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    });
  } catch (error) {
    console.error('[API/chat] Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal assistant error. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
