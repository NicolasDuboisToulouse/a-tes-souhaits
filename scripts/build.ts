import { Command, Option } from "commander";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

//
// Display an error then exit
//
function die(text?: string): never {
  if (text) console.error(text);
  process.exit(1);
}

//
// lookup for a program in PATH
//
function pathLookup(seachedFile: string): string | undefined {
  const sys_path = process.env.path || process.env.PATH || "";
  for (const dir of sys_path.split(path.delimiter)) {
    const file = dir + path.sep + seachedFile;
    try {
      fs.accessSync(file, fs.constants.F_OK | fs.constants.X_OK);
      return file;
    } catch(_) {
      // process next dir
    }
  }
  return undefined;
}


const program_root = path.normalize(import.meta.dirname + "/..");

//
// Parse args
//
const argsParser = new Command();
argsParser.description("Build the delivery.");

argsParser.addOption(new Option("-t, --target <path>", "path to target folder (absolute or relative to project root)")
  .default("build"));
argsParser.addOption(new Option("--keep-db", "Copy the database from dev environment to the delivery.")
  .default(false));

argsParser.parse();


//
// Create/clean output directory
//
let target: string;
if (path.isAbsolute(argsParser.opts().target)) {
  target = argsParser.opts().target;
} else {
  target = path.join(program_root, argsParser.opts().target);
}
console.log("Clean/Create target dir '" + target + "'.");
if (fs.existsSync(target)) {
  fs.rmSync(target, {
    recursive: true,
  });
}
fs.mkdirSync(target);


//
// Build vite
//
console.log("Building vite...");
const vite = pathLookup("vite");
if (!vite) {
  die("vite cannot be found !");
}
const vite_target = target + "/dist";
execSync(`${vite} build --outDir ${vite_target} --emptyOutDir`, {
  cwd: program_root,
  stdio: [ 0, 1, 2 ],
});


//
// Copy needed files
//
console.log("Copy needed files...");
fs.cpSync(program_root + "/package.json", target + "/package.json");
fs.cpSync(program_root + "/LICENSE", target + "/LICENSE");
fs.cpSync(program_root + "/tsconfig.json", target + "/tsconfig.json");
fs.cpSync(program_root + "/vite.config.ts", target + "/vite.config.ts");
fs.cpSync(program_root + "/schemas", target + "/schemas", { recursive: true });
fs.cpSync(program_root + "/scripts", target + "/scripts", { recursive: true });
fs.mkdirSync(target + "/src");
fs.cpSync(program_root + "/src/server", target + "/src/server", { recursive: true });

//
// Copy database if required
//
if (argsParser.opts().keepDb) {
  console.log("Copy database...");
  // the secret is keept to keep cookies valid
  fs.cpSync(program_root + "/jwt_secret.txt", target + "/jwt_secret.txt");
  fs.cpSync(program_root + "/database", target + "/database", { recursive: true });
}

//
// Install NPM packages
//
console.log("Install NPM packages...");
const npm = pathLookup("npm");
if (!npm) {
  die("npm cannot be found !");
}
execSync("npm install --omit=dev", {
  cwd: target,
  stdio: [ 0, 1, 2 ],
});

console.log("Done.");
