import { expect, test } from "@playwright/test";

test.describe("docs hub (Starlight)", () => {
  test("the docs index renders the Starlight shell with sidebar", async ({
    page,
  }) => {
    await page.goto("/docs/");
    await expect(page.locator("starlight-menu-button, .sidebar")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Learning Roadmap" }).first(),
    ).toBeVisible();
  });

  test("moved curriculum pages render inside the docs shell", async ({
    page,
  }) => {
    await page.goto("/docs/architecture/overview/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Architecture Overview",
    );
  });

  test("ADR group exposes decision records", async ({ page }) => {
    await page.goto("/docs/adr/005-github-pages-static-mirror/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "GitHub Pages static mirror",
    );
  });
});
