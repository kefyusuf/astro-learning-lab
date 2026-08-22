/**
 * Fixed-window rate limiter - pure logic, injected clock.
 *
 * In-memory by design: it is a per-instance deterrent for the Node
 * target. On Cloudflare the platform-level WAF/rate-limiting rules are
 * the real control (see docs/architecture/security.md); a Worker-local
 * map still blunts naive abuse between isolate recycles.
 */
export interface RateLimitOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum requests allowed per key per window. */
  max: number;
  /** Injectable clock for tests; defaults to Date.now. */
  now?: () => number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets (for Retry-After). */
  retryAfterSec: number;
}

interface WindowState {
  count: number;
  windowStart: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  /** Diagnostics: how many keys are currently tracked. */
  trackedKeys(): number;
}

export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const { windowMs, max } = options;
  const now = options.now ?? (() => Date.now());
  const windows = new Map<string, WindowState>();

  return {
    check(key) {
      const currentTime = now();
      const state = windows.get(key);

      // No record or an expired window starts a fresh one.
      if (!state || currentTime - state.windowStart >= windowMs) {
        windows.set(key, { count: 1, windowStart: currentTime });
        // Prune expired keys on every new window so long-lived
        // processes stay memory-bounded.
        for (const [k, w] of windows) {
          if (k !== key && currentTime - w.windowStart >= windowMs) {
            windows.delete(k);
          }
        }
        return { allowed: true, remaining: max - 1, retryAfterSec: 0 };
      }

      if (state.count < max) {
        state.count += 1;
        return {
          allowed: true,
          remaining: max - state.count,
          retryAfterSec: 0,
        };
      }

      const resetAt = state.windowStart + windowMs;
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.max(1, Math.ceil((resetAt - currentTime) / 1000)),
      };
    },
    trackedKeys() {
      return windows.size;
    },
  };
}
