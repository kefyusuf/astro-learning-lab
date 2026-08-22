/**
 * Custom content loader for the glossary collection.
 *
 * Demonstrates the loader API beyond glob(): a named loader with its
 * own parsing/validation pipeline. Data lives in a plain JSON file but
 * flows through OUR code - generateId, validation and error reporting
 * are ours, exactly like a loader backed by an API or database would be.
 */
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import fs from "node:fs";
import path from "node:path";

const entrySchema = z.object({
  term: z.string().trim().min(1),
  definition: z.string().trim().min(1),
  seeAlso: z.array(z.string().trim().min(1)).default([]),
});

export type GlossaryTerm = z.infer<typeof entrySchema>;

export interface GlossaryEntry {
  id: string;
  data: {
    term: string;
    definition: string;
    seeAlso: string[];
  };
}

function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Pure transform: raw payload → validated, id-bearing loader entries. */
export function parseGlossaryEntries(payload: unknown): GlossaryEntry[] {
  if (!Array.isArray(payload)) {
    throw new TypeError("glossary payload must be an array of terms");
  }

  const seen = new Set<string>();
  const entries: GlossaryEntry[] = [];

  for (const raw of payload) {
    const parsed = entrySchema.parse(raw);
    const id = slugify(parsed.term);
    if (seen.has(id)) {
      throw new Error(
        `duplicate glossary term (case-insensitive): ${parsed.term}`,
      );
    }
    seen.add(id);
    entries.push({
      id,
      data: {
        term: parsed.term,
        definition: parsed.definition,
        seeAlso: parsed.seeAlso,
      },
    });
  }

  return entries;
}

export function glossaryLoader(
  dataFile = "src/content/glossary/terms.json",
): Loader {
  return {
    name: "glossary",
    async load({ store, logger }) {
      const filePath = path.resolve(dataFile);
      logger.info(`loading glossary from ${filePath}`);

      let payload: unknown;
      try {
        payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        logger.error(
          `glossary file unreadable: ${error instanceof Error ? error.message : error}`,
        );
        store.clear();
        return;
      }

      try {
        const entries = parseGlossaryEntries(payload);
        store.clear();
        for (const entry of entries) {
          store.set({
            id: entry.id,
            data: entry.data,
          });
        }
        logger.info(`loaded ${entries.length} glossary entries`);
      } catch (error) {
        // Invalid data fails the build loudly - same contract as zod
        // schemas on glob-loaded collections.
        throw new Error(
          `glossary invalid: ${error instanceof Error ? error.message : error}`,
        );
      }
    },
  };
}
