# Deployment - Cloudflare Workers (primary target)

> Verified against the Cloudflare Workers framework guide and the
> official `@astrojs/cloudflare` adapter docs (v14, Astro 7), 2026-08.

## Architecture

```
Astro source
     ↓  DEPLOY_TARGET=cloudflare pnpm build
dist/client/   ← prerendered pages + static assets (served from the edge)
dist/server/   ← on-demand routes compiled for workerd
     ↓  wrangler deploy
Cloudflare Worker (V8 isolate) + Static Assets
```

- **Static first**: prerendered pages and assets are served by the CDN
  _before_ the Worker executes. Requests for them never run server code -
  which is why security headers for static files live in
  `public/_headers`, not only in middleware.
- **On-demand routes** (`/status`, `/feedback`, `/api/*`, server islands)
  execute in the Worker via the `@astrojs/cloudflare` adapter.
- The Wrangler config (`wrangler.jsonc`) is minimal: the adapter
  generates the entrypoint and assets wiring at build time (optional
  config since adapter v13). Project-specific settings only:
  `nodejs_compat`, observability, compatibility date.
- Image service is `passthrough` (no content images yet). Switch to the
  default `cloudflare-binding` when real images arrive - the binding is
  auto-provisioned on deploy.

## Build & deploy

| Step                  | Command                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| Build for Workers     | `DEPLOY_TARGET=cloudflare pnpm build`                                      |
| Local Workers runtime | `pnpm exec wrangler dev` (miniflare, no account needed)                    |
| Deploy                | `pnpm exec wrangler deploy`                                                |
| Preview (per PR)      | `wrangler versions upload` or Workers Builds CI                            |
| Production            | `wrangler deploy` from CI after CI passes (`.github/workflows/deploy.yml`) |

Required repository secrets: `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`. Optional variable: `SITE_URL` (canonical origin).

## Environment variables

- Build-time: `SITE_URL` (canonical origin for sitemap/RSS/canonicals),
  `DEPLOY_TARGET=cloudflare`.
- Runtime server-only: `FEEDBACK_WEBHOOK_URL` - set as a Worker secret:
  `wrangler secret put FEEDBACK_WEBHOOK_URL`.
- Nothing `PUBLIC_` exists today; the browser bundle carries no config.

## Routing & caching

- Prerendered routes: served as static assets with default edge caching.
- `/api/articles`: route-level cache (`maxAge: 300`, SWR 60) via Astro's
  stable `routeRules` - evaluated inside the Worker.
- `/_server-islands/*`: fetched per request by the island loader.
- Custom cache rules (browsers/edge TTLs) can be added via
  `public/_headers` and Workers `_routes.json` (auto-generated today).

## Observability

- `observability.enabled` in `wrangler.jsonc`: Workers Logs capture
  `console.log` output - including the middleware's structured JSON
  request logs - queryable in the Cloudflare dashboard
  (Workers & Pages → astro-learning-lab → Logs).
- Live tail during development: `wrangler tail`.
- Health probe: `GET /api/health` → `{"status":"ok"}`.

## Rollback

- Immediate: `wrangler rollback` (reverts to the previous deployment).
- Deliberate: redeploy a previous commit (CI builds are reproducible;
  the lockfile and pinned pnpm make the artifact deterministic).
- Worker versions provide gradual rollouts (`wrangler versions upload`
  - `wrangler versions deploy`) if canary deploys are ever needed.

## Why not Pages?

Cloudflare's current guidance directs new full-stack projects to
**Workers with Static Assets**; Pages is in maintenance mode for new
projects. The old `main: dist/_worker.js/index.js` configuration from
earlier guides is also obsolete - the adapter generates the entrypoint
itself since v13 (see ADR-004 for the dual-target decision).
