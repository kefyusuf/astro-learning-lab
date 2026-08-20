import { expect, test } from "@playwright/test";

test.describe("rendering strategies", () => {
  test("/status renders on demand: two requests show different server times", async ({
    request,
  }) => {
    const extractTime = (html: string) =>
      /datetime="([^"]+)"/.exec(html)?.[1] ?? "";

    const first = await request.get("/status/");
    expect(first.status()).toBe(200);
    const firstTime = extractTime(await first.text());

    // Wait long enough for a one-second timestamp granularity change.
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const second = await request.get("/status/");
    const secondTime = extractTime(await second.text());

    expect(firstTime).toBeTruthy();
    // Prerendered pages would return the identical frozen timestamp.
    expect(secondTime).not.toBe(firstTime);
  });

  test("prerendered pages are frozen at build time (control group)", async ({
    request,
  }) => {
    // /guides has no islands: it must serve identical bytes twice.
    const first = await request.get("/guides/");
    expect(first.status()).toBe(200);
    const firstBody = await first.text();
    const second = await request.get("/guides/");
    expect(await second.text()).toBe(firstBody);
  });

  test("/status documents its rendering mode in the page", async ({
    request,
  }) => {
    const response = await request.get("/status/");
    const body = await response.text();
    expect(body).toContain("On-demand (dynamic)");
  });

  test("server island on a static page renders live content per request", async ({
    page,
  }) => {
    // The island content is fetched from /_server-islands/ by a tiny
    // loader script (no framework runtime), so a real browser context
    // is the right level to test user-visible behavior.
    await page.goto("/about/");
    const live = page.locator(".live time");
    await expect(live).toBeVisible();
    const first = await live.getAttribute("datetime");
    expect(first).toBeTruthy();

    await page.reload();
    await expect(page.locator(".live time")).toBeVisible();
    const second = await page.locator(".live time").getAttribute("datetime");
    expect(second).not.toBe(first);
  });
});
