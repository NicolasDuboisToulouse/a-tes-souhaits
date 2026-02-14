#!npx tsx
import { Command, Option } from "commander";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const program_root = path.resolve(import.meta.dirname, "..");

//
// Parse args
//
const argsParser = new Command();
argsParser.description("Build the delivery.");

argsParser.argument("<tests...>", "List of tests to run (separated by spaces)");
argsParser.addOption(new Option("-s --sub-string", "Run all tests which names contain any <tests> string")
  .default(false));
argsParser.parse();

const files = Array.prototype.concat(
  fs.globSync(path.join(program_root, "src", "server", "**/*.test.ts?(x)")),
  fs.globSync(path.join(program_root, "src", "client", "**/*.test.ts?(x)"))
);
const tests: Map<string, string[]> = new Map<string, string[]>();
for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  for (const testName of argsParser.args) {
    const containRe = new RegExp(String.raw`"[^"]*${testName}[^"]*"`);
    if (
      (argsParser.opts().subString && containRe.test(content)) ||
      (!argsParser.opts().subString && content.includes("\"" + testName + "\""))
    ) {
      if (tests.has(testName)) {
        tests.get(testName)?.push(file);
      } else {
        tests.set(testName, [ file ]);
      }
    }
  }
}

if (tests.size === 0) {
  throw new Error("No test found!");
}

let exit_code = 0;

function run_tests(kind: "client" | "server", files: string[], testName: string) {
  const testRe = argsParser.opts().subString ? testName : "^" + testName + "$";
  const configFile = path.join("tests", kind, "vitest.config.ts");
  const command = `vitest run --silent false --hideSkippedTests --config ${configFile} ` +
    files.join(" ") +
    ` -t '${testRe}'`;
  console.log(command);

  try {
    execSync(`npx ${command}`, {
      cwd: program_root,
      stdio: [ 0, 1, 2 ],
    });
  } catch {
    exit_code = 1;
  }

}

tests.forEach((files, testName) => {
  const server_files = files.filter((file) => /src.server/.test(file));
  const client_files = files.filter((file) => /src.client/.test(file));
  if (server_files.length !== 0) {
    run_tests("server", server_files, testName);
  }
  if (client_files.length !== 0) {
    run_tests("client", client_files, testName);
  }
});

process.exit(exit_code);
