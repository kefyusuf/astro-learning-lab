# Learning Progress

> One row per phase. Updated at the end of each phase with the learning checkpoint.

| #   | Phase                          | Status  | Key outcome                                                                                                                                                                              | Completed  |
| --- | ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 0   | Understand Astro before coding | ✅ done | Architecture overview, roadmap, concept glossary established; Astro 7.2.4 verified against official docs                                                                                 | 2026-08-21 |
| 1   | Project foundation             | ✅ done | Scaffolded with create-astro (strict TS), `.astro` anatomy, build/run loop, tooling (Prettier, ESLint, astro check, Vitest)                                                              | 2026-08-21 |
| 2   | Astro components               | ✅ done | BaseLayout/Header/Footer/Hero/cards with typed props, slots, scoped styles, global tokens                                                                                                | 2026-08-21 |
| 3   | Routing                        | ✅ done | File-based routes, dynamic `[slug]` + `getStaticPaths`, pagination (TDD'd `paginate()`), 404                                                                                             | 2026-08-21 |
| 4   | Content Collections            | ✅ done | 4 collections with zod schemas + glob loaders, references, draft filtering, MDX + component, TDD'd helpers; learned reference `{collection,id}` shape and getStaticPaths scope isolation | 2026-08-21 |
| 5   | Build-time data                | ✅ done | GitHub API fetch at build with fixture fallback; staleness visible in UI; TDD'd payload parsing                                                                                          | 2026-08-21 |
| 6   | Islands architecture           | ✅ done | First React island (`ArticleSearch`, `client:idle`), island registry with measured JS cost, Playwright suite, JS-disabled grid test; learned hydration-does-not-adopt-DOM-values pitfall | 2026-08-21 |
| 7   | Client state                   | ✅ done | Favorites via localStorage + deduplicated vanilla `<script>` (no framework), custom-event sync, aria-pressed pattern                                                                     | 2026-08-21 |
| 8   | Forms & Actions                | ✅ done | Astro Actions with shared zod schema (TDD), field errors via `isInputError`, Node adapter entered; documented PRG trade-off                                                              | 2026-08-21 |
| 9   | API endpoints                  | ✅ done | `/api/health` (explicit 405 + Allow) and `/api/articles` (validated limit, cache headers), HTTP-semantics E2E                                                                            | 2026-08-21 |
| 10  | Rendering strategies           | ✅ done | `/status` on-demand (timestamp-change proof), stable route caching (`routeRules` + SWR), prerendered control group                                                                       | 2026-08-21 |
| 11  | Server Islands                 | ✅ done | `server:defer` live fragment inside static `/about`; client-vs-server island matrix documented; hybrid build layout noted                                                                | 2026-08-21 |
| 12  | Middleware                     | ✅ done | Request id, security headers, structured request logs (TDD'd); learned middleware bypasses prerendered pages → `_headers` for static files                                               | 2026-08-21 |
| 13  | Environment configuration      | ✅ done | `.env.example`, config-time vs runtime env, server-only webhook secret, fail-soft forwarding                                                                                             | 2026-08-21 |
| 14  | SEO                            | ✅ done | SEO component abstraction, sitemap, RSS (draft-free), robots.txt, article JSON-LD via head slot                                                                                          | 2026-08-21 |
| 15  | Accessibility                  | ✅ done | axe-core zero violations on all key pages, skip-link focus flow, visually-hidden section headings                                                                                        | 2026-08-21 |
| 16  | Performance                    | ✅ done | Enforced JS budgets (build-output tests), evidence doc with causal chain, island cost tracking                                                                                           | 2026-08-21 |
| 17  | Security                       | ✅ done | OWASP-guided review doc; XSS-safe JSON-LD escaping (TDD); audit clean; platform-delegated concerns recorded                                                                              | 2026-08-21 |
| 18  | Error handling                 | ✅ done | 500 page (served with 500 status), failure paths E2E-covered (fetch fallback, fail-soft webhook, field errors)                                                                           | 2026-08-21 |
| 19  | Logging & observability        | ✅ done | Structured request logs with severity; CI JSON logger via stable v7 `logHandlers`                                                                                                        | 2026-08-21 |
| 20  | Docker                         | ✅ done | Multi-stage, non-root, healthcheck; pinned pnpm via `packageManager` (supply-chain policy lesson); container verified end-to-end; ADR-004                                                | 2026-08-21 |
| 21  | CI/CD                          | ✅ done | GitHub Actions: audit → format → lint → typecheck → unit → build → e2e → docker buildx (gha cache)                                                                                       | 2026-08-21 |
| 22  | Cloudflare deployment          | ✅ done | `DEPLOY_TARGET` adapter switch, minimal wrangler.jsonc (v13+ auto-config), `wrangler dev` runtime verified, deploy workflow, full deployment doc                                         | 2026-08-21 |
| 23  | Production review              | ✅ done | `docs/architecture/production-review.md` - full audit with evidence and honest limitations                                                                                               | 2026-08-21 |

## Phase 24 extensions (post-curriculum, same day)

astro:env schema · ClientRouter view transitions · astro:assets covers ·
island component tests · Lighthouse CI gates · three-browser E2E ·
coverage thresholds · Renovate · release-please · GitHub Pages static
mirror (ADR-005) · custom glossary loader · prefetch · Sessions API ·
rate limiting · i18n (/tr slice). Site LIVE at
kefyusuf.github.io/astro-learning-lab.

## Final state

- **42 unit tests, 43 E2E tests** - all green
- **format / lint / typecheck / build / container** - all green
- **19 prerendered + 3 on-demand routes + 1 server island**, zero unnecessary client JS (budget-enforced)
- Full curriculum: `docs/learning/roadmap.md` · concepts: `docs/learning/astro-concepts.md`
