// @ts-check
import { defineConfig, envField, logHandlers, memoryCache } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";

// Starlight sidebar groups need explicit items; derive them from the
// docs tree so adding a page never means editing the config.
/**
 * @param {string} directory
 * @returns {{ label: string, link: string }[]}
 */
function docsSidebarItems(directory) {
  const base = `${"src/content/docs"}/${directory}`;
  /** @type {(dir: string) => any[]} */
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return walk(full);
      if (!/\.mdx?$/.test(entry.name)) return [];
      const slug = full.replace("src/content/docs/", "").replace(/\.mdx?$/, "");
      const title =
        readFileSync(full, "utf8").match(/^title:\s*(.+)$/m)?.[1] ?? entry.name;
      return [{ label: title, link: `/${slug}` }];
    });
  return /** @type {{ label: string, link: string }[]} */ (walk(base));
}
import starlight from "@astrojs/starlight";

// Deployment target selects the adapter (ADR-004, ADR-006):
//   unset / "node"       → Node standalone (local, CI, Docker)
//   "cloudflare"         → Cloudflare Workers + Static Assets
// GitHub Pages uses the same static output with no adapter via
// scripts/build-pages.mjs (file-level exclusions + BASE_PATH).
const deployTarget = process.env.DEPLOY_TARGET ?? "node";

// https://astro.build/config
export default defineConfig({
  // The canonical origin of the site. Required for sitemap, RSS and
  // canonical URLs. Overridable via environment (Phase 13). The Pages
  // workflow passes https://kefyusuf.github.io explicitly.
  site: process.env.SITE_URL ?? "https://astro-learning-lab.example.com",
  // Project-page deployments live under "/<repo-name>/" - all internal
  // URLs go through src/lib/base.ts (withBase) at build time.
  base: process.env.BASE_PATH ?? "/",
  integrations: [
    // Documentation hub at /docs (ADR-006): curriculum, architecture and
    // decision records as a browsable, searchable Starlight section.
    // Starlight injects expressive-code, which must precede mdx().
    starlight({
      title: "astro-learning-lab",
      // The docs hub is English-only for now - keeps the Pages mirror
      // free of fallback-locale duplicates.
      // Single-language docs: no locales config = root-mode, no /en
      // prefixes and no language switcher. (An explicit locales object
      // here made Starlight emit locale-prefixed links to routes that
      // were never generated - the source of the 404s.)
      description:
        "Engineering documentation for the astro-learning-lab curriculum.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/kefyusuf/astro-learning-lab",
        },
      ],
      sidebar: [
        {
          label: "Learning Curriculum",
          items: docsSidebarItems("docs/learning"),
        },
        {
          label: "Architecture",
          items: docsSidebarItems("docs/architecture"),
        },
        {
          label: "Decisions (ADR)",
          collapsed: true,
          items: docsSidebarItems("docs/adr"),
        },
        {
          label: "Deployment",
          items: docsSidebarItems("docs/deployment"),
        },
      ],
    }),
    mdx(),
    react(),
    sitemap(),
  ],
  // Typed environment schema: variables are validated at build time and
  // imported type-safely from astro:env. Server secrets never enter the
  // client bundle - enforced by the schema, not by convention.
  env: {
    schema: {
      FEEDBACK_WEBHOOK_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  // Stable in Astro 7: structured JSON logs for machines (CI, log
  // collectors); humans keep the pretty default in local dev.
  logger: process.env.CI ? logHandlers.json() : undefined,
  // output stays 'static' by default: every route is prerendered unless
  // it opts out with `export const prerender = false` (a LITERAL - Astro
  // extracts it with a regex, expressions fall back to the default).
  // The adapter serves those on-demand routes.
  adapter:
    deployTarget === "cloudflare"
      ? cloudflare({
          // 'compile': images on prerendered routes are optimized at
          // BUILD time - workerd needs no image binding at runtime.
          imageService: "compile",
        })
      : node({ mode: "standalone" }),
  // Link prefetching: hover/focus on internal links starts fetching the
  // next page so ClientRouter swaps are near-instant. Adds a ~1 KB
  // script to every page - recorded in the JS budget.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  // Server sessions enabled: /status demonstrates Astro.session with the
  // Node filesystem driver. On Cloudflare the adapter auto-provisions a
  // KV namespace for the same API.
  // session: false,
  // Stable in Astro 7: route-level caching for on-demand routes.
  // /api/articles is cached for 5 minutes, then revalidated in the
  // background (stale-while-revalidate) for up to a minute.
  cache: {
    provider: memoryCache(),
  },
  routeRules: {
    "/api/articles": { maxAge: 300, swr: 60 },
  },
});
