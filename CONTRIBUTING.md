# Contributing

This repository is primarily a learning curriculum - changes to the
**curriculum documents** (`docs/learning/`, `docs/adr/`) are as welcome
as code changes.

## Ground rules

1. **Architecture guardrails first** - read
   `docs/architecture/overview.md` §8 before proposing features:
   no unnecessary client JS, no premature abstraction, weakest hydration
   strategy wins.
2. **Tests are part of the definition of done** - pure logic is unit
   tested (coverage thresholds enforced), user-visible behavior gets
   Playwright specs. Budgets (`tests/unit/js-budget.test.ts`) must stay
   green; new islands must register their cost in
   [Island Registry](src/content/docs/docs/learning/islands.md).
3. **Conventional Commits** - small, coherent commits; the message
   explains _why_.
4. **Docs travel with code** - a feature that teaches a concept updates
   `docs/learning/astro-concepts.md` in the same PR.

## Local workflow

```sh
pnpm install
pnpm dev            # work
pnpm format:check && pnpm lint && pnpm check && pnpm test && pnpm test:e2e
```

CI must pass before merge. Dependency updates arrive via Renovate -
Astro majors are reviewed manually on purpose.
