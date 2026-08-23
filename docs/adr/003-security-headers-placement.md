---
title: "ADR-003: Security headers split between middleware and hosting layer"
---

# ADR-003: Security headers split between middleware and hosting layer

## Status

Accepted (Phase 12, verified Phase 17)

## Context

Middleware assigns request ids and applies security headers. During
verification we observed that middleware executes **only for on-demand
routes**: prerendered pages are served as static bytes (by the Node
server or Cloudflare's edge) before any server code runs. Setting
headers in middleware alone leaves static pages unprotected.

## Decision

Security header policy lives in one module
(`src/lib/security-headers.ts`) but is applied in two places:

1. **Middleware** - on-demand routes (also gets request id + logs).
2. **`public/_headers`** - statically served files (Cloudflare reads it).

A consistency check parses `_headers` and asserts alignment with the module,
so the two cannot drift.

## Consequences

- Every response carries the same policy regardless of how it is served.
- Request-id/logging remain middleware-only - they are inherently
  per-request concerns that static files cannot have.
- The Node/Docker target serves `_headers` as an inert file; its static
  files rely on the same server pipeline (acceptable for CI validation
  and trusted environments; public exposure would need proxy-level
  headers - trigger documented in `docs/architecture/security.md`).
