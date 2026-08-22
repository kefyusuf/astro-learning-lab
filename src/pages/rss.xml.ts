import rss from "@astrojs/rss";
import type { APIContext, APIRoute } from "astro";
import { getCollection } from "astro:content";
import { withBase } from "../lib/base";
import { isPublished, sortByPubDateDesc } from "../lib/content";

export const prerender = true;

export const GET: APIRoute = async (context: APIContext) => {
  const articles = sortByPubDateDesc(
    await getCollection("articles", isPublished),
  );

  return rss({
    title: "astro-learning-lab",
    description:
      "Articles and guides from a phase-based Astro learning curriculum.",
    site: context.site ?? new URL("https://astro-learning-lab.example.com"),
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.pubDate,
      link: withBase(`/articles/${article.id}/`),
    })),
    customData: "<language>en-us</language>",
  });
};
