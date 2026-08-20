// TEMPORARY demo data for Phase 3 (routing).
// Phase 4 replaces this module with validated Content Collections -
// the migration from "typed arrays in code" to "validated content files"
// is itself part of the curriculum.

export interface Article {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  topicSlugs: string[];
  /** Demo-only HTML body. Phase 4 replaces it with Markdown rendered by Astro. */
  bodyHtml: string;
}

export interface Topic {
  slug: string;
  name: string;
  description: string;
}

export const topics: Topic[] = [
  {
    slug: "fundamentals",
    name: "Fundamentals",
    description: "Components, props, slots, layouts and the .astro file model.",
  },
  {
    slug: "rendering",
    name: "Rendering",
    description:
      "Static generation, on-demand rendering and per-route decisions.",
  },
  {
    slug: "islands",
    name: "Islands",
    description: "Partial hydration, client directives and JS budgets.",
  },
  {
    slug: "content",
    name: "Content",
    description: "Content Collections, schemas and typed Markdown pipelines.",
  },
];

export const articles: Article[] = [
  {
    slug: "anatomy-of-an-astro-component",
    title: "The anatomy of an .astro component",
    description:
      "Frontmatter runs at build time, the template becomes HTML, and nothing ships to the browser by default.",
    pubDate: new Date("2026-08-10"),
    topicSlugs: ["fundamentals"],
    bodyHtml: `
			<p>Every <code>.astro</code> file has the same shape: an optional frontmatter fence, then a template. The fence is where the interesting contract lives - everything inside it executes while the page is being rendered on the server or at build time, and <strong>none of it is ever sent to the browser</strong>.</p>
			<p>This is why an Astro component needs no hydration: there is nothing to wake up. The output is plain HTML with event listeners already resolved to nothing, because there are none. Interactivity is an explicit opt-in, not a default.</p>
			<p>The practical consequence: data fetching, filtering, sorting and formatting all belong in the frontmatter. If you find yourself writing a <code>useEffect</code> to fetch data that could have been read in the frontmatter, you are paying JavaScript for something the server could have done for free.</p>
		`,
  },
  {
    slug: "props-and-slots",
    title: "Props and slots: composition without a runtime",
    description:
      "How Astro components receive data through typed props and compose through slots - resolved entirely at render time.",
    pubDate: new Date("2026-08-12"),
    topicSlugs: ["fundamentals"],
    bodyHtml: `
			<p>Props arrive on <code>Astro.props</code>, and the <code>interface Props</code> declaration makes them a compile-time contract. When <code>astro check</code> runs, passing a missing or mistyped prop is a type error, not a runtime surprise in the browser.</p>
			<p>Slots are the other half of composition. A layout declares <code>&lt;slot /&gt;</code>; a page injects content into it. Unlike React's children, slot content is resolved during rendering - the parent's markup is generated first and placed, fully formed, into the child. There is no reconciliation, no virtual DOM, no runtime cost.</p>
			<p>Named slots extend the pattern: <code>&lt;slot name="sidebar" /&gt;</code> receives content marked with <code>slot="sidebar"</code>. Most layout needs - headers, footers, sidebars, article bodies - are just slots.</p>
		`,
  },
  {
    slug: "rendering-is-per-route",
    title: "Rendering is a per-route decision",
    description:
      "Static and server rendering are not mutually exclusive. In Astro every route chooses independently.",
    pubDate: new Date("2026-08-14"),
    topicSlugs: ["rendering"],
    bodyHtml: `
			<p>Astro's <code>output</code> setting sets the default: <code>'static'</code> prerenders everything at build time, <code>'server'</code> renders on demand. But the interesting part is the per-route override: <code>export const prerender = false</code> turns one route dynamic inside an otherwise static site, and <code>export const prerender = true</code> does the reverse.</p>
			<p>This granularity is the answer to a question most frameworks answer bluntly. Your marketing pages, articles and docs do not need a server - prerender them. Your status page, your API, your personalized fragment - render those per request. Same project, same deploy.</p>
			<p>The decision rule is simple: if the response depends on the request (user, time, headers), it must be dynamic. If it does not, dynamic rendering is wasted work on every request.</p>
		`,
  },
  {
    slug: "islands-mental-model",
    title: "Islands: interactivity as an opt-in",
    description:
      "Why Astro ships zero JavaScript unless a component explicitly asks for it with a client directive.",
    pubDate: new Date("2026-08-16"),
    topicSlugs: ["islands"],
    bodyHtml: `
			<p>An island is a framework component - React, Svelte, Vue - embedded in an otherwise static page. Without a <code>client:*</code> directive, the framework component renders to HTML and its JavaScript is discarded. Add <code>client:visible</code> and only that component's JS ships, hydrating only when scrolled into view.</p>
			<p>The directive is the entire policy. <code>client:load</code> hydrates immediately; <code>client:idle</code> waits for the browser to be idle; <code>client:visible</code> waits for the viewport. The discipline is to choose the weakest strategy that satisfies the UX - most "interactive" UI is below the fold or tolerates a few milliseconds of delay.</p>
			<p>The question to ask before every island: could this be plain HTML with a small script tag? If yes, no island is needed at all - Astro <code>&lt;script&gt;</code> tags are bundled and deduplicated for you, with no framework runtime attached.</p>
		`,
  },
  {
    slug: "why-content-collections",
    title: "Why Content Collections beat loose Markdown files",
    description:
      "Schemas, type inference and query APIs turn a directory of Markdown into a validated, typed data source.",
    pubDate: new Date("2026-08-18"),
    topicSlugs: ["content"],
    bodyHtml: `
			<p>Treating Markdown as random files works until a frontmatter typo ships a broken page. Content Collections solve this by validating every entry against a zod schema at build time: a missing <code>pubDate</code> or an invalid date string fails the build, not the reader.</p>
			<p>The schema also drives TypeScript. <code>getCollection('articles')</code> returns entries whose <code>data</code> is fully typed - autocomplete and exhaustiveness checks for free, derived from the schema you already wrote.</p>
			<p>Collections also normalize querying: filtering by publication state, sorting by date and resolving references between entries are library calls, not ad-hoc filesystem walking duplicated across pages.</p>
		`,
  },
  {
    slug: "build-time-vs-request-time",
    title: "Build time, request time, browser time",
    description:
      "Every line of an Astro project runs in one of three places. Knowing which one changes how you design features.",
    pubDate: new Date("2026-08-20"),
    topicSlugs: ["rendering", "fundamentals"],
    bodyHtml: `
			<p>Build time is when static routes are generated. Request time is when a server route renders for one visitor. Browser time is after HTML arrives - and in Astro, browser time is empty unless an island or script exists.</p>
			<p>Most bugs in other stacks come from confusing these: fetching at browser time what could be resolved at build time, or caching per-user content that was rendered globally. Astro makes the boundaries physical - frontmatter is build/request, template is output, scripts and islands are browser.</p>
			<p>When designing a feature, the first question is not "which component" but "when does this run". The answer determines cost: build time is paid once, request time per visitor, browser time per page view.</p>
		`,
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByTopic(topicSlug: string): Article[] {
  return articles
    .filter((article) => article.topicSlugs.includes(topicSlug))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export function getSortedArticles(): Article[] {
  return [...articles].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );
}
