# astro-learning-lab

A developer-oriented knowledge/content platform built as a phase-based
curriculum for learning **Astro** from zero - with production engineering
standards applied throughout.

## What this project is

A real, deployable content platform (articles, guides, topics, search,
favorites, forms, API) where **every feature exists to exercise one Astro or
production-engineering concept** - and nothing more.

## Architecture in one paragraph

Astro renders components to HTML at build time or on the server. The site
ships **zero client JavaScript by default**; interactivity is added only
through small, lazily-hydrated islands, and dynamic server fragments use
server islands. Rendering is decided **per route**. See
[docs/architecture/overview.md](docs/architecture/overview.md).

## Commands

| Command             | Action                                          |
| :------------------ | :---------------------------------------------- |
| `pnpm install`      | Install dependencies                            |
| `pnpm dev`          | Start dev server at `localhost:4321`            |
| `pnpm build`        | Production build to `./dist/`                   |
| `pnpm preview`      | Preview the production build locally            |
| `pnpm check`        | Type-check `.astro` + TypeScript                |
| `pnpm lint`         | ESLint                                          |
| `pnpm format`       | Prettier (write)                                |
| `pnpm format:check` | Prettier (CI check)                             |
| `pnpm test`         | Unit tests (Vitest)                             |
| `pnpm test:e2e`     | End-to-end tests (Playwright)                   |

## Learning documentation

- [Architecture overview](docs/architecture/overview.md)
- [Learning roadmap](docs/learning/roadmap.md)
- [Astro concepts glossary](docs/learning/astro-concepts.md)
- [Progress tracker](docs/learning/progress.md)
- [ADRs](docs/adr/)

## Deployment

Documented in [docs/deployment/](docs/deployment/) - targets:

- **Cloudflare Workers + Static Assets** (primary)
- **Docker / Node** (reproducible CI validation and alternate hosting)
