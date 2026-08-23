# astro-learning-lab

A developer-oriented knowledge/content platform built as a phase-based
curriculum for learning **Astro** from zero - with production engineering
standards applied throughout.

## What this project is

A real, deployable content platform where **every feature exists to
exercise one Astro or production-engineering concept** - and nothing more:

| Surface                  | Implementation                                                  |
| ------------------------ | --------------------------------------------------------------- |
| Articles, guides, topics | Content Collections (zod schemas, references, drafts)           |
| Search                   | React island, `client:idle`, cost documented                    |
| Favorites                | Vanilla `<script>` + localStorage - no framework                |
| Feedback form            | Astro Actions + server-side zod validation                      |
| API                      | `/api/health`, `/api/articles` endpoints                        |
| Live fragments           | Server island (`server:defer`) inside a static page             |
| Rendering                | Static-first; per-route opt-out (`prerender = false`)           |
| Security                 | CSP + headers (middleware + `_headers`), origin-checked actions |

## Architecture in one paragraph

Astro renders components to HTML at build time or on the server. The site
ships **zero client JavaScript by default**; interactivity is added only
through small, lazily-hydrated islands, and dynamic server fragments use
server islands. Rendering is decided **per route**. See
[Architecture Overview](src/content/docs/docs/architecture/overview.md).

## Project structure

```text/
├── .github/workflows/     # ci.yml (verify + docker), deploy.yml (Workers)
├── docs/
│   ├── adr/               # architecture decision records (001-004)
│   ├── architecture/      # overview, security review, production review
│   ├── deployment/        # cloudflare.md - Workers deployment guide
│   └── learning/          # roadmap, concepts glossary, islands registry,
│                          # performance evidence, progress tracker
├── public/                # favicon, _headers (hosting-layer security)
├── src/
│   ├── actions/           # Astro Actions (feedback form backend)
│   ├── components/        # .astro components + islands/ (React)
│   ├── content/           # articles, guides, authors, topics (Markdown/JSON)
│   ├── content.config.ts  # collection loaders + zod schemas
│   ├── layouts/           # BaseLayout, ArticleLayout
│   ├── lib/               # pure logic (tested): pagination, content helpers,
│   │                      # schemas, logger, security headers, JSON-LD escape
│   ├── pages/             # file-based routes incl. api/, rss.xml, robots.txt
│   ├── styles/            # global design tokens (CSS-only dark mode)
│   └── middleware.ts      # request id, security headers, structured logs
├── tests/
│   ├── unit/              # Vitest - pure logic + build-output budget checks
│   └── e2e/               # Playwright - behavior-level specs vs preview build
├── astro.config.mjs       # adapter chosen by DEPLOY_TARGET (node|cloudflare)
├── Dockerfile             # multi-stage, non-root Node runtime
├── compose.yaml           # local container run with healthcheck
└── wrangler.jsonc         # minimal Workers config (adapter generates the rest)
```

## Commands

| Command              | Action                                          |
| :------------------- | :---------------------------------------------- |
| `pnpm install`       | Install dependencies                            |
| `pnpm dev`           | Start dev server at `localhost:4321`            |
| `pnpm build`         | Production build to `./dist/`                   |
| `pnpm preview`       | Preview the production build locally            |
| `pnpm check`         | Type-check `.astro` + TypeScript                |
| `pnpm lint`          | ESLint                                          |
| `pnpm format`        | Prettier (write)                                |
| `pnpm format:check`  | Prettier (CI check)                             |
| `pnpm test`          | Unit tests (Vitest) - includes JS budget checks |
| `pnpm test:coverage` | Unit tests with coverage thresholds (src/lib)   |
| `pnpm test:e2e`      | End-to-end tests (Playwright)                   |

CI runs the same sequence plus dependency audit and a Docker image build.

## Running on Docker

```sh
docker compose up --build
# → http://localhost:4321 (healthcheck polls /api/health)
```

Multi-stage build, non-root user (`app`), standalone Node server serving
the hybrid output (static assets + on-demand routes). See ADR-004 for why
Docker and Cloudflare are both kept working.

## Testing & quality gates

- **Unit** (Vitest): pure logic, action schemas, security policies, build-output JS budgets - `src/lib` coverage ≥ 90% enforced
- **E2E** (Playwright): behavior-level specs on **Chromium, Firefox and WebKit** against the production preview - including a JavaScript-disabled progressive-enhancement test and axe-core accessibility scans (zero violations)
- **Lighthouse CI**: performance ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.9, seo ≥ 0.9 category gates
- **Renovate** keeps dependencies fresh; Astro majors are reviewed manually on purpose

## Deployment

Two targets share one codebase - the adapter is selected at build time:

```sh
pnpm build                                        # Node/Docker target (default)
rm -rf dist && DEPLOY_TARGET=cloudflare pnpm build  # Cloudflare Workers target
pnpm exec wrangler dev                            # local Workers runtime (no account)
```

- **Cloudflare Workers + Static Assets** is the primary production target:
  [Cloudflare deployment guide](src/content/docs/docs/deployment/cloudflare.md) covers
  build, secrets, routing, caching, logs and rollback. Deploys are
  automated by `.github/workflows/deploy.yml` after CI passes.
- **Docker / Node** provides reproducible CI validation and alternate
  hosting.

## Documentation

Project documentation lives as plain markdown in `docs/`:

- [Learning roadmap](docs/learning/roadmap.md) · [Progress](docs/learning/progress.md)
- [Astro concepts glossary](docs/learning/astro-concepts.md)
- [Architecture overview](docs/architecture/overview.md) ·
  [Security review](docs/architecture/security.md) ·
  [Production review](docs/architecture/production-review.md)
- [ADRs](docs/adr/) · [Deployment guides](docs/deployment/)
- [Island registry](docs/learning/islands.md) ·
  [Performance evidence](docs/learning/performance.md)
