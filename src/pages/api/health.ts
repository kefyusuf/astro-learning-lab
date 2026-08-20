import type { APIRoute } from "astro";

/**
 * Liveness probe. On-demand (prerender = false) so it always reflects
 * a running server, never a build artifact.
 */
export const prerender = false;

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: JSON_HEADERS,
  });
};

// Explicit 405 with an Allow header: proper HTTP semantics beat
// relying on framework defaults. Only GET is meaningful here.
export const POST: APIRoute = () => {
  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { ...JSON_HEADERS, Allow: "GET" },
  });
};
