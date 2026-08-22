import { describe, expect, it } from "vitest";
import { parseGlossaryEntries } from "../../src/loaders/glossary";

describe("parseGlossaryEntries", () => {
  const valid = [
    {
      term: "Island",
      definition: "An interactive component hydrated independently.",
      seeAlso: ["Partial Hydration"],
    },
    {
      term: "Prerender",
      definition: "Rendering to HTML at build time.",
    },
  ];

  it("converts raw terms into typed loader entries", () => {
    const entries = parseGlossaryEntries(valid);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: "island",
      data: { term: "Island", seeAlso: ["Partial Hydration"] },
    });
  });

  it("generates slugged ids from the term", () => {
    const entries = parseGlossaryEntries([
      { term: "Content Collections", definition: "Typed content." },
    ]);
    expect(entries[0].id).toBe("content-collections");
  });

  it("defaults seeAlso to an empty array", () => {
    const entries = parseGlossaryEntries([valid[1]]);
    expect(entries[0].data.seeAlso).toEqual([]);
  });

  it("rejects duplicate terms regardless of case", () => {
    expect(() =>
      parseGlossaryEntries([
        { term: "Island", definition: "a" },
        { term: "island", definition: "b" },
      ]),
    ).toThrow(/duplicate/i);
  });

  it("rejects entries missing a definition", () => {
    expect(() => parseGlossaryEntries([{ term: "Island" }])).toThrow();
  });

  it("rejects non-array payloads", () => {
    expect(() => parseGlossaryEntries({})).toThrow();
    expect(() => parseGlossaryEntries(null)).toThrow();
  });
});
