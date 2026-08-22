# ADR-002: Client islands policy - React only for genuine interactivity

## Status

Accepted (Phases 6-7)

## Context

The project needs exactly two interactive features: live article
search/filtering and favorite toggling. Both could naively become React
islands; both could also be attempted with vanilla scripts.

## Decision

1. **A framework island requires demonstrated need**: state that must
   re-render UI on every change. `ArticleSearch` qualifies (keystroke
   filtering) and is the project's only React island.
2. **The weakest hydration strategy that satisfies the UX wins**:
   search uses `client:idle` - the input is near the top, but users need
   time to focus and type. `client:load` was rejected as unjustified.
3. **Simple client state does not justify a framework**: favorites use
   a bundled, deduplicated vanilla `<script>` + localStorage (~0.8 KB
   inline) instead of ~188 KB of React runtime for two DOM ops per click.
4. **Every island documents four answers** in code + registry:
   why JS at all, why not Astro-only, when to hydrate, measured cost
   (`docs/learning/islands.md`).

## Consequences

- 18/19 pages ship zero external JavaScript (budget-enforced).
- The island registry makes hydration cost a review artifact.
- Future islands inherit the checklist; adding a framework island to a
  shared component would violate the budget tests and fail CI.
