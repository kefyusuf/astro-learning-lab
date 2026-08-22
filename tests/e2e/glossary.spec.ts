import { expect, test } from "@playwright/test";

test.describe("glossary (custom content loader)", () => {
  test("lists every term alphabetically", async ({ page }) => {
    await page.goto("/glossary/");
    const terms = page.locator(".terms dt");
    expect(await terms.count()).toBeGreaterThanOrEqual(7);

    // Alphabetical order: Island < Partial Hydration < Prerender
    const firstThree = await terms.allTextContents();
    expect(firstThree.slice(0, 3)).toEqual([
      "Island",
      "Partial Hydration",
      "Prerender",
    ]);
  });

  test("see-also links resolve to sibling term anchors", async ({ page }) => {
    await page.goto("/glossary/");
    const islandSeeAlso = page
      .locator(".term", { has: page.locator("dt", { hasText: "Island" }) })
      .getByRole("link", { name: "Partial Hydration" });
    await islandSeeAlso.click();
    await expect(page.locator("#partial-hydration")).toBeVisible();
  });
});
