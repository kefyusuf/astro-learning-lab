---
title: "Build time, request time, browser time"
description: "Every line of an Astro project runs in one of three places. Knowing which one changes how you design features."
pubDate: 2026-08-20
updatedDate: 2026-08-21
author: grace-hopper
topics: [rendering, fundamentals]
---

Build time is when static routes are generated. Request time is when a server route renders for one visitor. Browser time is after HTML arrives - and in Astro, browser time is empty unless an island or script exists.

Most bugs in other stacks come from confusing these: fetching at browser time what could be resolved at build time, or caching per-user content that was rendered globally. Astro makes the boundaries physical - frontmatter is build/request, template is output, scripts and islands are browser.

When designing a feature, the first question is not "which component" but "when does this run". The answer determines cost: build time is paid once, request time per visitor, browser time per page view.
