import { expect, test } from "@playwright/test";

test.describe("API endpoints", () => {
  test("GET /api/health returns 200 with ok status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("unsupported methods get proper HTTP semantics", async ({ request }) => {
    // Explicit 405 with an Allow header - proper HTTP semantics.
    const response = await request.post("/api/health", { data: {} });
    expect(response.status()).toBe(405);
    expect(response.headers()["allow"]).toBe("GET");
    expect((await response.json()).error).toBe("method_not_allowed");
  });

  test("GET /api/articles returns published articles with a stable shape", async ({
    request,
  }) => {
    const response = await request.get("/api/articles");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("max-age=300");

    const body = await response.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.count).toBe(body.items.length);
    for (const item of body.items) {
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          pubDate: expect.any(String),
          topics: expect.any(Array),
          url: expect.stringMatching(/^\/articles\/.+\/$/),
        }),
      );
    }
  });

  test("GET /api/articles respects the limit parameter", async ({
    request,
  }) => {
    const response = await request.get("/api/articles?limit=2");
    const body = await response.json();
    expect(body.count).toBe(2);
    expect(body.items).toHaveLength(2);
  });

  test("an invalid limit is rejected with 400 and a JSON error", async ({
    request,
  }) => {
    const response = await request.get("/api/articles?limit=9999");
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("invalid_limit");
    expect(body.message).toContain("between 1 and 100");
  });
});
