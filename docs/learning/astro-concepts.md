# Astro Concepts - Living Glossary

> Updated continuously as phases progress. Each entry: **what it is → what problem it
> solves → how Astro implements it**. Written to be readable without code open.

---

## Fundamentals

### Astro

A web framework for **content-driven websites**. It renders components to HTML at
build time or on the server, ships **zero JavaScript by default**, and adds JS only
for explicitly opted-in interactive components ("islands").

### `.astro` component

A file with an optional **frontmatter** code fence and a template:

```astro
---
// frontmatter: runs at BUILD time or REQUEST time (server). Never in the browser.
const { title } = Astro.props;
---

<!-- template: becomes HTML output -->
<h1>{title}</h1>
```

The frontmatter/template split is the core mental model: **everything above the
fence is server/build code; everything below is markup.** No JS reaches the browser
unless a `client:*` directive says so.

### Frontmatter

The `---` fenced block at the top of `.astro` files. Executes during rendering
(build or request). This is where you fetch data, read props, compute values.

### Props

Data passed into a component: `Astro.props`. Typed via `interface Props` in
TypeScript - checked by `astro check`.

### Slots

Composition mechanism: a component declares `<slot />` (or `<slot name="x" />`),
parents inject content. Astro's alternative to `children`/render props - resolved
at render time, costs zero client JS.

### Layout

An `.astro` component providing the shared page skeleton (`<html>`, head, header,
footer) that pages wrap themselves in via slots. Not a framework feature - just a
naming convention for slot-based composition.

### Routing

File-based. `src/pages/articles/index.astro` → `/articles`;
`src/pages/articles/[slug].astro` → `/articles/:slug` with `getStaticPaths()`
supplying the parameter list at build time.

### Content Collections

Typed, validated content pipeline. Collections are defined in `src/content.config.ts`
with a **loader** (e.g. `glob()`) and a **zod schema**; entries get generated types,
query helpers (`getCollection`, `getEntry`), and `render()` for Markdown/MDX.
Problem solved: Markdown as random files with unvalidated frontmatter.

### Islands Architecture

Page = static HTML + isolated interactive components ("islands"). Each island
hydrates **independently**, with its own strategy. The page never becomes an app.

### Partial hydration

Shipping/hydrating JS for _some_ components, not the whole page. Islands are the
mechanism; `client:*` directives are the opt-in.

---

## Rendering

### Static generation (prerendering)

Route HTML produced at **build time**. Fast, cacheable, no server needed.
Astro's default under `output: 'static'`.

### On-demand (server) rendering

Route rendered **per request** by a server runtime (Node, Cloudflare Worker…).
Opt in per route with `export const prerender = false` (under `output: 'static'`),
or make it the default with `output: 'server'` + `prerender = true` per static route.

### Rendering modes per route

Astro decides **per route**, not per app: most routes static, a few dynamic, mixed
freely in one project.

### Server Island (`server:defer`)

A dynamic **server**-rendered fragment inside an otherwise static page. The static
shell is cached/served; the island is fetched per request and injected - personalization
without client JS. Mirror image of a client island.

### Client island & hydration

A framework component (React etc.) that ships JS to the browser and "wakes up".
Hydration = attaching framework runtime + event listeners to pre-rendered HTML.

### Client directives

| Directive        | Hydrates                   |
| ---------------- | -------------------------- |
| `client:load`    | immediately                |
| `client:idle`    | when browser is idle       |
| `client:visible` | when scrolled into view    |
| `client:media`   | when a media query matches |
| `client:only`    | client-only, never SSR'd   |

Policy in this project: **weakest strategy that satisfies the UX.**

---

## Backend

### Endpoint

A file in `src/pages/api/*` exporting HTTP method functions (`GET`, `POST`…)
returning a `Response`. On-demand unless `prerender = true`.

### Actions

Server-side functions callable from forms or client code, with zod-validated
inputs and typed results. Current recommended way to handle form submissions
(`defineAction`, `getActionContext` in middleware for form flows).

### Middleware

`src/middleware.ts` - functions running **before** route rendering on every
matched request (`defineMiddleware`, `sequence` for ordering). Used for request
ids, security headers, logging, action interception.

