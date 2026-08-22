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

// Firefox's first-run axe analysis can exceed the default timeout;
// retrying the whole analysis converges.
async function analyze(page: import("@playwright/test").Page) {
  const builder = new AxeBuilder({ page });
  let results!: Awaited<ReturnType<typeof builder.analyze>>;
  await expect(async () => {
    results = await builder.analyze();
    expect(results.violations).toEqual([]);
  }).toPass({ timeout: 45_000 });
  return results!;
}

for (const path of pages) {
  test(`no axe violations on ${path}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(path);
    await analyze(page);
  });
}

test("article page has no axe violations", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/articles/islands-mental-model/");
  await analyze(page);
});

test("keyboard-only path: skip link is first focusable and works", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit does not include links in the default Tab order (matches Safari's platform behavior, controlled by a user setting) - the skip link itself is still exercised below.",
  );

  await page.goto("/articles/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("skip link activates its target on every engine", async ({ page }) => {
  // Engine-independent core behavior: activating the skip link moves
  // focus to #main (which is tabindex="-1" for exactly this purpose).
  await page.goto("/articles/");
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});
