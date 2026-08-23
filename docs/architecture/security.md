# Security Review

> Lightweight, OWASP-guided production review. No security theater:
> every item is either implemented, delegated to the platform with the
> decision recorded, or explicitly deferred with a trigger.

## Implemented

| Concern                 | Implementation                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| XSS - structured data   | `serializeJsonLd` escapes `<` to `\u003c` so content can never break out of the JSON-LD script tag (the escape helper ships with an injection-payload test case from the vitest era; the helper remains in `src/lib/serialize-json-ld.ts`). |
| XSS - content rendering | Article/guide bodies render through Astro's Markdown/MDX pipeline, which escapes by default. `set:html` is used **only** for the JSON-LD payload. Any future `set:html` on user-influenced data is a review blocker.                        |
| Input validation        | All form input validated server-side by the action's zod schema (`src/lib/feedback-schema.ts`); the HTML constraints (`required`, `maxlength`) are UX only, never trusted.                                                                  |
| CSRF                    | Astro's `security.checkOrigin` defaults to `true` (since v5): form POSTs to actions are rejected when the Origin header does not match the site. No override present in `astro.config`.                                                     |
| Clickjacking            | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` (middleware + hosting `_headers`, kept in sync - a vitest-era consistency check reviewed this pairing on every change).                                                              |
| MIME sniffing           | `X-Content-Type-Options: nosniff` everywhere.                                                                                                                                                                                               |
| Referrer leakage        | `Referrer-Policy: strict-origin-when-cross-origin`.                                                                                                                                                                                         |
| Browser capabilities    | `Permissions-Policy` disables camera, microphone, geolocation.                                                                                                                                                                              |
| Secrets                 | `.env` is gitignored; `.env.example` documents shape only. No `PUBLIC_` variables exist - grep-audited - so nothing sensitive can reach the browser bundle. The feedback webhook URL is server-only.                                        |
| Dependencies            | `pnpm audit` clean at time of review; CI re-runs it on every push (Phase 21).                                                                                                                                                               |
| Outbound calls          | The webhook forward has a 3-second timeout and fails soft - a slow/broken webhook cannot hang or fail the user's submission.                                                                                                                |

## Delegated to the platform (documented decisions)

| Concern                | Where it lives                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS / TLS            | Cloudflare edge (Workers) - always-on; Docker deployment terminates TLS at the reverse proxy, never in the app.                                                                                                                                                            |
| Rate limiting          | Platform-level on Cloudflare (WAF / rate-limiting rules) targeting `POST /feedback/` and `/api/*`. The Node/Docker target is for CI validation and trusted environments; if it ever faces the public internet, add rate-limit middleware first (trigger documented below). |
| Bot/abuse filtering    | Cloudflare bot management.                                                                                                                                                                                                                                                 |
| Observability of abuse | Structured request logs (middleware) + Workers observability.                                                                                                                                                                                                              |

## Deferred (with triggers)

| Concern                             | Trigger to implement                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSP without `'unsafe-inline'`       | If third-party scripts/styles are ever introduced - move to hash- or nonce-based CSP. Current inline styles/scripts are build-generated and first-party. |
| Rate-limit middleware (Node target) | If the Node adapter ever serves untrusted public traffic.                                                                                                |
| HSTS                                | Terminated at Cloudflare edge (enabled by default for Workers); add to reverse-proxy config for Docker deployments.                                      |

## Review habits encoded in the repo

- `pnpm audit` runs in CI.
- The `_headers` ↔ `securityHeaders()` consistency test prevents policy drift.
- The XSS escape helper is unit-tested with an actual injection payload.
