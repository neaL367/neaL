import type { ConversationState } from '@/lib/chat/types';
import { tokenize, extractEntities, classifyIntent, detectExpertise } from '@/lib/chat/nlp';
import { orchestrateRetrieval } from '@/lib/chat/retrieval';
import { buildResponse } from '@/lib/chat/response-builder';

// Delay helper for natural streaming cadence
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  const signal = req.signal;

  try {
    const body = await req.json().catch(() => ({}));

    // 1. Robust input extraction & validation
    const rawMessage =
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.query === 'string'
          ? body.query
          : '';

    const useWebSearch = Boolean(body?.webSearch);
    const cleanMessage = rawMessage.trim().slice(0, 500);

    if (!cleanMessage) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid non-empty message.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Bound incoming state to prevent memory abuse
    const incomingState: Partial<ConversationState> = body?.state || {};
    const state: ConversationState = {
      turns: Array.isArray(incomingState.turns) ? incomingState.turns.slice(-20) : [],
      topicThread: Array.isArray(incomingState.topicThread) ? incomingState.topicThread.slice(-10) : [],
      activeQuiz: incomingState.activeQuiz || null,
      expertiseLevel: incomingState.expertiseLevel || 'intermediate',
      roundRobinCursors: incomingState.roundRobinCursors || {},
      lastRetrievalHits: Array.isArray(incomingState.lastRetrievalHits) ? incomingState.lastRetrievalHits.slice(-10) : [],
      pendingOffer: incomingState.pendingOffer || null,
    };

    // 3. NLP Analysis & Classification
    state.expertiseLevel = detectExpertise(cleanMessage, state.expertiseLevel);
    const tokens = tokenize(cleanMessage);
    const entities = extractEntities(cleanMessage, tokens, state);
    const intentResult = classifyIntent(cleanMessage, state);

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
                currentChunk = '';
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
