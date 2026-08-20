import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { securityHeaders } from "../../src/lib/security-headers";
import { formatRequestLog } from "../../src/lib/logger";

describe("securityHeaders", () => {
  it("sets clickjacking protection", () => {
    const headers = securityHeaders();
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
  });

  it("disables MIME sniffing", () => {
    expect(securityHeaders()["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("limits referrer leakage", () => {
    expect(securityHeaders()["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("allows same-origin scripts and inline styles only", () => {
    const csp = securityHeaders()["Content-Security-Policy"];
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("default-src 'self'");
  });
});

describe("public/_headers (hosting layer)", () => {
  it("stays consistent with securityHeaders()", () => {
    const file = readFileSync("public/_headers", "utf8");
    const expected = securityHeaders();
    for (const [name, value] of Object.entries(expected)) {
      expect(file).toContain(`${name}: ${value}`);
    }
  });
});

describe("formatRequestLog", () => {
  const base = {
    requestId: "abc-123",
    method: "GET",
    path: "/articles/",
    status: 200,
    durationMs: 12,
  };

  it("emits a single-line JSON string with structured fields", () => {
    const line = formatRequestLog(base);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed).toMatchObject({
      level: "info",
      event: "request_completed",
      requestId: "abc-123",
      method: "GET",
      path: "/articles/",
      status: 200,
      durationMs: 12,
    });
  });

  it("marks 5xx responses as error level", () => {
    const parsed = JSON.parse(
      formatRequestLog({ ...base, status: 500 }),
    ) as Record<string, unknown>;
    expect(parsed.level).toBe("error");
  });

  it("marks 4xx responses as warn level", () => {
    const parsed = JSON.parse(
      formatRequestLog({ ...base, status: 404 }),
    ) as Record<string, unknown>;
    expect(parsed.level).toBe("warn");
  });
});
