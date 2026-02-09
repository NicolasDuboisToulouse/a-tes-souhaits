import path from "path";
import { defineConfig } from "vitest/config";
import * as configBase from "../../vite.config.base";

export default defineConfig({
  ...configBase.userConfig,
  test: {
    name: { label: "Client", color: "magenta" },
    root: path.resolve(process.env.PROGRAM_ROOT!, "./src/client"),
    cache: false,
    silent: "passed-only",
    reporters: [
      "default",
      [ "junit", { outputFile: path.resolve(configBase.tests_result_dir, "./client.xml") } ],
    ],
    globals: true,       // test functions are included by default
    include: [
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
    coverage: {
      enabled: true,
      include: [ "**/*.{ts,tsx}" ],
      clean: true,
      reporter: [ "html" ],
      reportsDirectory: path.resolve(configBase.tests_result_dir, "./client_coverage"),
    },
    environment: "jsdom",
    setupFiles: path.resolve(__dirname, "./setup.ts"),
  },
});
