/**
 * UI string dictionary for the i18n slice.
 * Article/guide CONTENT stays English; chrome strings localize.
 */
export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];

export const ui = {
  en: {
    nav: {
      articles: "Articles",
      guides: "Guides",
      topics: "Topics",
      glossary: "Glossary",
      about: "About",
    },
    brandSuffix: "-learning-lab",
    heroTitle: "Learn Astro by building a real content platform",
    heroDesc:
      "This site is the living output of a phase-based Astro curriculum. Every feature exists to exercise one Astro concept - rendering, islands, content collections, server logic - and nothing more.",
    browse: "Browse articles",
    latest: "Latest articles",
    featured: "Featured",
    topicsHeading: "Topics",
    statsHeading: "This site runs on Astro",
  },
  tr: {
    nav: {
      articles: "Makaleler",
      guides: "Rehberler",
      topics: "Konular",
      glossary: "Sözlük",
      about: "Hakkında",
    },
    brandSuffix: "-learning-lab",
    heroTitle: "Gerçek bir içerik platformu kurarak Astro öğrenin",
    heroDesc:
      "Bu site, faz tabanlı Astro müfredatının yaşayan çıktısıdır. Her özellik tek bir Astro kavramını - rendering, islands, content collections, sunucu mantığı - deneyimlemek için vardır.",
    browse: "Makalelere göz at",
    latest: "Son makaleler",
    featured: "Öne çıkanlar",
    topicsHeading: "Konular",
    statsHeading: "Bu site Astro ile çalışır",
  },
} as const;

type DeepStringify<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};
export type UiStrings = DeepStringify<(typeof ui)["en"]>;

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith("/tr") ? "tr" : "en";
}

export function uiFor(locale: Locale): UiStrings {
  return ui[locale];
}
