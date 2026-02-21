#!npx tsx
import { Command, Option } from "commander";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import xpath from "xpath";
import { DOMParser } from "@xmldom/xmldom";
import { AppConfig, setupEnv } from "./tools/setup-app";
import * as logger from "@shared/logger";

//
// Init
//
setupEnv(new AppConfig("test"));
if (typeof process.env.PROGRAM_ROOT !== "string") {
  logger.error("setupEnv() don't set PROGRAM_ROOT !");
  process.exit(1);
}
let exit_code = 0;


//
// Parse args
//
function testFileParser(testFile: string, testFiles: string[]): string[] {
  if (testFiles) {
    return [ ...testFiles, path.resolve(testFile) ];
  } else {
    return [ path.resolve(testFile) ];
  }
}

const argsParser = new Command();
argsParser.description("Build the delivery.");

argsParser.argument("[testRegEx...]", "List of tests to run (separated by spaces). If no test specifiled, run all tests");
argsParser.addOption(new Option("-e --exact", "On run tests that exatly match testRegEx (it't a substring by default)")
  .default(false));
argsParser.addOption(new Option("--no-verbose", "Hide tests stdout/stderr.")
  .default(true));
argsParser.addOption(new Option("-s --server", "Only run server tests")
  .default(false)
  .conflicts("client"));
argsParser.addOption(new Option("-c --client", "Only run client tests")
  .default(false)
  .conflicts("server"));
argsParser.addOption(new Option("-f --file <testFile> ...", "lookup only in testFiles (option can be set several times)")
  .argParser(testFileParser));

argsParser.parse();
const testsNameReList = argsParser.args;
const options = argsParser.opts();

//
// Update the protocol
//
import { updateProtocol } from "./proto-gen";
updateProtocol();

//
// Lookup for test files
//
const allTestFiles = (() => {
  function getTestList(kind: string) {
    return fs.globSync(path.join(process.env.PROGRAM_ROOT!, "src", kind, "**/*.test.ts?(x)"));
  }
  if (options.file) {
    return options.file;
  }
  if (options.server) {
    return getTestList("server");
  }
  if (options.client) {
    return getTestList("client");
  }
  return Array.prototype.concat(
    getTestList("server"),
    getTestList("client"),
  );
})();

// tests: Map testNameRe => testFile[]
const tests: Map<string, string[]> = new Map<string, string[]>();

if (testsNameReList.length > 0) {
  for (const file of allTestFiles) {
    const content = fs.readFileSync(file, "utf-8");
    for (const testNameRe of testsNameReList) {
      const containRe = options.exact
        ? new RegExp(String.raw`it\("${testNameRe}"`)
        : new RegExp(String.raw`it\("[^"]*${testNameRe}[^"]*"`);
      if (containRe.test(content)) {
        if (tests.has(testNameRe)) {
          tests.get(testNameRe)?.push(file);
        } else {
          tests.set(testNameRe, [ file ]);
        }
      }
    }
  }
} else {
  tests.set(".*", allTestFiles);
}

if (tests.size === 0) {
  throw new Error("No test found!");
}

//
// Define logger level
//
if (options.verbose) {
  logger.setLevel("trace");
} else {
  logger.setLevel("silent");
}

//
// Run all tests in testFiles filtered by testNameRe
//
function run_tests(kind: "client" | "server", testFiles: string[], testNameRe: string) {
  const targetRe = options.exact ? "^" + testNameRe + "$" : testNameRe;
  const configFile = path.join("tests", kind, "vitest.config.ts");
  // How to correctly excape spaces ??
  const protectedRe = targetRe.replace(/(["\s'$`\\])/, ".");
  const args = [
    "vitest",
    "run",
    "--silent", (!options.verbose).toString(),
    "--hideSkippedTests",
    "--config", configFile,
    ...testFiles,
    "-t", protectedRe,
  ];

  try {
    logger.info("run: npx ", args.join(" "));
    execFileSync("npx", args, {
      cwd: process.env.PROGRAM_ROOT,
      stdio: [ 0, 1, 2 ],
      shell: true,
    });
  } catch(_err) {
    exit_code = 1;
  }

}

tests.forEach((files, testNameRe) => {
  const server_files = files.filter((file) => /src.server/.test(file));
  const client_files = files.filter((file) => /src.client/.test(file));
  if (server_files.length !== 0) {
    run_tests("server", server_files, testNameRe);
  }
  if (client_files.length !== 0) {
    run_tests("client", client_files, testNameRe);
  }
});

logger.setLevel("info");
if (exit_code) {
  logger.error("Some tests failed:");
  const serverResult = fs.readFileSync(path.join(process.env.TESTS_RESULT_DIR!, "server.xml"), "utf8");
  const dom = new DOMParser().parseFromString(serverResult);
  const nodes = xpath.select("//testcase[failure]", dom);
  if (nodes instanceof Array) {
    for (const node of nodes) {
      if (node.nodeType === node.ELEMENT_NODE) {
        logger.error(" -",
          (node as Element).getAttribute("name"),
          "(" + (node as Element).getAttribute("classname") + ")",
        );
      }
    }
  }
} else {
  logger.info("All test successed!");
}

process.exit(exit_code);
