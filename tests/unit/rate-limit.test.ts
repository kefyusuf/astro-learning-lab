import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../../src/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests within the limit", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 3,
      now: () => 0,
    });
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);
  });

  it("blocks requests beyond the limit in the same window", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      now: () => 0,
    });
    limiter.check("ip-1");
    limiter.check("ip-1");
    const result = limiter.check("ip-1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      now: () => 0,
    });
    expect(limiter.check("ip-a").allowed).toBe(true);
    expect(limiter.check("ip-b").allowed).toBe(true);
    expect(limiter.check("ip-a").allowed).toBe(false);
  });

  it("resets after the window passes (injected clock)", () => {
    let now = 0;
    const limiter = createRateLimiter({
      windowMs: 10_000,
      max: 1,
      now: () => now,
    });
    limiter.check("ip-1");
    expect(limiter.check("ip-1").allowed).toBe(false);

    now = 10_001;
    const result = limiter.check("ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("reports remaining quota", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 3,
      now: () => 0,
    });
    expect(limiter.check("ip").remaining).toBe(2);
    expect(limiter.check("ip").remaining).toBe(1);
    expect(limiter.check("ip").remaining).toBe(0);
  });

  it("does not grow memory unboundedly across windows", () => {
    let now = 0;
    const limiter = createRateLimiter({
      windowMs: 1000,
      max: 1,
      now: () => now,
    });
    for (let i = 0; i < 500; i++) {
      now += 2000; // every request lands in a fresh window
      limiter.check(`rotating-ip-${i}`);
    }
    expect(limiter.trackedKeys()).toBeLessThanOrEqual(2);
  });
});
