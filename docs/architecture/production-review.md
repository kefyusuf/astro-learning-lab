# Production Review

> Snapshot notice: this audit reflects the Phase 23 state. In a later
> simplification pass the vitest/unit-test layer was removed; behavioral
> coverage now lives entirely in the Playwright e2e suite. Counts cited
> below are historical.
> The pre-completion audit required by the curriculum. Every claim
> below is backed by a test, a document, or a named limitation.

## Architecture

| Question                     | Verdict | Evidence                                                                                                                                                                  |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro-native?                | ✅      | Static-first, per-route rendering, content collections, actions, server island. No SPA shell anywhere.                                                                    |
| Unnecessary client JS?       | ✅ none | JS budget enforced by tests: 0 external JS on 18/19 prerendered pages; ~0.8 KB inline favorites script on card pages.                                                     |
| Unnecessary React?           | ✅ none | React exists only in `ArticleSearch` (live filtering - genuinely needs client state). Header/Footer/cards/layouts are Astro. Favorites deliberately use a vanilla script. |
| Rendering decisions correct? | ✅      | Static: content pages. On-demand: `/status`, `/feedback`, `/api/*`. Server island: live fragment inside a static page. Each decision documented and test-observed.        |

## Testing

| Question                    | Verdict | Evidence                                                                                                                                                                                                                                   |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Meaningful tests?           | ✅      | 42 unit + 43 E2E. Unit: pure logic (pagination, content helpers, schemas, log formatter, JSON-LD escaping, budgets). E2E: user-visible behavior (search, favorites persistence, form validation, HTTP semantics, a11y scans, JS-off grid). |
| Critical flows protected?   | ✅      | Feedback submission (valid + invalid), search hydration, favorites across reload/pages, 404/500 UX, security headers, budget drift.                                                                                                        |
| TDD applied where valuable? | ✅      | paginate, content helpers, stats parsing, feedback schema, security headers, logger, JSON-LD escaping - all RED→GREEN. UI covered behavior-first.                                                                                          |

## Security

| Question            | Verdict       | Evidence                                                                                                                                                                                             |
| ------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets?            | ✅            | No `PUBLIC_` vars exist; `.env` gitignored; webhook URL server-only.                                                                                                                                 |
| Unsafe rendering?   | ✅ audited    | `set:html` used once (JSON-LD) with injection-safe escaping, unit tested.                                                                                                                            |
| Missing validation? | ✅            | Server-side zod on all form input; endpoint query params validated (400s).                                                                                                                           |
| Headers/CSRF        | ✅            | CSP + clickjacking + nosniff + referrer policy (middleware + `_headers`, sync-tested); `checkOrigin` default-on for form actions.                                                                    |
| Known gaps          | 📄 documented | `unsafe-inline` in CSP (first-party inline scripts; hash-based CSP deferred with trigger), rate limiting delegated to platform (trigger: public Node exposure). See `docs/architecture/security.md`. |

## Performance

| Question             | Verdict | Evidence                                                                             |
| -------------------- | ------- | ------------------------------------------------------------------------------------ |
| Unnecessary bundles? | ✅ none | 188.5 KB total, all on `/articles` (React island). Zero fonts. CSS inlined.          |
| Excessive hydration? | ✅      | One client island, `client:idle`, cost recorded. Server island adds no framework JS. |
| Evidence-based?      | ✅      | `docs/learning/performance.md` + enforced budget tests.                              |

## Accessibility

| Question             | Verdict | Evidence                                                                                                |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Keyboard accessible? | ✅      | Skip-link focus flow tested; global `:focus-visible`; native elements throughout.                       |
| Semantic markup?     | ✅      | Landmarks, heading order (axe-verified), labeled forms, `aria-pressed`/`aria-live` where state changes. |
| Automated scans      | ✅      | axe-core: zero violations on all key pages.                                                             |

## SEO

| Question               | Verdict | Evidence                                                                           |
| ---------------------- | ------- | ---------------------------------------------------------------------------------- |
| Metadata               | ✅      | Single SEO component: canonical, OG, Twitter; article metadata + JSON-LD on posts. |
| Sitemap / RSS / robots | ✅      | `sitemap-index.xml`, `/rss.xml` (draft-free), `/robots.txt` - all E2E tested.      |

## Operations

| Question        | Verdict | Evidence                                                                                                               |
| --------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| CI              | ✅      | format → audit → lint → typecheck → unit → build → e2e → docker build, fail-fast, concurrency-grouped.                 |
| Docker          | ✅      | Multi-stage, non-root, healthcheck via `/api/health`, verified locally.                                                |
| Deployment docs | ✅      | `docs/deployment/cloudflare.md` (build, deploy, env, routing, caching, logs, rollback) + ADR-004 dual-target decision. |
| Health endpoint | ✅      | `GET /api/health` - used by compose healthcheck.                                                                       |
| Logs            | ✅      | Structured JSON request logs with severity; Workers Logs enabled; CI JSON logger.                                      |

## Known limitations (honest list)

1. **Client-side search filters only the serialized list** - fine at
   current size; the trigger to move to `/api/articles` search is
   documented in the island registry.
2. **Form refresh resubmission** - the default Actions flow renders the
   POST response; PRG via middleware + session persistence is the
   documented upgrade path.
3. **CSP `unsafe-inline`** - acceptable for build-generated first-party
   inline scripts/styles; hash-based policy deferred with a trigger.
4. **No content images yet** - image optimization strategy (and the
   Cloudflare Images binding) activates with the first real image.
5. **Single-language, single-author-workflow** - i18n and editorial
   roles were out of scope by design.

## Verdict

The project meets its Definition of Done: architecture respected,
checks green (42 unit + 43 E2E + typecheck + lint + format + build +
container), accessibility and security reviewed, no unnecessary
client JavaScript, documentation current, history meaningful.
