# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sessions.spec.ts >> sessions (server-side, cookie-based) >> visit counter increments within one browser context
- Location: tests\e2e\sessions.spec.ts:7:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 1
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - link "Skip to content" [ref=f1e2]:
    - /url: "#main"
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - link "astro-learning-lab" [ref=f1e5]:
        - /url: /
      - navigation "Main" [ref=f1e6]:
        - list [ref=f1e7]:
          - listitem [ref=f1e8]:
            - link "Articles" [ref=f1e9]:
              - /url: /articles/
          - listitem [ref=f1e10]:
            - link "Guides" [ref=f1e11]:
              - /url: /guides/
          - listitem [ref=f1e12]:
            - link "Topics" [ref=f1e13]:
              - /url: /topics/
          - listitem [ref=f1e14]:
            - link "Glossary" [ref=f1e15]:
              - /url: /glossary/
          - listitem [ref=f1e16]:
            - link "About" [ref=f1e17]:
              - /url: /about/
      - navigation "Language" [ref=f1e18]:
        - link "TR" [ref=f1e19]:
          - /url: /tr/status/
  - main [ref=f1e20]:
    - generic [ref=f1e21]:
      - heading "Server status" [level=1] [ref=f1e22]
      - paragraph [ref=f1e23]:
        - text: This page is
        - strong [ref=f1e24]: server-rendered on demand
        - text: (
        - code [ref=f1e25]: export const prerender = false
        - text: ). Every request re-runs the frontmatter - the timestamps below change while every prerendered page on this site stays frozen at its build time.
      - generic [ref=f1e26]:
        - generic [ref=f1e27]:
          - term [ref=f1e28]: Server time (UTC)
          - definition [ref=f1e29]:
            - time [ref=f1e30]: 2026-08-22T23:52:50.181Z
        - generic [ref=f1e31]:
          - term [ref=f1e32]: Server uptime
          - definition [ref=f1e33]: 0h 0m
        - generic [ref=f1e34]:
          - term [ref=f1e35]: Runtime
          - definition [ref=f1e36]: Node v22.21.0
        - generic [ref=f1e37]:
          - term [ref=f1e38]: Rendering mode
          - definition [ref=f1e39]: On-demand (dynamic)
        - generic [ref=f1e40]:
          - term [ref=f1e41]: Your visits (session)
          - definition [ref=f1e42]: "1"
  - contentinfo [ref=f1e43]:
    - paragraph [ref=f1e45]:
      - generic [ref=f1e46]:
        - text: © 2026 astro-learning-lab - a learning project. Built with
        - link "Astro" [ref=f1e47]:
          - /url: https://astro.build
        - text: .
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const readVisits = (page: import("@playwright/test").Page) =>
  4  |   page.$eval("[data-visits]", (el) => Number(el.textContent?.trim()));
  5  | 
  6  | test.describe("sessions (server-side, cookie-based)", () => {
  7  |   test("visit counter increments within one browser context", async ({
  8  |     page,
  9  |   }) => {
  10 |     await page.goto("/status/");
  11 |     const first = await readVisits(page);
  12 |     expect(first).toBeGreaterThanOrEqual(1);
  13 | 
  14 |     await page.reload();
  15 |     const second = await readVisits(page);
> 16 |     expect(second).toBe(first + 1);
     |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  17 |   });
  18 | 
  19 |   test("a fresh context starts its own session", async ({ browser }) => {
  20 |     // Existing visitor warms up first.
  21 |     const warm = await browser.newContext();
  22 |     const warmPage = await warm.newPage();
  23 |     await warmPage.goto("/status/");
  24 |     await warmPage.goto("/status/");
  25 |     const warmCount = await readVisits(warmPage);
  26 |     await warm.close();
  27 | 
  28 |     // A brand-new context must not inherit the other session's state.
  29 |     const fresh = await browser.newContext();
  30 |     const freshPage = await fresh.newPage();
  31 |     await freshPage.goto("/status/");
  32 |     const freshCount = await readVisits(freshPage);
  33 |     expect(freshCount).toBeLessThan(warmCount);
  34 |     await fresh.close();
  35 |   });
  36 | });
  37 | 
```