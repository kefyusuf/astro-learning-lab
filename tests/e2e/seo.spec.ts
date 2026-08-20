import { expect, test } from "@playwright/test";

test.describe("SEO surface", () => {
  test("pages expose canonical, Open Graph and description metadata", async ({
    page,
  }) => {
    await page.goto("/articles/");
    await expect(page).toHaveTitle(/Articles · astro-learning-lab/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /.+\/articles\/$/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
  });

  test("article pages declare article metadata and JSON-LD", async ({
    page,
  }) => {
    await page.goto("/articles/islands-mental-model/");
    await expect(
      page.locator('meta[property="og:type"][content="article"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('meta[property="article:published_time"]'),
    ).toHaveCount(1);

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd as string);
    expect(parsed["@type"]).toBe("Article");
    expect(parsed.headline).toContain("Islands");
  });

  test("sitemap index is generated", async ({ request }) => {
    const response = await request.get("/sitemap-index.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<loc>");
  });

  test("RSS feed lists published articles", async ({ request }) => {
    const response = await request.get("/rss.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("xml");
    const body = await response.text();
    expect(body).toContain("<rss");
    expect(body).toContain("Islands: interactivity as an opt-in");
  });

  test("robots.txt references the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Sitemap:");
    expect(body).toContain("sitemap-index.xml");
  });

  test("draft content is absent from the RSS feed", async ({ request }) => {
    const body = await (await request.get("/rss.xml")).text();
    expect(body).not.toContain("zero-js-budget");
  });
});
