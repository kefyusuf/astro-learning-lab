import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FALLBACK_REPO_STATS,
  fetchRepoStats,
  parseRepoStats,
  type RepoStats,
} from "../../src/lib/stats";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseRepoStats", () => {
  it("extracts star count from a GitHub API payload", () => {
    const stats = parseRepoStats({
      stargazers_count: 52_000,
      open_issues_count: 420,
    });
    expect(stats.stars).toBe(52_000);
    expect(stats.source).toBe("live");
    expect(stats.fetchedAt).toBeTruthy();
  });

  it("treats missing fields as invalid", () => {
    expect(() => parseRepoStats({})).toThrow();
  });

  it("treats non-numeric fields as invalid", () => {
    expect(() => parseRepoStats({ stargazers_count: "many" })).toThrow();
  });

  it("treats non-object payloads as invalid", () => {
    expect(() => parseRepoStats("nope")).toThrow();
    expect(() => parseRepoStats(null)).toThrow();
  });
});

describe("fetchRepoStats", () => {
  it("returns live stats when the API responds ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ stargazers_count: 1234, open_issues_count: 5 }),
      }),
    );

    const stats = await fetchRepoStats();

    expect(stats.source).toBe("live");
    expect(stats.stars).toBe(1234);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("api.github.com"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("falls back to fixture data on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const stats = await fetchRepoStats();

    expect(stats).toEqual(FALLBACK_REPO_STATS);
    warn.mockRestore();
  });

  it("falls back to fixture data when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const stats = await fetchRepoStats();

    expect(stats.source).toBe("fixture");
    warn.mockRestore();
  });
});

describe("FALLBACK_REPO_STATS", () => {
  it("is a valid RepoStats marked as fixture", () => {
    const stats: RepoStats = FALLBACK_REPO_STATS;
    expect(stats.source).toBe("fixture");
    expect(typeof stats.stars).toBe("number");
  });
});
