/**
 * Build-time data fetching for repository statistics.
 *
 * This module demonstrates the three data-fetching moments in Astro:
 * - build time (here): paid once per build; data is stale until rebuild
 * - request time: paid per visitor; needs a dynamic route + adapter
 * - client time: paid per page view; ships JS, hurts SEO, last resort
 *
 * Failure policy: a failing external API must never fail the build.
 * We degrade to a fixture and mark the data source so the UI can be
 * honest about staleness.
 */

export interface RepoStats {
  stars: number;
  openIssues: number;
  /** Where this data came from: the live API or the committed fixture. */
  source: "live" | "fixture";
  /** ISO timestamp of when the data was fetched. */
  fetchedAt: string;
}

const GITHUB_REPO_API = "https://api.github.com/repos/withastro/astro";
const FETCH_TIMEOUT_MS = 5_000;

export function parseRepoStats(payload: unknown): RepoStats {
  if (typeof payload !== "object" || payload === null) {
    throw new TypeError("repo payload must be an object");
  }
  const { stargazers_count, open_issues_count } = payload as Record<
    string,
    unknown
  >;
  if (
    typeof stargazers_count !== "number" ||
    !Number.isFinite(stargazers_count)
  ) {
    throw new TypeError("stargazers_count must be a number");
  }
  if (
    typeof open_issues_count !== "number" ||
    !Number.isFinite(open_issues_count)
  ) {
    throw new TypeError("open_issues_count must be a number");
  }
  return {
    stars: stargazers_count,
    openIssues: open_issues_count,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Committed fixture used when the live API is unreachable (offline CI,
 * rate limits, outages). Values are plausible, not exact - the UI marks
 * fixture-sourced numbers so staleness is visible.
 */
export const FALLBACK_REPO_STATS: RepoStats = {
  stars: 52_000,
  openIssues: 420,
  source: "fixture",
  fetchedAt: "2026-08-21T00:00:00.000Z",
};

export async function fetchRepoStats(): Promise<RepoStats> {
  try {
    const response = await fetch(GITHUB_REPO_API, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`GitHub API responded ${response.status}`);
    }
    return parseRepoStats(await response.json());
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[stats] live fetch failed (${reason}); using fixture data`);
    return FALLBACK_REPO_STATS;
  }
}
