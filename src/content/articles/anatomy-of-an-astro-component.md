---
title: "The anatomy of an .astro component"
description: "Frontmatter runs at build time, the template becomes HTML, and nothing ships to the browser by default."
pubDate: 2026-08-10
author: ada-lovelace
topics: [fundamentals]
featured: true
---

Every `.astro` file has the same shape: an optional frontmatter fence, then a template. The fence is where the interesting contract lives - everything inside it executes while the page is being rendered on the server or at build time, and **none of it is ever sent to the browser**.

This is why an Astro component needs no hydration: there is nothing to wake up. The output is plain HTML. Interactivity is an explicit opt-in, not a default.

The practical consequence: data fetching, filtering, sorting and formatting all belong in the frontmatter. If you find yourself writing a `useEffect` to fetch data that could have been read in the frontmatter, you are paying JavaScript for something the server could have done for free.

## What runs where

| Location               | When it runs          | Reaches the browser?             |
| ---------------------- | --------------------- | -------------------------------- |
| Frontmatter            | Build or request time | No                               |
| Template               | Rendered to HTML      | As HTML only                     |
| `<script>`             | After page load       | Yes - bundled, deduplicated      |
| Island with `client:*` | After hydration       | Yes - framework runtime included |
