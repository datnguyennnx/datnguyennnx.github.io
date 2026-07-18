import { z } from "zod";

// Helpers

/** Regex: kebab-case — lowercase letter, then lowercase alphanumeric or hyphens. */
const KEBAB_REGEX = /^[a-z][a-z0-9-]*$/;

/** Regex: 8-character alphanumeric (nanoid-style id). */
const ID_REGEX = /^[a-zA-Z0-9_]+$/;

// Schema

export const NoteFrontmatterSchema = z
  .object({
    /** 8-char alphanumeric global unique identifier — immutable once created */
    id: z.string().length(8).regex(ID_REGEX, "id must be 8 alphanumeric characters"),

    /** Non-empty title */
    title: z.string().min(1, "title must not be empty"),

    /** Optional short description / summary for display in list view */
    description: z.string().optional().default(""),

    /** Folder-level-1 (kebab-case) */
    category: z.string(),

    /** Folder-level-2 (kebab-case) */
    slug: z.string(),

    /** ISO 8601 datetime with timezone offset */
    date: z.string().datetime({ offset: true }),

    /** Optional ISO 8601 datetime with timezone offset */
    updated: z.string().datetime({ offset: true }).optional(),

    /** Optional tag list */
    tags: z.array(z.string()).optional().default([]),

    /** IDs of related notes (not paths) */
    links: z.array(z.string()).optional().default([]),
  })
  .refine((data) => KEBAB_REGEX.test(data.category), {
    message: "category must be kebab-case (lowercase letter + lowercase alphanumeric or hyphens)",
    path: ["category"],
  })
  .refine((data) => KEBAB_REGEX.test(data.slug), {
    message: "slug must be kebab-case (lowercase letter + lowercase alphanumeric or hyphens)",
    path: ["slug"],
  })
  .refine((data) => data.links.every((link) => link.length === 8 && ID_REGEX.test(link)), {
    message: "each entry in links must be an 8-character alphanumeric id",
    path: ["links"],
  });
