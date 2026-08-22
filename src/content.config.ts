import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Content Collections turn a directory of files into a validated, typed
 * data source. Every entry's frontmatter is checked against its schema at
 * build time - an invalid date or a missing title fails the build, not a
 * reader. Types for `data` are inferred from the schema.
 */

const pubMetadata = {
  title: z.string().max(120),
  description: z.string().max(200),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  author: reference("authors"),
  topics: z.array(reference("topics")).default([]),
};

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  // The image helper arrives via the schema function: frontmatter paths
  // relative to the entry file become typed ImageMetadata.
  schema: ({ image }) =>
    z.object({
      ...pubMetadata,
      featured: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().default("Article cover illustration"),
    }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
  schema: z.object({
    ...pubMetadata,
    /** Estimated completion time in minutes. */
    minutes: z.number().int().positive(),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/authors" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/topics" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    order: z.number().int().default(0),
  }),
});

export const collections = { articles, guides, authors, topics };
