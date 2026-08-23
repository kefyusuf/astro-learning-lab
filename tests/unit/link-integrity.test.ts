import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Link integrity: every internal href/content URL emitted in the built
 * HTML must resolve to a real file. Runs against dist/client after
 * `pnpm build` (skipped when absent) so a broken link can never reach
 * production silently - including links inside Starlight content.
 */

interface HtmlFile {
  route: string;
  html: string;
}

function collectHtml(
  dir: string,
  prefix = "",
  out: HtmlFile[] = [],
): HtmlFile[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const route = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) collectHtml(full, route, out);
    else if (entry.name.endsWith(".html")) {
      out.push({ route, html: readFileSync(full, "utf8") });
    }
  }
  return out;
}

function pageExists(dir: string, urlPath: string): boolean {
  const clean = urlPath.replace(/\/$/, "") || "/";
  return (
    existsSync(join(dir, clean, "index.html")) ||
    existsSync(join(dir, `${clean}.html`))
  );
}

const SKIP_PREFIX = ["/_"]; // server islands, vite internals
const SKIP_EXT =
  /\.(js|css|webp|png|jpg|jpeg|ico|svg|xml|txt|json|md|woff2?)(\?|$)/i;

const distClient = "dist/client";

describe("link integrity (build output)", () => {
  it.skipIf(!existsSync(distClient))(
    "resolves every internal link on every page",
    () => {
      const pages = collectHtml(distClient);
      expect(pages.length).toBeGreaterThan(0);

      const broken: string[] = [];
      for (const { route, html } of pages) {
        const urls = [
          ...html.matchAll(/(?:href|content)="(\/[^"#][^"]*)"/g),
        ].map((m) => m[1].split("?")[0]);

        for (const url of urls) {
          if (SKIP_PREFIX.some((p) => url.startsWith(p))) continue;
          if (SKIP_EXT.test(url)) continue;
          if (!pageExists(distClient, url)) {
            broken.push(`${url} (linked from ${route})`);
          }
        }
      }

      expect(broken, `broken links:\n${broken.join("\n")}`).toEqual([]);
    },
  );

  it.skipIf(!existsSync(distClient))(
    "emits no typographic dashes anywhere",
    () => {
      const pages = collectHtml(distClient);
      for (const { route, html } of pages) {
        expect(html.includes("\u2014"), `em-dash on ${route}`).toBe(false);
      }
    },
  );
});
