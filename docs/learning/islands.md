# Island Registry

> Every client island must have an entry here: why it needs JS, why Astro-only
> was insufficient, its hydration strategy and its measured cost.
> A strategy that cannot be measured cannot be defended.

## ArticleSearch

| Field                  | Value                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Location               | `src/components/islands/ArticleSearch.tsx`                                                                                                                            |
| Used on                | `/articles/`                                                                                                                                                          |
| Why JS is required     | Live keystroke-level filtering needs input state and re-render per change; plain HTML cannot do this without a reload per keystroke.                                  |
| Why not Astro-only     | An Astro component renders once and ships no runtime; there is nothing to observe input events.                                                                       |
| Hydration strategy     | `client:idle` - the input is near the top of the page but the user needs time to focus and type; idle-time hydration is imperceptible and cheaper than `client:load`. |
| JS cost (uncompressed) | island 1.4 KB + react runtime 7.4 KB + react-dom client 179.7 KB ≈ **188.5 KB** (~60 KB gzipped)                                                                      |
| Payload cost           | Full article list serialized into props (small JSON in the HTML) - the explicit price of client-side filtering. Revisit if the corpus grows.                          |
| No-JS behavior         | Input renders inert; the static paginated grid below still works (covered by an E2E test).                                                                            |
| Known limitation       | Filters only within the serialized list; server-side search via `/api/articles` is the follow-up if the corpus grows.                                                 |

## LiveServerInfo (server island)

| Field               | Value                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Location            | `src/components/LiveServerInfo.astro`                                                                                                                                                      |
| Used on             | `/about/` (a prerendered page)                                                                                                                                                             |
| Directive           | `server:defer`                                                                                                                                                                             |
| Why a server island | The page is cached and served statically; only this fragment needs per-request data (server time, uptime). A client island would pay a JS bundle to display what the server already knows. |
| Client JS cost      | No framework runtime. A small inline loader script fetches the fragment from `/_server-islands/` and injects it (one extra request per island).                                            |
| Build impact        | Adding a server island switches the build output to the hybrid layout (`dist/client/` + `dist/server/`) even for otherwise static sites.                                                   |
| No-JS behavior      | The island placeholder stays empty - the fragment requires the loader script. Static content around it is unaffected.                                                                      |

## Client island vs server island

|                 | Client island                    | Server island                                  |
| --------------- | -------------------------------- | ---------------------------------------------- |
| Dynamism source | Browser behavior (state, events) | Server execution per request                   |
| Ships           | Framework JS + component JS      | Nothing (loader fetches rendered HTML)         |
| Directive       | `client:*`                       | `server:defer`                                 |
| Use when        | Interaction state is required    | Request-dependent content inside a cached page |

## Budget

- Pages with no interactive feature ship **zero** client JavaScript
  (checked against the build output at review time).
- Card pages carry only the ~0.8 KB inlined favorites script.
- Interactive pages carry only the islands they use, hydrated with the weakest
  strategy that satisfies the UX.
- New islands must add their measured cost here in the same commit.
- Full evidence: `docs/learning/performance.md`.
