import { expect, test } from "@playwright/test";

const readVisits = (page: import("@playwright/test").Page) =>
  page.$eval("[data-visits]", (el) => Number(el.textContent?.trim()));

test.describe("sessions (server-side, cookie-based)", () => {
  test("visit counter increments within one browser context", async ({
    page,
  }) => {
    await page.goto("/status/");
    const first = await readVisits(page);
    expect(first).toBeGreaterThanOrEqual(1);

    await page.reload();
    const second = await readVisits(page);
    expect(second).toBe(first + 1);
  });

  test("a fresh context starts its own session", async ({ browser }) => {
    // Existing visitor warms up first.
    const warm = await browser.newContext();
    const warmPage = await warm.newPage();
    await warmPage.goto("/status/");
    await warmPage.goto("/status/");
    const warmCount = await readVisits(warmPage);
    await warm.close();

    // A brand-new context must not inherit the other session's state.
    const fresh = await browser.newContext();
    const freshPage = await fresh.newPage();
    await freshPage.goto("/status/");
    const freshCount = await readVisits(freshPage);
    expect(freshCount).toBeLessThan(warmCount);
    await fresh.close();
  });
});
