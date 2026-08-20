import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated WCAG baseline: axe-core catches the mechanically
 * detectable violation classes (contrast, labels, landmark structure,
 * aria usage). Manual review still covers the rest (keyboard flows,
 * focus order semantics, screen reader UX).
 */
const pages = [
  "/",
  "/articles/",
  "/guides/",
  "/topics/",
  "/about/",
  "/feedback/",
];

for (const path of pages) {
  test(`no axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("article page has no axe violations", async ({ page }) => {
  await page.goto("/articles/islands-mental-model/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("keyboard-only path: skip link is first focusable and works", async ({
  page,
}) => {
  await page.goto("/articles/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});
