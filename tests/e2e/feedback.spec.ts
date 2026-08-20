import { expect, test } from "@playwright/test";

test.describe("feedback form (Astro Actions)", () => {
  const validFeedback = {
    name: "Grace Hopper",
    email: "grace@example.com",
    message: "The hydration guide finally made client:idle click for me.",
  };

  test("a valid submission renders the success banner", async ({ page }) => {
    await page.goto("/feedback/");
    await page.getByLabel("Name (optional)").fill(validFeedback.name);
    await page.getByLabel("Email").fill(validFeedback.email);
    await page
      .getByLabel("Message")
      .fill(
        "The hydration guide finally made client:idle click for me. Thanks!",
      );
    await page.getByRole("button", { name: "Send feedback" }).click();

    // Default Actions flow: the POST response renders the page with the
    // action result (no redirect - PRG via session is a documented
    // upgrade path, not the default).
    await expect(page.getByRole("status")).toContainText(
      "Your feedback was received",
    );
  });

  test("an invalid submission re-renders with server-side field errors", async ({
    page,
  }) => {
    await page.goto("/feedback/");
    await page.getByLabel("Email").fill(validFeedback.email);
    // Message below the 20-character minimum: client novalidate is set,
    // so the server-side zod validation must catch this.
    await page.getByLabel("Message").fill("too short");
    await page.getByRole("button", { name: "Send feedback" }).click();

    await expect(
      page.locator(".banner.error, #message-error").first(),
    ).toBeVisible();
  });

  test("an invalid email is rejected by the server", async ({ page }) => {
    await page.goto("/feedback/");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Message").fill("This message is long enough.");
    await page.getByRole("button", { name: "Send feedback" }).click();

    await expect(page.locator("#email-error")).toBeVisible();
  });
});
