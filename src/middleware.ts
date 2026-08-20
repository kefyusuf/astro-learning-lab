import { defineMiddleware, sequence } from "astro:middleware";
import { securityHeaders } from "./lib/security-headers";
import { logRequest } from "./lib/logger";

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

export const onRequest = sequence(requestContext);
