import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { isPublished, sortByPubDateDesc } from "../../lib/content";

/**
 * Public JSON feed of published articles.
 * Demonstrates HTTP semantics: status codes, content negotiation
 * basics, query validation (400), and cache headers.
 */
export const prerender = false;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=300",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export const GET: APIRoute = async ({ url }) => {
  const limitParam = url.searchParams.get("limit");

  let limit = 20;
  if (limitParam !== null) {
    limit = Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return jsonResponse(
        {
          error: "invalid_limit",
          message:
            "The 'limit' parameter must be an integer between 1 and 100.",
        },
        400,
      );
    }
  }

  const articles = sortByPubDateDesc(
    await getCollection("articles", isPublished),
  );

  const items = articles.slice(0, limit).map((article) => ({
    id: article.id,
    title: article.data.title,
    description: article.data.description,
    pubDate: article.data.pubDate.toISOString(),
    topics: article.data.topics.map((ref) => ref.id),
    url: `/articles/${article.id}/`,
  }));

  return jsonResponse({ count: items.length, items });
};
