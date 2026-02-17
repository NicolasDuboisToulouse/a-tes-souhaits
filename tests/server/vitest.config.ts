import path from "path";
import { defineConfig } from "vitest/config";
import * as configBase from "../../vite.config.base";

if (typeof process.env.TESTS_RESULT_DIR !== "string") {
  console.error("env TESTS_RESULT_DIR is not defined!");
  process.exit(1);
}

export default defineConfig({
  ...configBase.userConfig,
  test: {
    name: { label: "Server", color: "blue" },
    root: path.resolve(process.env.PROGRAM_ROOT!, "src", "server"),
    cache: false,
    silent: "passed-only",
    reporters: [
      "default",
      [ "junit", { outputFile: path.resolve(process.env.TESTS_RESULT_DIR, "server.xml") } ],
    ],
    globals: true,       // test functions are included by default
    include: [
      "**/*.test.ts",
    ],
    coverage: {
      enabled: true,
      include: [ "**/*.{ts,tsx}" ],
      clean: true,
      reporter: [ "html" ],
      reportsDirectory: path.resolve(process.env.TESTS_RESULT_DIR, "server_coverage"),
    },
  },
});
