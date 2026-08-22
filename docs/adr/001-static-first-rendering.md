# ADR-001: Astro as the default rendering layer, static-first

## Status

Accepted (Phase 0)

## Context

`astro-learning-lab` is a content platform: articles, guides, topics,
a search island and a feedback form. Most responses do not depend on
the request. The alternative default - a React SPA or an SSR-everything
framework - would ship a runtime to browsers to display content that
never changes after render.

## Decision

Astro renders everything to HTML by default. `output: 'static'`
remains the project-wide default; routes opt **out** per-route with
`export const prerender = false` only when the response depends on the
request. The adapter (Node standalone by default, Cloudflare Workers on
deploy) exists solely to serve those opted-out routes.

## Consequences

- Content pages are build artifacts: fastest possible serving, no
  server cost, no hydration.
- Dynamic surface area stays small and explicit (`/status`, `/feedback`,
  `/api/*`, server islands) - auditable at a glance via the
  `prerender = false` exports.
- Middleware does not execute for prerendered pages in production;
  static-file headers live at the hosting layer (see ADR-003).
