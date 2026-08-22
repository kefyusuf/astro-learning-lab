# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sessions.spec.ts >> sessions (server-side, cookie-based) >> a fresh context starts its own session
- Location: tests\e2e\sessions.spec.ts:19:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 1
Received:   1
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2]:
    - /url: "#main"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "astro-learning-lab" [ref=e5]:
        - /url: /
      - navigation "Main" [ref=e6]:
        - list [ref=e7]:
          - listitem [ref=e8]:
            - link "Articles" [ref=e9]:
              - /url: /articles/
          - listitem [ref=e10]:
            - link "Guides" [ref=e11]:
              - /url: /guides/
          - listitem [ref=e12]:
            - link "Topics" [ref=e13]:
              - /url: /topics/
          - listitem [ref=e14]:
            - link "Glossary" [ref=e15]:
              - /url: /glossary/
          - listitem [ref=e16]:
            - link "About" [ref=e17]:
              - /url: /about/
      - navigation "Language" [ref=e18]:
        - link "TR" [ref=e19]:
          - /url: /tr/status/
  - main [ref=e20]:
    - generic [ref=e21]:
      - heading "Server status" [level=1] [ref=e22]
      - paragraph [ref=e23]:
        - text: This page is
        - strong [ref=e24]: server-rendered on demand
        - text: (
        - code [ref=e25]: export const prerender = false
        - text: ). Every request re-runs the frontmatter - the timestamps below change while every prerendered page on this site stays frozen at its build time.
      - generic [ref=e26]:
        - generic [ref=e27]:
          - term [ref=e28]: Server time (UTC)
          - definition [ref=e29]:
            - time [ref=e30]: 2026-08-22T23:52:50.787Z
        - generic [ref=e31]:
          - term [ref=e32]: Server uptime
          - definition [ref=e33]: 0h 0m
        - generic [ref=e34]:
          - term [ref=e35]: Runtime
          - definition [ref=e36]: Node v22.21.0
        - generic [ref=e37]:
          - term [ref=e38]: Rendering mode
          - definition [ref=e39]: On-demand (dynamic)
        - generic [ref=e40]:
          - term [ref=e41]: Your visits (session)
          - definition [ref=e42]: "1"
  - contentinfo [ref=e43]:
    - paragraph [ref=e45]:
      - generic [ref=e46]:
        - text: © 2026 astro-learning-lab - a learning project. Built with
        - link "Astro" [ref=e47]:
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
  16 |     expect(second).toBe(first + 1);
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
> 33 |     expect(freshCount).toBeLessThan(warmCount);
     |                        ^ Error: expect(received).toBeLessThan(expected)
  34 |     await fresh.close();
  35 |   });
  36 | });
  37 | 
```