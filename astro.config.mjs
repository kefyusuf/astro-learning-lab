// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // The canonical origin of the site. Required later for sitemap,
  // RSS and canonical URLs. Overridable via environment (Phase 13).
  site: process.env.SITE_URL ?? "https://astro-learning-lab.example.com",
  integrations: [mdx()],
});
