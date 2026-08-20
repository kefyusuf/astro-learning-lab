import { describe, expect, it } from "vitest";
import { feedbackSchema } from "../../src/lib/feedback-schema";

describe("feedbackSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    topic: "content",
    message: "This article clarified hydration for me. Thank you!",
  };

  it("accepts a valid submission", () => {
    const result = feedbackSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("treats an empty name as omitted", () => {
    const result = feedbackSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBeUndefined();
  });

  it("defaults topic to general", () => {
    const result = feedbackSchema.safeParse({ ...valid, topic: undefined });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.topic).toBe("general");
  });

  it("rejects invalid email addresses", () => {
    const result = feedbackSchema.safeParse({
      ...valid,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects messages shorter than 20 characters", () => {
    const result = feedbackSchema.safeParse({ ...valid, message: "too short" });
    expect(result.success).toBe(false);
  });

  it("rejects messages longer than 2000 characters", () => {
    const result = feedbackSchema.safeParse({
      ...valid,
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects names longer than 80 characters", () => {
    const result = feedbackSchema.safeParse({ ...valid, name: "x".repeat(81) });
    expect(result.success).toBe(false);
  });

  it("rejects unknown topics", () => {
    const result = feedbackSchema.safeParse({ ...valid, topic: "spam" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from the message", () => {
    const result = feedbackSchema.safeParse({
      ...valid,
      message: `  ${valid.message}  `,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message).toBe(valid.message);
  });
});
