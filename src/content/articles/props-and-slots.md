---
title: "Props and slots: composition without a runtime"
description: "How Astro components receive data through typed props and compose through slots - resolved entirely at render time."
pubDate: 2026-08-12
author: ada-lovelace
topics: [fundamentals]
---

Props arrive on `Astro.props`, and the `interface Props` declaration makes them a compile-time contract. When `astro check` runs, passing a missing or mistyped prop is a type error, not a runtime surprise in the browser.

Slots are the other half of composition. A layout declares `<slot />`; a page injects content into it. Unlike React's children, slot content is resolved during rendering - the parent's markup is generated first and placed, fully formed, into the child. There is no reconciliation and no runtime cost.

Named slots extend the pattern: `<slot name="sidebar" />` receives content marked with `slot="sidebar"`. Most layout needs - headers, footers, sidebars, article bodies - are just slots.

> Duplication over the wrong abstraction: extract a shared component only after the repetition is real.
