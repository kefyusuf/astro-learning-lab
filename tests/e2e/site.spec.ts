import { expect, test } from "@playwright/test";

test.describe("site smoke", () => {
  test("home page renders hero and featured articles", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Learn Astro by building",
    );
    await expect(page.getByRole("heading", { name: "Featured" })).toBeVisible();
    await expect(page.locator(".grid article").first()).toBeVisible();
  });

  test("unknown routes render the custom 404 page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Page not found",
    );
  });

  test("navigation moves between sections with aria-current feedback", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByText("Guides")
      .click();
    await expect(page).toHaveURL(/\/guides\/$/);
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Guides" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test.describe("articles", () => {
  test("articles index lists published articles with pagination", async ({
    page,
  }) => {
    await page.goto("/articles/");
    await expect(page.getByText("Page 1 of")).toBeVisible();
    await page.getByRole("link", { name: "Next →" }).click();
    await expect(page).toHaveURL(/\/articles\/page\/2\/$/);
    await expect(page.getByText("Page 2 of")).toBeVisible();
  });

  test("article detail pages render content and byline", async ({ page }) => {
    await page.goto("/articles/islands-mental-model/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Islands",
    );
    await expect(page.getByText(/min read/)).toBeVisible();
  });

  test("the static grid works with JavaScript disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/articles/");
    await expect(page.locator(".grid article")).toHaveCount(4);
    await context.close();
  });
});

test.describe("search island", () => {
  // client:idle hydrates after load. A fill() that lands before hydration
  // leaves a DOM value React never adopts (hydration does not sync existing
  // input values into state), and a repeat fill() with the same value can
  // be a no-op. Clear first, then type real keystrokes, and retry the
  // whole interaction until the hydrated component reacts.
  test("filters articles as the user types", async ({ page }) => {
    await page.goto("/articles/");
    const input = page.getByRole("searchbox", { name: "Search articles" });
    await expect(async () => {
      await input.fill("");
      await input.pressSequentially("islands");
      await expect(
        page.locator(".search .results a", { hasText: "Islands" }).first(),
      ).toBeVisible();
    }).toPass({ timeout: 20_000 });
  });

  test("shows an empty state for queries with no matches", async ({ page }) => {
    await page.goto("/articles/");
    const input = page.getByRole("searchbox", { name: "Search articles" });
    await expect(async () => {
      await input.fill("");
      await input.pressSequentially("zzzz-no-match");
      await expect(page.getByText(/No articles match/)).toBeVisible();
    }).toPass({ timeout: 20_000 });
  });
});
