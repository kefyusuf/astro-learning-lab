# Performance - Evidence, Not Marketing

> "Why is this Astro site fast?" - answered with measurements from the
> actual build output, re-verified by `tests/unit/js-budget.test.ts`
> on every build.

## Measured facts (2026-08-21, Astro 7.2.4, uncompressed)

| Metric                      | Value                                                                        |
| --------------------------- | ---------------------------------------------------------------------------- |
| Pages built                 | 19                                                                           |
| Total shipped JS            | **188.5 KB** (~60 KB gzipped), all of it the React island on `/articles`     |
| Pages with zero external JS | 18/19 (only `/articles*` loads framework JS)                                 |
| Pages with zero JS at all   | 5 (404, guides ×3, status)                                                   |
| FavoriteButton script       | ~0.8 KB **inlined** per card page (no extra request, deduplicated)           |
| Server island loader        | ~2 small inline scripts on `/about` (fetches one fragment)                   |
| CSS                         | Inlined into HTML (no render-blocking external stylesheet, no extra request) |
| Average HTML page           | 10.6 KB (including inlined CSS)                                              |
| Fonts                       | **Zero downloads** - system font stack                                       |
| Images                      | favicon only                                                                 |

## Why this is fast (the causal chain)

1. **HTML is the product.** Most pages are prerendered static files -
   the server work happened at build time; serving is a file read.
2. **No framework runtime on content pages.** A page like
   `/topics/islands/` ships ~0.8 KB of inline script (favorites) and
   nothing else. No hydration, no virtual DOM, no bundle evaluation.
3. **No font downloads.** The system font stack costs zero bytes and
   zero layout-shift risk.
4. **CSS is inlined** into each page: no separate request, no
   render-blocking stylesheet fetch.
5. **The only expensive JS is quarantined** on `/articles`, hydrated
   with `client:idle`, and its cost is recorded in the island registry.

## Budgets (enforced by tests)

- Total external JS < 200 KB uncompressed
- Framework JS only on `/articles` routes
- Inline scripts < 2.5 KB per page (< 8 KB on island pages - props scale with the searchable list)
- Every page < 40 KB HTML including inlined CSS

## What would break the budget (watch list)

- Adding a framework island to a shared component (Header/Footer) -
  it would ship everywhere.
- Growing the searchable article list - serialized props grow with it;
  the follow-up is server-side search via `/api/articles`.
- Introducing a webfont - currently zero font bytes; a font means
  preload + swap strategy and a layout-shift review.

## Measurement commands

```sh
pnpm build
# JS inventory:
find dist/client -name "*.js" -exec du -b {} + | sort -n
# Script census per page:
grep -c "<script" dist/client/**/*.html
```
