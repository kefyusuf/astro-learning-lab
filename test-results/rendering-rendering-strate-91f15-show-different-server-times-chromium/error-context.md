# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rendering.spec.ts >> rendering strategies >> /status renders on demand: two requests show different server times
- Location: tests\e2e\rendering.spec.ts:4:3

# Error details

```
TypeError: first.locator is not a function
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("rendering strategies", () => {
  4  |   test("/status renders on demand: two requests show different server times", async ({
  5  |     request,
  6  |   }) => {
  7  |     const first = await request.get("/status/");
  8  |     expect(first.status()).toBe(200);
  9  |     const firstTime = await first
> 10 |       .locator("time")
     |        ^ TypeError: first.locator is not a function
  11 |       .first()
  12 |       .getAttribute("datetime");
  13 | 
  14 |     // Wait long enough for a one-second timestamp granularity change.
  15 |     await new Promise((resolve) => setTimeout(resolve, 1100));
  16 | 
  17 |     const second = await request.get("/status/");
  18 |     const secondTime = await second
  19 |       .locator("time")
  20 |       .first()
  21 |       .getAttribute("datetime");
  22 | 
  23 |     // Prerendered pages would return the identical frozen timestamp.
  24 |     expect(secondTime).not.toBe(firstTime);
  25 |   });
  26 | 
  27 |   test("prerendered pages are frozen at build time (control group)", async ({
  28 |     request,
  29 |   }) => {
  30 |     const first = await request.get("/about/");
  31 |     expect(first.status()).toBe(200);
  32 |     // A static page is served as a build artifact - this assertion is
  33 |     // structural: it must exist as a file in dist/, verified by the
  34 |     // build itself. Here we assert it serves identical bytes twice.
  35 |     const firstBody = await first.text();
  36 |     const second = await request.get("/about/");
  37 |     expect(await second.text()).toBe(firstBody);
  38 |   });
  39 | 
  40 |   test("/status documents its rendering mode in the page", async ({
  41 |     request,
  42 |   }) => {
  43 |     const response = await request.get("/status/");
  44 |     const body = await response.text();
  45 |     expect(body).toContain("On-demand (dynamic)");
  46 |   });
  47 | });
  48 | 
```