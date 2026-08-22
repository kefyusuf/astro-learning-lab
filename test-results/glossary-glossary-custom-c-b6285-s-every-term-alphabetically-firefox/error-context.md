# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: glossary.spec.ts >> glossary (custom content loader) >> lists every term alphabetically
- Location: tests\e2e\glossary.spec.ts:4:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

  Array [
+   "Content Collection",
+   "Custom Loader",
    "Island",
-   "Partial Hydration",
-   "Prerender",
  ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "astro-learning-lab" [ref=e5] [cursor=pointer]:
        - /url: /
      - navigation "Main" [ref=e6]:
        - list [ref=e7]:
          - listitem [ref=e8]:
            - link "Articles" [ref=e9] [cursor=pointer]:
              - /url: /articles/
          - listitem [ref=e10]:
            - link "Guides" [ref=e11] [cursor=pointer]:
              - /url: /guides/
          - listitem [ref=e12]:
            - link "Topics" [ref=e13] [cursor=pointer]:
              - /url: /topics/
          - listitem [ref=e14]:
            - link "Glossary" [ref=e15] [cursor=pointer]:
              - /url: /glossary/
          - listitem [ref=e16]:
            - link "About" [ref=e17] [cursor=pointer]:
              - /url: /about/
  - main [ref=e18]:
    - generic [ref=e19]:
      - heading "Glossary" [level=1] [ref=e20]
      - paragraph [ref=e21]: 7 terms from the project's custom content loader - parsed, id-generated and validated by our own loader code.
      - generic [ref=e22]:
        - generic [ref=e23]:
          - term [ref=e24]: Content Collection
          - definition [ref=e25]:
            - text: A typed, schema-validated content pipeline with query helpers, defined in content.config.ts.
            - paragraph [ref=e26]:
              - text: "See also:"
              - link "Custom Loader" [ref=e27] [cursor=pointer]:
                - /url: "#custom-loader"
        - generic [ref=e28]:
          - term [ref=e29]: Custom Loader
          - definition [ref=e30]:
            - text: "Your own data pipeline for a collection: parsing, id generation and validation live in your code."
            - paragraph [ref=e31]:
              - text: "See also:"
              - link "Content Collection" [ref=e32] [cursor=pointer]:
                - /url: "#content-collection"
        - generic [ref=e33]:
          - term [ref=e34]: Island
          - definition [ref=e35]:
            - text: An interactive component that ships its own JavaScript and hydrates independently of the rest of the page.
            - paragraph [ref=e36]:
              - text: "See also:"
              - link "Partial Hydration" [ref=e37] [cursor=pointer]:
                - /url: "#partial-hydration"
              - link "Client Directive" [ref=e38] [cursor=pointer]:
                - /url: "#client-directive"
        - generic [ref=e39]:
          - term [ref=e40]: On-Demand Rendering
          - definition [ref=e41]:
            - text: "Rendering a route per request in a server runtime, chosen per route with `export const prerender = false`."
            - paragraph [ref=e42]:
              - text: "See also:"
              - link "Prerender" [ref=e43] [cursor=pointer]:
                - /url: "#prerender"
        - generic [ref=e44]:
          - term [ref=e45]: Partial Hydration
          - definition [ref=e46]:
            - text: Shipping and hydrating JavaScript for individual components instead of the entire page.
            - paragraph [ref=e47]:
              - text: "See also:"
              - link "Island" [ref=e48] [cursor=pointer]:
                - /url: "#island"
        - generic [ref=e49]:
          - term [ref=e50]: Prerender
          - definition [ref=e51]:
            - text: Rendering a route to HTML at build time so serving it requires no server work.
            - paragraph [ref=e52]:
              - text: "See also:"
              - link "On-Demand Rendering" [ref=e53] [cursor=pointer]:
                - /url: "#on-demand-rendering"
        - generic [ref=e54]:
          - term [ref=e55]: Server Island
          - definition [ref=e56]:
            - text: A request-time server fragment inside an otherwise static page, injected without client JavaScript.
            - paragraph [ref=e57]:
              - text: "See also:"
              - link "Island" [ref=e58] [cursor=pointer]:
                - /url: "#island"
  - contentinfo [ref=e59]:
    - paragraph [ref=e61]:
      - generic [ref=e62]:
        - text: © 2026 astro-learning-lab - a learning project. Built with
        - link "Astro" [ref=e63] [cursor=pointer]:
          - /url: https://astro.build
        - text: .
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("glossary (custom content loader)", () => {
  4  |   test("lists every term alphabetically", async ({ page }) => {
  5  |     await page.goto("/glossary/");
  6  |     const terms = page.locator(".terms dt");
  7  |     expect(await terms.count()).toBeGreaterThanOrEqual(7);
  8  | 
  9  |     // Alphabetical order: Island < Partial Hydration < Prerender
  10 |     const firstThree = await terms.allTextContents();
> 11 |     expect(firstThree.slice(0, 3)).toEqual([
     |                                    ^ Error: expect(received).toEqual(expected) // deep equality
  12 |       "Island",
  13 |       "Partial Hydration",
  14 |       "Prerender",
  15 |     ]);
  16 |   });
  17 | 
  18 |   test("see-also links resolve to sibling term anchors", async ({ page }) => {
  19 |     await page.goto("/glossary/");
  20 |     const islandSeeAlso = page
  21 |       .locator(".term", { has: page.locator("dt", { hasText: "Island" }) })
  22 |       .getByRole("link", { name: "Partial Hydration" });
  23 |     await islandSeeAlso.click();
  24 |     await expect(page.locator("#partial-hydration")).toBeVisible();
  25 |   });
  26 | });
  27 | 
```