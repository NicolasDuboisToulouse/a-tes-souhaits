import fs from "fs";

export function setup() {
  if (typeof process.env.TESTS_TEMP_DIR !== "string") {
    console.error("env TESTS_TEMP_DIR is not defined!");
    process.exit(1);
  }

  fs.mkdirSync(process.env.TESTS_TEMP_DIR, { recursive: true });
}

export function teardown() {
  if (typeof process.env.TESTS_TEMP_DIR !== "string") {
    console.error("env TESTS_TEMP_DIR is not defined!");
    process.exit(1);
  }

  fs.rmSync(process.env.TESTS_TEMP_DIR, { force: true, recursive: true });
}
