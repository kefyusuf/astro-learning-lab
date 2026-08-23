---
title: "Architecture Overview"
---

# Architecture Overview - astro-learning-lab

> Status: Phase 0 (initial). This document is the architectural foundation of the project.
> It records **what Astro is, how it thinks, and why this project is shaped the way it is.**

---

## 1. Verified Environment (as of 2026-08-21)

| Component           | Version                   |
| ------------------- | ------------------------- |
| Astro               | **7.2.4** (latest stable) |
| @astrojs/cloudflare | 14.2.3                    |
| @astrojs/react      | 6.0.4                     |
| Node.js             | 22.21.0                   |
| pnpm                | 10.14.0                   |

Astro 7 highlights that affect this project:

- **Rust compiler is the default and only compiler** (the Go-based compiler was removed).
  It does _not_ silently repair invalid HTML - invalid nesting produces broken output.
  This enforces the discipline we want anyway: valid, semantic HTML.
- **Vite 8** is the dev server and production bundler.
- **Route caching is stable**: top-level `cache` + `routeRules` (maxAge, SWR) in `astro.config`.
- **Advanced routing is default**: `src/fetch.ts` is now a reserved filename (like `src/middleware.ts`).
- **`@astrojs/db` was removed** from the ecosystem (not used in this project).
- **Server Islands (`server:defer`) are stable.**

---

## 2. What Problem Does Astro Solve?

Most websites are **content-first**: articles, docs, marketing pages, storefronts.
Yet the default modern workflow ships a full JavaScript framework to the browser to
display that content. The result: megabytes of JS, slow hydration, poor Core Web Vitals -
for pages whose content never changes after render.

Astro's thesis:

> Render the page to **HTML** (at build time or on the server), ship **zero JavaScript
> by default**, and add JavaScript **only** for the specific components that are
> interactive ("islands").

```
Astro Component
      │
      ▼
runs during build / server rendering
      │
      ▼
HTML
      │
      ▼
Browser            ← no framework runtime, no hydration
```

versus the island path:

```
Framework Island (React/Svelte/…)
      │
      ▼
HTML (pre-rendered)
+
JavaScript (only for this component)
      │
      ▼
Browser hydration  ← only this island wakes up
```

---

## 3. Core Principles

| Principle                  | Meaning                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **Server-first**           | Components execute during build or on the server. The browser receives HTML.           |
| **Zero-JS by default**     | No client runtime unless a component explicitly opts in with a `client:*` directive.   |
| **Islands architecture**   | Interactivity is isolated in small, independently hydrated components.                 |
| **UI-agnostic**            | Any major framework (React, Svelte, Vue, Solid, Preact) can power an island - or none. |
| **Content-driven**         | First-class Content Collections with typed schemas and validation.                     |
| **Rendering is per-route** | Every route independently chooses static prerender or on-demand server rendering.      |

---

## 4. Rendering Model (Astro 7)

Rendering is decided **per route**, not per app:

```astro
---
// Static (default when output: 'static'): generated at build time.
---

--- export const prerender = false; // This route renders on-demand, per
request. ---
```

- `output: 'static'` (default): everything prerendered at build; opt routes **out** with `export const prerender = false`.
- `output: 'server'`: everything rendered on demand; opt routes **in** with `export const prerender = true`.
- **Server Islands** (`<Component server:defer />`): a dynamic fragment inside an
  otherwise static page, rendered on the server per request and streamed into the
  cached HTML - no client JS involved.

Decision rule for this project:

```
Does the response depend on the request (user, time, headers, cookies)?
├── No  → prerender at build (static)
└── Yes → does the whole page depend on it, or a small fragment?
          ├── whole page  → server-rendered route (prerender = false)
          └── fragment    → server island (server:defer)
```

---

## 5. Islands Architecture

A **client island** is a framework component that ships JS and hydrates in the browser.
Everything around it stays static HTML.

Hydration directives (weakest strategy that satisfies the UX wins):

| Directive        | When it hydrates                         | Use for                                   |
| ---------------- | ---------------------------------------- | ----------------------------------------- |
| `client:load`    | Immediately on page load                 | Interaction is the page's primary purpose |
| `client:idle`    | After `requestIdleCallback` fires        | Lower-priority, soon-needed UI            |
| `client:visible` | When the component scrolls into viewport | Below-the-fold interactive content        |
| `client:media`   | When a CSS media query matches           | Device-conditional widgets                |
| `client:only`    | Never SSR'd; client-only render          | Browser-only APIs, no SSR HTML wanted     |

