# Contributing

This repository is primarily a learning curriculum - changes to the
**curriculum documents** (`docs/learning/`, `docs/adr/`) are as welcome
as code changes.

## Ground rules

1. **Architecture guardrails first** - read
   `docs/architecture/overview.md` §8 before proposing features:
   no unnecessary client JS, no premature abstraction, weakest hydration
   strategy wins.
2. **Behavior is guarded by Playwright** - user-visible changes get
   e2e specs against the preview build. The vitest/unit layer was
   removed in a simplification pass; keep new pure logic small and
   reviewed. JS budgets are documented in
   `docs/learning/performance.md`; new islands must register their cost
   in the [Island Registry](src/content/docs/docs/learning/islands.md).
3. **Conventional Commits** - small, coherent commits; the message
   explains _why_.
4. **Docs travel with code** - a feature that teaches a concept updates
   `docs/learning/astro-concepts.md` in the same PR.

## Local workflow

```sh
pnpm install
pnpm dev            # work
pnpm format:check && pnpm lint && pnpm check && pnpm build && pnpm test:e2e
```

CI must pass before merge. Dependency updates arrive via Renovate -
Astro majors are reviewed manually on purpose.
