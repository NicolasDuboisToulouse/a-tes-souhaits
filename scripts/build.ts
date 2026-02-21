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
      console.log("Install " + path.join(basePathForLog, path.basename(secondFile)) + "...");
      fs.cpSync(sourceFile, secondFile);
    }
  }
}


const program_root = path.resolve(import.meta.dirname, "..");

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
// Create/clean output directory
//
const target = (path.isAbsolute(options.target))
  ? options.target
  : path.join(program_root, options.target);
console.log("Prepare target dir '" + target + "'.");

if (options.clean) {
  fs.rmSync(target, {
    force: true,
    recursive: true,
  });
}

fs.mkdirSync(target, { recursive: true });

//
// setup env, needed for building
//
setupEnv(new AppConfig("production"));

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
  cwd: program_root,
  stdio: [ 0, 1, 2 ],
});


//
// Copy needed files
//
logger.info("Copy needed files...");
cpIfNewer(path.join(program_root, "LICENSE"), path.join(target, "LICENSE"));
cpIfNewer(path.join(program_root, "tsconfig.json"), path.join(target, "tsconfig.json"));
cpIfNewer(path.join(program_root, "vite.config.ts"), path.join(target, "vite.config.ts"));
cpIfNewer(path.join(program_root, "schemas"), path.join(target, "schemas"));
cpIfNewer(path.join(program_root, "scripts"), path.join(target, "scripts"));
cpIfNewer(path.join(program_root, "src", "server"), path.join(target, "src", "server"));
cpIfNewer(path.join(program_root, "src", "shared"), path.join(target, "src", "shared"));

//
// Copy database if required
//
if (options.keepDb) {
  logger.info("Copy database...");
  // the secret is keept to keep cookies valid
  cpIfNewer(path.join(program_root, "jwt_secret.txt"), path.join(target, "jwt_secret.txt"));
  cpIfNewer(path.join(program_root, "database"), path.join(target, "database"));
}

//
// Install NPM packages
//
const sourcePackageJson = path.join(program_root, "package.json");
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