### Environment variables

`import.meta.env`. Variables prefixed `PUBLIC_` are exposed to client bundles;
everything else is server-only. Secrets never get a `PUBLIC_` prefix.

---

## Production

### SEO surface

Semantic HTML, titles, meta descriptions, canonical URLs, Open Graph/Twitter
metadata, `@astrojs/sitemap`, `@astrojs/rss`, structured data.

### Performance stance

Zero-JS pages by default; every island's JS cost measured and justified.
"Why is this site fast?" must be answered with evidence (bundle sizes, waterfalls,
Core Web Vitals), not marketing.

### Deployment targets (this project)

- **Cloudflare Workers + Static Assets** - the current recommended path; adapter
  `@astrojs/cloudflare`, `wrangler.jsonc` with `ASSETS` binding + `nodejs_compat`.
- **Docker (Node)** - for reproducible CI validation and alternate Node hosting.
  Different runtime model from Workers; both are documented, neither is assumed.

---

---

## Phase 24 additions

### `astro:env`

Typed environment schema in `astro.config` (`envField`). Variables are
validated at build time and imported type-safely from `astro:env/server`
or `astro:env/client`. `context: 'server' + access: 'secret'` guarantees
a value never enters the client bundle - enforced by the schema, not by
naming convention. A missing required variable fails the build.

### View Transitions (`ClientRouter`)

Client-side routing with full DOM swaps: every page stays server-rendered;
navigation fetches and swaps the new HTML. The trade-off: the router ships
a ~16 KB shared runtime to every page. **Bundled scripts run once per full
load** - DOM-lifecycle work must re-run on `astro:after-swap` /
`astro:page-load` (see the favorites script). `data-astro-rerun` is the
escape hatch for inline scripts.

### `astro:assets` (`<Image />`)

Images become build artifacts. Content-collection images use the schema
function's `image()` helper (frontmatter paths become typed
`ImageMetadata`). `<Image>` derives responsive `srcset`, WebP conversion
and intrinsic dimensions (no layout shift); `getImage()` yields the final
URL for `og:image`. Image service is a build/runtime decision - this
project compiles at build time on both targets.

### Island component testing

Islands are ordinary framework components: `@testing-library/react` +
happy-dom tests hydration units (filtering, states, accessibility roles)
in isolation, complementing page-level Playwright E2E. In Vite 8, JSX
transform config lives in **tsconfig** (`jsx: react-jsx`), not the
ignored esbuild key.

## Open questions (filled in as phases progress)

- [ ] What exactly does the build output look like? (Phase 1)
- [ ] How does `getStaticPaths` shape build output? (Phase 3)
- [ ] How do collection references resolve? (Phase 4)
- [ ] What does an island's JS bundle actually contain? (Phase 6)
- [ ] How does `server:defer` stream into cached HTML? (Phase 11)
- [ ] How do routeRules interact with the adapter? (Phase 10/22)

---

## Phase 25 additions

### Custom Content Loader

A collection's `loader` is your code: `async load({ store, logger })`
reads from anywhere, validates, and fills the data store
(`store.clear()` then `store.set({ id, data })`). The zod schema still
applies on read. Failure contract: invalid source data fails the build.
Trap: the context store type exposes `clear()`, not `clearAll()`.

### Prefetch

`prefetch: { prefetchAll: true }` ships a tiny script that fetches
internal pages on hover/focus. Pairs with ClientRouter for near-instant
swaps. Cost here: ~1.6 KB shared.

### Sessions (`Astro.session`)

Per-visitor server state behind an opaque cookie. Drivers: filesystem
(Node standalone) or KV (Cloudflare, auto-provisioned on deploy).
Server-only routes can personalize without client JS.

### Rate limiting (middleware)

Fixed-window counter keyed by IP, injected clock for deterministic
tests, 429 + `Retry-After` on exceed. In-memory = per-instance
deterrent; the platform WAF stays the real control.

### i18n routing

Locales are URL prefixes (`/tr/...`) configured in `astro.config`;
UI strings come from a dictionary keyed by the path-derived locale;
hreflang alternates declare equivalents to search engines. UI and
content localization can progress independently.
