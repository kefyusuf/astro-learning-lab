## What does this PR change?

<!-- One or two sentences: the user-visible or learning-visible outcome. -->

## Which phase / concept does it touch?

<!-- e.g. Phase 6 (islands), or "extension: astro:env" -->

## Checklist

- [ ] `pnpm format:check` `pnpm lint` `pnpm check` green
- [ ] Playwright e2e green against the preview build
- [ ] `pnpm build` green
- [ ] `pnpm test:e2e` green
- [ ] No new client JS without an island-registry entry (`docs/learning/islands.md`)
- [ ] Docs updated in the same PR (concepts glossary / roadmap notes)
