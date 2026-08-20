import { expect, test, type Locator, type Page } from "@playwright/test";

test.describe("favorites (vanilla script + localStorage)", () => {
  const articlePath = "/articles/islands-mental-model/";
  const articleTitle = "Islands: interactivity as an opt-in";
  // The accessible name is the static aria-label; the pressed state is
  // conveyed by aria-pressed, which is the correct ARIA pattern.
  const favButton = (scope: Page | Locator) =>
    scope.getByRole("button", { name: `Save "${articleTitle}" to favorites` });

  test("toggling updates pressed state without changing the label", async ({
    page,
  }) => {
    await page.goto(articlePath);
    const button = favButton(page);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("favorite state persists across reload and across pages", async ({
    page,
  }) => {
    await page.goto(articlePath);
    const button = favButton(page);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");

    // Reload: state must come back from localStorage.
    await page.reload();
    await expect(button).toHaveAttribute("aria-pressed", "true");

    // Another page: the same article's card button reflects storage.
    await page.goto("/articles/");
    await expect(
      favButton(page.locator("article", { hasText: articleTitle })),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("toggling on the card works independently of the search island", async ({
    page,
  }) => {
    // The card grid is static HTML + vanilla script; the island above it
    // must not interfere with it.
    await page.goto("/articles/");
    const otherTitle = "Build time, request time, browser time";
    const button = page
      .locator("article", { hasText: otherTitle })
      .getByRole("button", { name: `Save "${otherTitle}" to favorites` });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
