import { expect, test } from "@playwright/test";

test.describe("i18n routing (tr locale slice)", () => {
  test("the tr home page renders Turkish chrome", async ({ page }) => {
    await page.goto("/tr/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Astro öğrenin",
    );
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Makaleler" }),
    ).toBeVisible();
  });

  test("the language switcher round-trips between locales", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "TR" })
      .click();
    await expect(page).toHaveURL(/\/tr\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Astro öğrenin",
    );

    await page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "EN" })
      .click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test("hreflang alternates are declared on the en home page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator('link[rel="alternate"][hreflang="tr"]'),
    ).toHaveAttribute("href", /.+\/tr\/$/);
  });
});
