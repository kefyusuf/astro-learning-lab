---
title: "Rendering is a per-route decision"
description: "Static and server rendering are not mutually exclusive. In Astro every route chooses independently."
pubDate: 2026-08-14
author: grace-hopper
topics: [rendering]
featured: true
cover: ../../assets/articles/rendering-per-route.jpg
coverAlt: "Abstract cyan and violet gradient cover with the article title"
---

Astro's `output` setting sets the default: `'static'` prerenders everything at build time, `'server'` renders on demand. But the interesting part is the per-route override: `export const prerender = false` turns one route dynamic inside an otherwise static site, and `export const prerender = true` does the reverse.

This granularity is the answer to a question most frameworks answer bluntly. Your marketing pages, articles and docs do not need a server - prerender them. Your status page, your API, your personalized fragment - render those per request. Same project, same deploy.

## The decision rule

If the response depends on the request (user, time, headers), it must be dynamic. If it does not, dynamic rendering is wasted work on every request.
