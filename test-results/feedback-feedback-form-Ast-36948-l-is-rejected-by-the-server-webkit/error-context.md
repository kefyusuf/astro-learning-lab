# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feedback.spec.ts >> feedback form (Astro Actions) >> an invalid email is rejected by the server
- Location: tests\e2e\feedback.spec.ts:44:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#email-error')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#email-error')
    - waiting for "http://localhost:4321/feedback/?_action=feedback" navigation to finish...
    - navigated to "http://localhost:4321/feedback/?_action=feedback"

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "astro-learning-lab":
    - /url: /
  - navigation "Main":
    - list:
      - listitem:
        - link "Articles":
          - /url: /articles/
      - listitem:
        - link "Guides":
          - /url: /guides/
      - listitem:
        - link "Topics":
          - /url: /topics/
      - listitem:
        - link "Glossary":
          - /url: /glossary/
      - listitem:
        - link "About":
          - /url: /about/
  - navigation "Language":
    - link "TR":
      - /url: /tr/feedback/
- main:
  - heading "Feedback" [level=1]
  - paragraph: Found an error in an article? Want a topic covered? Tell us - the form is validated on the server, never trusted from the client.
  - text: Name (optional)
  - textbox "Name (optional)"
  - text: Email
  - textbox "Email"
  - text: Topic
  - combobox "Topic":
    - option "General" [selected]
    - option "Bug report"
    - option "Content suggestion"
    - option "Other"
  - text: Message
  - textbox "Message":
    - /placeholder: At least 20 characters…
  - button "Send feedback"
- contentinfo:
  - paragraph:
    - text: © 2026 astro-learning-lab - a learning project. Built with
    - link "Astro":
      - /url: https://astro.build
    - text: .
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("feedback form (Astro Actions)", () => {
  4  |   const validFeedback = {
  5  |     name: "Grace Hopper",
  6  |     email: "grace@example.com",
  7  |     message: "The hydration guide finally made client:idle click for me.",
  8  |   };
  9  | 
  10 |   test("a valid submission renders the success banner", async ({ page }) => {
  11 |     await page.goto("/feedback/");
  12 |     await page.getByLabel("Name (optional)").fill(validFeedback.name);
  13 |     await page.getByLabel("Email").fill(validFeedback.email);
  14 |     await page
  15 |       .getByLabel("Message")
  16 |       .fill(
  17 |         "The hydration guide finally made client:idle click for me. Thanks!",
  18 |       );
  19 |     await page.getByRole("button", { name: "Send feedback" }).click();
  20 | 
  21 |     // Default Actions flow: the POST response renders the page with the
  22 |     // action result (no redirect - PRG via session is a documented
  23 |     // upgrade path, not the default).
  24 |     await expect(page.getByRole("status")).toContainText(
  25 |       "Your feedback was received",
  26 |     );
  27 |   });
  28 | 
  29 |   test("an invalid submission re-renders with server-side field errors", async ({
  30 |     page,
  31 |   }) => {
  32 |     await page.goto("/feedback/");
  33 |     await page.getByLabel("Email").fill(validFeedback.email);
  34 |     // Message below the 20-character minimum: client novalidate is set,
  35 |     // so the server-side zod validation must catch this.
  36 |     await page.getByLabel("Message").fill("too short");
  37 |     await page.getByRole("button", { name: "Send feedback" }).click();
  38 | 
  39 |     await expect(
  40 |       page.locator(".banner.error, #message-error").first(),
  41 |     ).toBeVisible();
  42 |   });
  43 | 
  44 |   test("an invalid email is rejected by the server", async ({ page }) => {
  45 |     await page.goto("/feedback/");
  46 |     await page.getByLabel("Email").fill("not-an-email");
  47 |     await page.getByLabel("Message").fill("This message is long enough.");
  48 |     await page.getByRole("button", { name: "Send feedback" }).click();
  49 | 
> 50 |     await expect(page.locator("#email-error")).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  51 |   });
  52 | });
  53 | 
```