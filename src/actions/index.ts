import { defineAction } from "astro:actions";
import { feedbackSchema } from "../lib/feedback-schema";

/**
 * Server-only configuration. Variables without the PUBLIC_ prefix are
 * never bundled for the browser - this URL would leak if it were.
 */
const FEEDBACK_WEBHOOK_URL = import.meta.env.FEEDBACK_WEBHOOK_URL as
  string | undefined;

async function forwardToWebhook(input: {
  email: string;
  topic: string;
  message: string;
}): Promise<void> {
  if (!FEEDBACK_WEBHOOK_URL) return;
  try {
    await fetch(FEEDBACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "feedback", ...input }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    // A failing webhook must not fail the user's submission.
    console.warn(
      "[feedback] webhook forward failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

export const server = {
  feedback: defineAction({
    accept: "form",
    input: feedbackSchema,
    handler: async (input) => {
      await forwardToWebhook(input);
      console.log(
        `[feedback] received from ${input.email} (topic: ${input.topic})`,
      );
      return {
        received: true as const,
        topic: input.topic,
      };
    },
  }),
};
