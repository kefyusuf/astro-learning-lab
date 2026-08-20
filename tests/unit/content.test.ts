import { describe, expect, it } from "vitest";
import {
  isPublished,
  readingTime,
  sortByPubDateDesc,
} from "../../src/lib/content";

describe("isPublished", () => {
  const entry = (draft: boolean) => ({ data: { draft } });

  it("keeps entries that are not drafts", () => {
    expect(isPublished(entry(false))).toBe(true);
  });

  it("filters out drafts", () => {
    expect(isPublished(entry(true))).toBe(false);
  });
});

describe("sortByPubDateDesc", () => {
  it("sorts newest first without mutating the input", () => {
    const older = { data: { pubDate: new Date("2026-01-01") } };
    const newer = { data: { pubDate: new Date("2026-06-01") } };
    const input = [older, newer];

    const result = sortByPubDateDesc(input);

    expect(result[0]).toBe(newer);
    expect(result[1]).toBe(older);
    expect(input[0]).toBe(older);
  });
});

describe("readingTime", () => {
  it("returns at least one minute", () => {
    expect(readingTime("short")).toBe(1);
  });

  it("rounds words to minutes at 220 wpm", () => {
    const words = Array.from({ length: 440 }, () => "word").join(" ");
    expect(readingTime(words)).toBe(2);
  });

  it("rounds up partial minutes", () => {
    const words = Array.from({ length: 221 }, () => "word").join(" ");
    expect(readingTime(words)).toBe(2);
  });
});
