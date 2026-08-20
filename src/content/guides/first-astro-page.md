---
title: "Guide: build your first Astro page"
description: "A step-by-step walkthrough from an empty directory to a rendered, typed, styled page."
pubDate: 2026-08-15
author: ada-lovelace
topics: [fundamentals]
minutes: 15
---

This guide walks through the smallest complete Astro page: frontmatter, template, layout and styles.

## 1. Create the file

A page is any file under `src/pages/`. The file path becomes the route path.

## 2. Write the frontmatter

The fence at the top is server code. Import components, read props, fetch data - it all happens before HTML exists.

## 3. Compose the template

Use components and slots. Everything renders to HTML.

## 4. Verify

Run `pnpm build` and inspect `dist/` - the output is the truth. If you can read your page's HTML and find no `<script>` you did not write, the zero-JS contract holds.
