---
title: "ADR-006: Starlight documentation hub at /docs"
---

## Status

Superseded - reverted shortly after adoption; the repo stays a plain Astro project without a documentation theme.

## Context

The curriculum and engineering documentation lived as markdown under
`docs/` in the repository - readable on GitHub but invisible on the
live site. The team compared a VitePress-based alternative and wanted
the polished docs experience (sidebar, search, TOC) without leaving
the Astro ecosystem.

## Decision

Adopt Starlight (Astro's official documentation theme) as a **/docs
sub-section** rather than a site-wide replacement:

- Files moved from repo `docs/**` into `src/content/docs/docs/**` so
  URLs become `/docs/<group>/<page>`. The custom site keeps its own
  design identity.
- Each group gets an explicit sidebar entry; items are derived from the
  file tree at config time, so adding a page never means editing config.
- `docsSchema()` is REQUIRED when defining the collection manually -
  without it entries are silently dropped from generation.
- Integration order matters: starlight() injects expressive-code which
  must precede mdx().
- The header Docs link carries `data-astro-reload`: two layout systems
  do not share the client router, so crossing the boundary forces a
  full page load.
- The docs hub is English-only (Starlight `locales` cannot coexist with
  an Astro-level i18n config); the manual /tr slice is unaffected.
- Budgets updated honestly: eager JS budget 320 KB (the Starlight shell
  is ~99.6 KB but loads only on /docs), per-page HTML limit 96 KB for
  docs pages, Pagefind's lazy search index excluded from size walks.

## Consequences

- Single source of truth: repo docs moved INTO the app; the GitHub
  README links now point to these live /docs pages.
- Search (Pagefind) ships as lazy assets - powerful but excluded from
  eager-size budgets.
- The 404 route collision warning (site vs Starlight) is benign; our
  custom 404 wins.
