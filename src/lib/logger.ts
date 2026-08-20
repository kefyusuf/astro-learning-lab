/**
 * Structured request logging. One JSON line per completed request -
 * greppable, parseable, and honest about severity.
 *
 * On Cloudflare Workers, platform observability (wrangler tail,
 * Workers Logs) captures console output; this formatter keeps the
 * fields stable across runtimes.
 */
export interface RequestLogFields {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
}

function levelFor(status: number): "info" | "warn" | "error" {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  return "info";
}

export function formatRequestLog(fields: RequestLogFields): string {
  return JSON.stringify({
    level: levelFor(fields.status),
    event: "request_completed",
    ...fields,
  });
}

export function logRequest(fields: RequestLogFields): void {
  console.log(formatRequestLog(fields));
}
