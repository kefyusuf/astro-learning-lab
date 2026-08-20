// @ts-check
import { defineConfig, memoryCache } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  // The canonical origin of the site. Required later for sitemap,
  // RSS and canonical URLs. Overridable via environment (Phase 13).
  site: process.env.SITE_URL ?? "https://astro-learning-lab.example.com",
  integrations: [mdx(), react()],
  // output stays 'static' by default: every route is prerendered unless
  // it opts out with `export const prerender = false`. The adapter is
  // required to serve those on-demand routes (actions, endpoints).
  adapter: node({ mode: "standalone" }),
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
