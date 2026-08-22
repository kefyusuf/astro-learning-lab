import { defineMiddleware, sequence } from "astro:middleware";
import { securityHeaders } from "./lib/security-headers";
import { logRequest } from "./lib/logger";
import { createRateLimiter } from "./lib/rate-limit";

/**
 * Middleware runs before route rendering on every matched request.
 * `sequence()` composes middlewares in order - each receives the next
 * in the chain, so ordering is explicit and inspectable.
 */

const requestContext = defineMiddleware(async (context, next) => {
  const requestId = crypto.randomUUID();
  context.locals.requestId = requestId;

  const start = performance.now();
  const response = await next();
  const durationMs = Math.round(performance.now() - start);

  response.headers.set("x-request-id", requestId);
  for (const [name, value] of Object.entries(securityHeaders())) {
    response.headers.set(name, value);
  }

  logRequest({
    requestId,
    method: context.request.method,
    path: context.url.pathname,
    status: response.status,
    durationMs,
  });

  return response;
});

/**
 * Fixed-window rate limit for form submissions. In-memory = a
 * per-instance deterrent; the platform WAF is the real control on
 * Cloudflare (docs/architecture/security.md).
 */
const feedbackLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
});

const rateLimit = defineMiddleware(async (context, next) => {
  if (context.request.method !== "POST") return next();

  const ip =
    context.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const result = feedbackLimiter.check(ip);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "rate_limited",
        retryAfterSec: result.retryAfterSec,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": String(result.retryAfterSec),
        },
      },
    );
  }

  const response = await next();
  response.headers.set("x-ratelimit-remaining", String(result.remaining));
  return response;
});

export const onRequest = sequence(requestContext, rateLimit);
