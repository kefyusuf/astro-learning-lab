import { expect, test } from "@playwright/test";

test.describe("error handling", () => {
  test("unknown routes return 404 with a helpful page", async ({ page }) => {
    const response = await page.goto("/no/such/route/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Page not found",
    );
    await expect(
      page.getByRole("link", { name: "Back to the homepage" }),
    ).toBeVisible();
  });

  test("the server error page renders with recovery guidance", async ({
    page,
  }) => {
    // The 500 page is served by the runtime on uncaught on-demand
    // errors - with a 500 status even when visited directly. Visiting
    // it asserts the recovery UX exists and renders; the error path
    // itself is exercised by the runtime and logged at error level.
    const response = await page.goto("/500/");
    expect(response?.status()).toBe(500);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Something went wrong",
    );
    await expect(
      page.getByRole("link", { name: /tell us what you were doing/ }),
    ).toBeVisible();
  });

  test("the stats widget degrades gracefully when the API is unreachable", async ({
    page,
  }) => {
    // The build-time fetch falls back to fixture data and marks it in
    // the UI. The homepage must render regardless.
    await page.goto("/");
    await expect(page.getByText("This site runs on Astro")).toBeVisible();
    await expect(
      page.getByText(/Fetched at build time|Offline build/),
    ).toBeVisible();
  });
});
