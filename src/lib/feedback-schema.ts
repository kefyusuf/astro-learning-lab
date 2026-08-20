import { z } from "astro/zod";

/**
 * Feedback form schema - the single source of truth shared by the
 * action (server-side validation) and, indirectly, the form's HTML
 * constraints. Never trust client input: this schema runs on the
 * server on every submission.
 */
export const feedbackSchema = z.object({
  name: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.string().trim().max(80).optional(),
  ),
  email: z.string().trim().email(),
  topic: z.enum(["general", "bug", "content", "other"]).default("general"),
  message: z.string().trim().min(20).max(2000),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
