/**
 * Security headers applied by middleware to every response.
 * Pure function: unit-testable, and the single source of truth so
 * the CSP policy lives in exactly one place.
 *
 * Phase 17 (security review) revisits the CSP pragmas - inline
 * scripts/styles currently require 'unsafe-inline'; the production
 * hardening path is hash- or nonce-based policies.
 */
export function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}
