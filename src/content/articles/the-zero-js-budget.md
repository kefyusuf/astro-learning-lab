---
title: "The zero-JS budget"
description: "A practical policy for keeping pages JavaScript-free: what is allowed, what must justify itself and how to measure it."
pubDate: 2026-08-21
author: edsger-dijkstra
topics: [islands, fundamentals]
draft: true
---

This draft exists to prove that drafts are filtered out of builds and listings.

A JavaScript budget is a policy, not a vibe. On this project the policy is: pages without interaction ship no client JavaScript; interactive components must state their hydration strategy and bundle cost in review.

Measuring is part of the definition - inspect the built HTML, count `<script>` tags, and record what each one is for.
