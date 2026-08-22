import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The JavaScript budget, enforced against the actual build output.
 * Runs after `pnpm build` (skipped when dist is absent, e.g. during
 * isolated unit runs) so the budget cannot silently drift.
 */

interface HtmlFile {
  route: string;
  html: string;
  size: number;
}

function collectHtmlFiles(dir: string, prefix = ""): HtmlFile[] {
  if (!existsSync(dir)) return [];
  const files: HtmlFile[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const route = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(full, route));
    } else if (entry.name.endsWith(".html")) {
      files.push({
        route,
        html: readFileSync(full, "utf8"),
        size: statSync(full).size,
      });
    }
  }
  return files;
}

function collectJsSize(dir: string): number {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) total += collectJsSize(full);
    else if (entry.name.endsWith(".js")) total += statSync(full).size;
  }
  return total;
}

const distClient = "dist/client";

describe("javascript budget (build output)", () => {
  it.skipIf(!existsSync(distClient))(
    "keeps total shipped JS under 210 KB uncompressed",
    () => {
      const totalJs = collectJsSize(distClient);
      // 188.5 KB (React island) + 15.9 KB (ClientRouter runtime, shared
      // by every page - the accepted cost of client-side navigation,
      // recorded in docs/learning/performance.md).
      expect(
        totalJs,
        `${(totalJs / 1024).toFixed(1)} KB exceeds the 210 KB budget`,
      ).toBeLessThan(210 * 1024);
    },
  );

  it.skipIf(!existsSync(distClient))(
    "ships framework JS only on /articles routes",
    () => {
      const pages = collectHtmlFiles(distClient);
      for (const { route, html } of pages) {
        const hasIsland = html.includes("astro-island");
        if (hasIsland) {
          expect(
            route.startsWith("articles/"),
            `unexpected island on ${route}`,
          ).toBe(true);
        }
      }
    },
  );

  it.skipIf(!existsSync(distClient))(
    "keeps inline scripts small on every page",
    () => {
      const pages = collectHtmlFiles(distClient);
      for (const { route, html } of pages) {
        const isIslandPage = html.includes("astro-island");
        // Island pages carry Astro's hydration scheduler and serialized
        // props (the searchable article list) - a cost that scales with
        // the list and is tracked in docs/learning/islands.md.
        const limit = isIslandPage ? 8 * 1024 : 2.5 * 1024;
        const inlineScripts =
          html.match(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/g) ?? [];
        for (const script of inlineScripts) {
          expect(
            script.length,
            `inline script on ${route} is ${(script.length / 1024).toFixed(1)} KB`,
          ).toBeLessThan(limit);
        }
      }
    },
  );

  it.skipIf(!existsSync(distClient))(
    "keeps every page under 40 KB of HTML including inlined CSS",
    () => {
      const pages = collectHtmlFiles(distClient);
      for (const { route, size } of pages) {
        expect(size, `${route} is ${(size / 1024).toFixed(1)} KB`).toBeLessThan(
          40 * 1024,
        );
      }
    },
  );
});
