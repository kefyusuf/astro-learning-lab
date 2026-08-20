---
title: "Why Content Collections beat loose Markdown files"
description: "Schemas, type inference and query APIs turn a directory of Markdown into a validated, typed data source."
pubDate: 2026-08-18
author: edsger-dijkstra
topics: [content]
featured: true
---

Treating Markdown as random files works until a frontmatter typo ships a broken page. Content Collections solve this by validating every entry against a zod schema at build time: a missing `pubDate` or an invalid date string fails the build, not the reader.

The schema also drives TypeScript. `getCollection('articles')` returns entries whose `data` is fully typed - autocomplete and exhaustiveness checks for free, derived from the schema you already wrote.

Collections also normalize querying: filtering by publication state, sorting by date and resolving references between entries are library calls, not ad-hoc filesystem walking duplicated across pages.

## References are ids, not objects

`reference('authors')` stores the author's collection id. Resolve it explicitly with `getEntry(entry.data.author)` when you need the target - an explicit step that keeps the data layer honest about what is stored versus what is joined.
