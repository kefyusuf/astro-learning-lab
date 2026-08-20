import { describe, expect, it } from "vitest";
import { paginate } from "../../src/lib/paginate";

describe("paginate", () => {
  const items = Array.from({ length: 7 }, (_, i) => `item-${i + 1}`);

  it("returns the first page with pageSize items", () => {
    const page = paginate(items, 3, 1);
    expect(page.items).toEqual(["item-1", "item-2", "item-3"]);
    expect(page.pageNumber).toBe(1);
    expect(page.totalPages).toBe(3);
    expect(page.hasPrev).toBe(false);
    expect(page.hasNext).toBe(true);
    expect(page.prevPage).toBeNull();
    expect(page.nextPage).toBe(2);
  });

  it("returns a partial final page", () => {
    const page = paginate(items, 3, 3);
    expect(page.items).toEqual(["item-7"]);
    expect(page.hasNext).toBe(false);
    expect(page.nextPage).toBeNull();
    expect(page.hasPrev).toBe(true);
    expect(page.prevPage).toBe(2);
  });

  it("divides items evenly when possible", () => {
    const page = paginate(["a", "b", "c", "d"], 2, 2);
    expect(page.items).toEqual(["c", "d"]);
    expect(page.totalPages).toBe(2);
    expect(page.hasNext).toBe(false);
  });

  it("returns an empty single page for no items", () => {
    const page = paginate([], 3, 1);
    expect(page.items).toEqual([]);
    expect(page.totalPages).toBe(1);
    expect(page.pageNumber).toBe(1);
  });

  it("throws for a page number below 1", () => {
    expect(() => paginate(items, 3, 0)).toThrow();
  });

  it("throws for a page number beyond the last page", () => {
    expect(() => paginate(items, 3, 4)).toThrow();
  });

  it("throws for a non-positive page size", () => {
    expect(() => paginate(items, 0, 1)).toThrow();
  });
});
