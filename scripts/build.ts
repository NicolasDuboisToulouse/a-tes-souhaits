#!npx tsx
import { Command, Option } from "commander";
import path from "path";
import { execSync } from "child_process";
import { AppConfig, setupEnv } from "./tools/setup-app";
import * as logger from "@shared/logger";
import * as fs from "./tools/fs";

//
// Copy sourceFile to secondFile if sourceFile is newer.
// Work recursivelly with directories.
//
function cpIfNewer(sourceFile: string, secondFile: string, basePathForLog = "") {
  if (fs.statSync(sourceFile).isDirectory()) {
    fs.mkdirSync(secondFile, { recursive: true });
    fs.readdirSync(sourceFile).forEach((file) => {
      cpIfNewer(
        path.join(sourceFile, file),
        path.join(secondFile, file),
        path.join(basePathForLog, path.basename(sourceFile), ""),
      );
    });
  } else {
    if (fs.isFirstNewer(sourceFile, secondFile)) {
      logger.info(" + Install", path.join(basePathForLog, path.basename(secondFile)) + "...");
      fs.cpSync(sourceFile, secondFile);
    }
  }
}


//
// Parse args
//
const argsParser = new Command();
argsParser.description("Build the delivery.");

argsParser.addOption(new Option("-t, --target <path>", "path to target folder (absolute or relative to project root)")
  .default("build"));
argsParser.addOption(new Option("--keep-db", "Copy the database from dev environment to the delivery.")
  .default(false));
argsParser.addOption(new Option("-c --clean", "clean the delivery before build (rebuild all).")
  .default(false));

argsParser.parse();
const options = argsParser.opts();


//
// setup env, needed for building
//
setupEnv(new AppConfig("production"));
if (typeof process.env.PROGRAM_ROOT !== "string") {
  throw new Error("env var PROGRAM_ROOT unset !");
}


//
// Create/clean output directory
//
const target = (path.isAbsolute(options.target))
  ? options.target
  : path.join(process.env.PROGRAM_ROOT, options.target);
logger.info("Prepare target dir '" + target + "'.");

if (options.clean) {
  fs.rmSync(target, {
    force: true,
    recursive: true,
  });
}

fs.mkdirSync(target, { recursive: true });

//
// Update the protocol
//
import { updateProtocol } from "./proto-gen";
updateProtocol();

//
// Build vite (regardless clean option)
//
logger.info("Building vite...");
const vite = fs.pathLookup("vite");
if (!vite) {
  logger.die("vite cannot be found !");
}

const vite_target = path.join(target, "dist");
fs.rmSync(vite_target, {
  force: true,
  recursive: true,
});

execSync(`${vite} build --outDir ${vite_target} --emptyOutDir`, {
  cwd: process.env.PROGRAM_ROOT,
  stdio: [ 0, 1, 2 ],
});


//
// Copy needed files
//
logger.info("Copy needed files...");
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "LICENSE"), path.join(target, "LICENSE"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "tsconfig.json"), path.join(target, "tsconfig.json"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "vite.config.ts"), path.join(target, "vite.config.ts"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "schemas"), path.join(target, "schemas"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "src", "server"), path.join(target, "src", "server"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "src", "shared"), path.join(target, "src", "shared"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "scripts", "launch.ts"), path.join(target, "scripts", "launch.ts"));
cpIfNewer(path.join(process.env.PROGRAM_ROOT, "scripts", "tools"), path.join(target, "scripts", "tools"));

//
// Copy database if required
//
if (options.keepDb) {
  logger.info("Copy database...");
  // the secret is keept to keep cookies valid
  cpIfNewer(path.join(process.env.PROGRAM_ROOT, "jwt_secret.txt"), path.join(target, "jwt_secret.txt"));
  cpIfNewer(path.join(process.env.PROGRAM_ROOT, "database"), path.join(target, "database"));
}

//
// Install NPM packages
//
const sourcePackageJson = path.join(process.env.PROGRAM_ROOT, "package.json");
const destPackageJson = path.join(target, "package.json");
if (fs.isFirstNewer(sourcePackageJson, destPackageJson)) {
  logger.info("Install NPM packages...");
  const npm = fs.pathLookup("npm");
  if (!npm) {
    logger.die("npm cannot be found !");
  }
  fs.cpSync(sourcePackageJson, destPackageJson);
  execSync("npm install --omit=dev", {
    cwd: target,
    stdio: [ 0, 1, 2 ],
  });
}

logger.info("Done.");
