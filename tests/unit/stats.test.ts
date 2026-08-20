import { describe, expect, it } from "vitest";
import {
  FALLBACK_REPO_STATS,
  parseRepoStats,
  type RepoStats,
} from "../../src/lib/stats";

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

describe("FALLBACK_REPO_STATS", () => {
  it("is a valid RepoStats marked as fixture", () => {
    const stats: RepoStats = FALLBACK_REPO_STATS;
    expect(stats.source).toBe("fixture");
    expect(typeof stats.stars).toBe("number");
  });
});
