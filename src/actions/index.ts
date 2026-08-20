import { defineAction } from "astro:actions";
import { feedbackSchema } from "../lib/feedback-schema";

export const server = {
  feedback: defineAction({
    accept: "form",
    input: feedbackSchema,
    handler: async (input) => {
      // A real integration (email, issue tracker, database) would live
      // here. The learning project records the submission server-side
      // and returns a typed acknowledgement.
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
