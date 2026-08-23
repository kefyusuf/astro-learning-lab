---
title: "ADR-004: Dual Deployment Targets - Cloudflare Workers (primary) and Docker/Node (validation + portability)"
---

# ADR-004: Dual Deployment Targets - Cloudflare Workers (primary) and Docker/Node (validation + portability)

## Status

Accepted

## Context

The project has server-rendered routes (actions, endpoints, status page,
server islands), so a deployment target must provide a server runtime.
Two credible targets exist with fundamentally different runtime models:

- **Cloudflare Workers**: V8 isolates, no Node.js process; static assets
  served from the edge _before_ the Worker runs; adapter
  `@astrojs/cloudflare` compiles server code to `dist/_worker.js`.
- **Docker / Node**: a real Node process (`@astrojs/node` standalone);
  static assets served by the same process; full Node API compatibility.

## Decision

Keep **both targets working at all times**:

1. **Cloudflare Workers + Static Assets** is the primary production target.
2. **Docker (Node standalone)** exists for reproducible builds, local
   parity, CI validation of the full runtime, and as an alternate Node
   deployment path.

The adapter is selected at build time via `DEPLOY_TARGET`
(`astro.config.mjs`): unset/`node` → `@astrojs/node`;
`cloudflare` → `@astrojs/cloudflare`. Both adapters are devDependencies.

## Consequences

- **Middleware does not run for prerendered pages on either target** -
  static assets are served before server code. Security headers for
  static files therefore live in `public/_headers` (Cloudflare) and are
  kept in sync with the middleware policy by a consistency check.
- **Runtime APIs differ**: Workers have no Node APIs beyond
  `nodejs_compat`; server code must stay portable (Web standard APIs:
  `fetch`, `crypto.randomUUID`, `AbortSignal.timeout` - all used).
- **Sessions**: the Node adapter defaults to filesystem sessions;
  Workers need a platform-backed session driver. The project currently
  uses no server sessions (action results ride the POST response), so
  no divergence exists today.
- **CI builds the Docker image** to prove the Node path compiles and
  serves; Cloudflare preview deployments prove the Workers path.
- The Docker image is multi-stage, runs as non-root, and exposes
  `/api/health` for orchestration health checks.

## Alternatives considered

- **Workers only**: simplest, but loses reproducible local parity and
  makes the Node deployment story untested until it is needed most.
- **Node only**: abandons the platform that fits the project's
  content-heavy, globally-cached shape best.
