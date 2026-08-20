/**
 * Pure helpers over content entries. They accept plain entry-shaped
 * objects so they are unit-testable without the Astro runtime.
 * Pages combine these with getCollection() from 'astro:content'.
 */

interface EntryLike {
  data: {
    draft?: boolean;
    pubDate?: Date;
  };
}

export function isPublished<T extends EntryLike>(entry: T): boolean {
  return !entry.data.draft;
}

export function sortByPubDateDesc<T extends { data: { pubDate: Date } }>(
  entries: readonly T[],
): T[] {
  return [...entries].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

const WORDS_PER_MINUTE = 220;

/** Page size for the paginated articles index. Shared by both route scopes. */
export const ARTICLES_PAGE_SIZE = 4;

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
