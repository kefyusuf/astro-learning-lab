---
title: "Islands: interactivity as an opt-in"
description: "Why Astro ships zero JavaScript unless a component explicitly asks for it with a client directive."
pubDate: 2026-08-16
author: ada-lovelace
topics: [islands]
---

An island is a framework component - React, Svelte, Vue - embedded in an otherwise static page. Without a `client:*` directive, the framework component renders to HTML and its JavaScript is discarded. Add `client:visible` and only that component's JS ships, hydrating only when scrolled into view.

The directive is the entire policy. `client:load` hydrates immediately; `client:idle` waits for the browser to be idle; `client:visible` waits for the viewport. The discipline is to choose the weakest strategy that satisfies the UX - most "interactive" UI is below the fold or tolerates a few milliseconds of delay.

The question to ask before every island: could this be plain HTML with a small script tag? If yes, no island is needed at all - Astro `<script>` tags are bundled and deduplicated for you, with no framework runtime attached.
