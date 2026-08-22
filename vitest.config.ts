import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    environment: "node",
    passWithNoTests: true,
    // Coverage scopes src/lib - the unit-testable pure logic layer.
    // Pages and islands are covered at the behavior level by Playwright,
    // with island units tested via @testing-library/react (happy-dom).
    coverage: {
      reporter: ["text"],
      include: ["src/lib/**"],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 85,
        lines: 90,
      },
    },
  },
});
