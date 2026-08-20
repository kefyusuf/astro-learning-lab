import { useState } from "react";
import type { JSX } from "react";

/**
 * ISLAND REGISTRY ENTRY - ArticleSearch
 *
 * Why does this require JavaScript?
 *   Live, keystroke-level filtering of a list requires holding input
 *   state and re-rendering on every change. Plain HTML cannot do this
 *   without a full page reload per keystroke.
 *
 * Why can't this remain Astro-only?
 *   An Astro component renders once. There is no client runtime to
 *   observe input events and recompute the list.
 *
 * When should it hydrate?
 *   client:idle - the input is near the top of /articles, but the user
 *   still needs time to focus and type. Hydrating during idle time is
 *   imperceptible and cheaper than client:load.
 *
 * How much JavaScript does it add?
 *   Measured in CI and recorded in docs/learning/islands.md.
 */

export interface SearchableArticle {
  id: string;
  title: string;
  description: string;
  topics: string[];
}

function matches(article: SearchableArticle, query: string): boolean {
  const haystack = `${article.title} ${article.description} ${article.topics.join(" ")}`;
  return haystack.toLowerCase().includes(query);
}

export default function ArticleSearch({
  articles,
}: {
  articles: SearchableArticle[];
}): JSX.Element {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? articles.filter((article) => matches(article, trimmed))
    : [];

  return (
    <div className="search">
      <label className="search-label" htmlFor="article-search">
        Search articles
      </label>
      <input
        id="article-search"
        type="search"
        placeholder="Try “islands” or “rendering”…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {trimmed ? (
        results.length > 0 ? (
          <ul className="results" aria-live="polite">
            {results.map((article) => (
              <li key={article.id}>
                <a href={`/articles/${article.id}/`}>
                  <span className="title">{article.title}</span>
                  <span className="description">{article.description}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty" aria-live="polite">
            No articles match “{trimmed}”.
          </p>
        )
      ) : (
        <p className="hint">
          {articles.length} articles searchable - the full list follows below.
        </p>
      )}
    </div>
  );
}
