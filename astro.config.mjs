// @ts-check
import { defineConfig, envField, logHandlers, memoryCache } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// Deployment target selects the adapter (ADR-004):
//   unset / "node"       → Node standalone (local, CI, Docker)
//   "cloudflare"         → Cloudflare Workers + Static Assets
const deployTarget = process.env.DEPLOY_TARGET ?? "node";

// https://astro.build/config
export default defineConfig({
  // The canonical origin of the site. Required for sitemap, RSS and
  // canonical URLs. Overridable via environment (Phase 13).
  site: process.env.SITE_URL ?? "https://astro-learning-lab.example.com",
  integrations: [mdx(), react(), sitemap()],
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
  // next page so ClientRouter swaps are near-instant.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  // Server sessions enabled: /status demonstrates Astro.session with the
  // Node filesystem driver. On Cloudflare the adapter auto-provisions a
  // KV namespace for the same API.
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
