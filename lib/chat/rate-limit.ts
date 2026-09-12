/**
 * Sliding-window rate limiter for the chat route (no new dependencies).
 * Sliding window beats fixed window: no boundary bursts (two windows' worth
 * of requests in one second). Per-instance memory by design — on serverless
 * each isolate keeps its own counters, so treat this as a cheap abuse floor,
 * not a hard global quota (that needs Redis/Upstash).
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_BUCKETS = 1000;

const buckets = new Map<string, number[]>();

function prune(): void {
  if (buckets.size <= MAX_BUCKETS) return;
  // Evict oldest-inserted buckets first (approximation; prevents unbounded growth).
  const overflow = buckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++removed >= overflow) break;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(ip: string, now: number = Date.now()): RateLimitResult {
  prune();
  const cutoff = now - WINDOW_MS;
  const seen = buckets.get(ip) || [];
  const recent = seen.filter(t => t > cutoff);

  if (recent.length >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, recent[0] + WINDOW_MS - now),
    };
  }

  recent.push(now);
  buckets.set(ip, recent);
  return {
    allowed: true,
    remaining: MAX_REQUESTS - recent.length,
    resetMs: Math.max(0, recent[0] + WINDOW_MS - now),
  };
}

/** Test hook: reset all counters. */
export function resetRateLimits(): void {
  buckets.clear();
}
