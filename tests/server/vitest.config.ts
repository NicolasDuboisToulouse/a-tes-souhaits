import path from "path";
import { defineConfig } from "vitest/config";
import * as configBase from "../../vite.config.base";

export default defineConfig({
  ...configBase.userConfig,
  test: {
    name: { label: "Server", color: "blue" },
    root: path.resolve(process.env.PROGRAM_ROOT!, "./src/server"),
    cache: false,
    silent: "passed-only",
    reporters: [
      "default",
      [ "junit", { outputFile: path.resolve(configBase.tests_result_dir, "./server.xml") } ]
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
      reportsDirectory: path.resolve(configBase.tests_result_dir, "./server_coverage"),
    },
    globalSetup: path.resolve(__dirname, "./global_setup.ts"),
    // start server ?
    // globalSetup:
  },
});
