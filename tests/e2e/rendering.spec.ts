import { expect, test } from "@playwright/test";

test.describe("rendering strategies", () => {
  test("/status renders on demand: two requests show different server times", async ({
    request,
  }) => {
    const first = await request.get("/status/");
    expect(first.status()).toBe(200);
    const firstTime = await first
      .locator("time")
      .first()
      .getAttribute("datetime");

    // Wait long enough for a one-second timestamp granularity change.
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const second = await request.get("/status/");
    const secondTime = await second
      .locator("time")
      .first()
      .getAttribute("datetime");

    // Prerendered pages would return the identical frozen timestamp.
    expect(secondTime).not.toBe(firstTime);
  });

  test("prerendered pages are frozen at build time (control group)", async ({
    request,
  }) => {
    const first = await request.get("/about/");
    expect(first.status()).toBe(200);
    // A static page is served as a build artifact - this assertion is
    // structural: it must exist as a file in dist/, verified by the
    // build itself. Here we assert it serves identical bytes twice.
    const firstBody = await first.text();
    const second = await request.get("/about/");
    expect(await second.text()).toBe(firstBody);
  });

  test("/status documents its rendering mode in the page", async ({
    request,
  }) => {
    const response = await request.get("/status/");
    const body = await response.text();
    expect(body).toContain("On-demand (dynamic)");
  });
});
