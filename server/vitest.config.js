import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.js", "utils/**/*.test.js"],
    testTimeout: 10000,
    hookTimeout: 120000,
    maxWorkers: 1,
  },
});
