import { expect, test } from "@playwright/test";

test.describe("middleware", () => {
  test("every response carries a request id", async ({ request }) => {
    const response = await request.get("/status/");
    const requestId = response.headers()["x-request-id"];
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  test("each request gets its own request id", async ({ request }) => {
    const first = (await request.get("/status/")).headers()["x-request-id"];
    const second = (await request.get("/status/")).headers()["x-request-id"];
    expect(first).not.toBe(second);
  });

  test("security headers are applied to on-demand responses", async ({
    request,
  }) => {
    // Middleware only executes for on-demand routes. Prerendered pages
    // are served as static bytes and get their headers from the
    // hosting layer (public/_headers) - asserted by a unit test that
    // keeps the two policies in sync.
    const response = await request.get("/status/");
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
  });
});
