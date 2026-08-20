# Island Registry

> Every client island must have an entry here: why it needs JS, why Astro-only
> was insufficient, its hydration strategy and its measured cost.
> A strategy that cannot be measured cannot be defended.

## ArticleSearch

| Field | Value |
|---|---|
| Location | `src/components/islands/ArticleSearch.tsx` |
| Used on | `/articles/` |
| Why JS is required | Live keystroke-level filtering needs input state and re-render per change; plain HTML cannot do this without a reload per keystroke. |
| Why not Astro-only | An Astro component renders once and ships no runtime; there is nothing to observe input events. |
| Hydration strategy | `client:idle` - the input is near the top of the page but the user needs time to focus and type; idle-time hydration is imperceptible and cheaper than `client:load`. |
| JS cost (uncompressed) | island 1.4 KB + react runtime 7.4 KB + react-dom client 179.7 KB ≈ **188.5 KB** (~60 KB gzipped) |
| Payload cost | Full article list serialized into props (small JSON in the HTML) - the explicit price of client-side filtering. Revisit if the corpus grows. |
| No-JS behavior | Input renders inert; the static paginated grid below still works (covered by an E2E test). |
| Known limitation | Filters only within the serialized list; server-side search via `/api/articles` is the follow-up if the corpus grows. |

## Budget

- Pages without interaction must ship **zero** client JavaScript (currently 18/19 pages).
- Interactive pages carry only the islands they use, hydrated with the weakest
  strategy that satisfies the UX.
- New islands must add their measured cost here in the same commit.