Every island must answer, in a comment or doc:

```
Why does this require JavaScript?
Why can't this remain Astro-only?
When should it hydrate?
How much JavaScript does it add?
```

A **server island** (`server:defer`) is the mirror image: dynamic _server_ content
inside a static page - personalization without client JS.

---

## 6. Astro vs Next.js vs SPA vs Classic SSG

| Dimension             | Astro                                       | Next.js                        | Classic SPA (CRA/Vite-React)  | Classic SSG (Hugo/Jekyll) |
| --------------------- | ------------------------------------------- | ------------------------------ | ----------------------------- | ------------------------- |
| Default output        | HTML, zero JS                               | React tree + hydration runtime | Full React runtime            | HTML, zero JS             |
| Interactivity model   | Opt-in islands                              | Whole tree hydrates            | Everything is client JS       | None (or bolt-on)         |
| Rendering granularity | **Per route**                               | Per route (but always React)   | Client-only                   | Build-only                |
| Content workflow      | Content Collections (typed, validated)      | MDX + external tooling         | External tooling              | File-based, weakly typed  |
| Server logic          | Endpoints, Actions, middleware              | Route handlers, Server Actions | None (needs a backend)        | None                      |
| Framework lock-in     | None (UI-agnostic islands)                  | React only                     | React only                    | Template language only    |
| Best fit              | Content sites with islands of interactivity | Full React applications        | Highly interactive app shells | Purely static content     |

**The honest trade-off:** Astro is not an app framework. If your product is a
state-heavy application shell (Figma-like editors, complex dashboards, real-time
collaborative tools), a SPA framework is the better default. Astro is the better
default when most routes are content and a few regions are interactive - which is
exactly the shape of `astro-learning-lab`.

---

## 7. Where Astro Shines - and Where It Doesn't

Strong first choice:

- marketing sites, landing pages
- documentation, blogs, knowledge platforms
- corporate websites, content platforms
- SEO-critical sites, storefronts
- **this project**: a content platform with deliberate interactive islands

Usually not the first choice:

- highly interactive application shells
- Figma-like editors, canvas tools
- complex state-heavy dashboards
- SaaS frontends where nearly every pixel is stateful

---

## 8. Architectural Guardrails (project law)

1. **No SPA.** Never `<App client:load />` wrapping the site.
2. **Astro components for everything static**: Header, Footer, cards, layouts, navigation.
3. **React only for genuine interactivity**, and only after an Astro-only attempt
   (plain HTML + a `<script>`) proves insufficient.
4. **Weakest hydration strategy first**: prefer `client:visible` / `client:idle` over `client:load`.
5. **No client fetch for data resolvable at build/server time.**
6. **Client state only for client concerns** (e.g. favorites in localStorage).
   Server concerns stay on the server.
7. **Duplication over wrong abstraction.** Extract after repetition, not before.
8. Every added byte of client JS must be justified in review.

---

## 9. Target System Shape

```
astro-learning-lab
├── Landing, Articles, Guides, Topics      → prerendered (static)
├── /articles/[slug], /topics/[slug]       → prerendered from Content Collections
├── Search / Filters                        → client island (React), lazy hydration
├── Favorites                               → client island + localStorage
├── Feedback form                           → Astro Actions (server-side validation)
├── /api/health, /api/articles              → endpoints (prerender=false)
├── /status                                 → server-rendered route
├── live info fragments                     → server islands (server:defer)
├── middleware                              → request id, security headers, logging
├── SEO                                     → sitemap, RSS, OG/meta, canonicals
├── Deployment                              → Cloudflare Workers + Static Assets
│                                            (Docker image for reproducible CI validation
│                                             and alternate Node deployment - different
│                                             runtime models, documented separately)
└── CI                                      → format → lint → typecheck → test → build → e2e
```

Each box arrives in its own phase. Nothing is built before the concept that
justifies it has been taught.

---

## 10. Related Documents

- `docs/learning/roadmap.md` - phase-by-phase learning plan
- `docs/learning/astro-concepts.md` - living concept glossary
- `docs/learning/progress.md` - progress tracker
- `docs/adr/` - architecture decision records (created only for meaningful decisions)
