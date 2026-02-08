import { Command, Option, InvalidArgumentError } from "commander";
import path from "path";
import fs from "fs";

//
// Display an error then exit
//
function die(text?: string): never {
  if (text) console.error(text);
  process.exit(1);
}

//
// Generate a random string of length char
//
function randomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//
// Parse a string to a decimal number (or throw comander error)
//
function parseDecNumber(value: string) {
  if (/^[0-9]+$/.test(value) === false) {
    throw new InvalidArgumentError("Not a number.");
  }
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
}

//
// Parse args
//
const argsParser = new Command();
argsParser.description("Initialize environment and run the project.");

argsParser.addOption(new Option("-e, --env <env>", "Runtime environment environment")
  .choices([ "development", "production" ])
  .makeOptionMandatory());
argsParser.addOption(new Option("-d, --docker", "Program will run in docker. './database' shall be a volume")
  .default(false));
argsParser.addOption(new Option("-p --port <number>", "Server port")
  .default(3000)
  .argParser(parseDecNumber));

argsParser.parse();


//
// Global env
//
process.env.NODE_ENV = argsParser.opts().env;
process.env.PROGRAM_ROOT = path.normalize(import.meta.dirname + "/..");
const package_json = await import("file://" + process.env.PROGRAM_ROOT + "/package.json");
process.env.PROGRAM_VERSION = package_json.version;
process.env.PROGRAM_PORT = argsParser.opts().port;
process.env.DATABASE_DIR = process.env.PROGRAM_ROOT + "/database";
process.env.DATABASE_SCHEMAS = process.env.PROGRAM_ROOT + "/schemas";

//
// Get or Generate jwt secret
// This is used as salf for user/password cookies
//
const secret_file = process.env.PROGRAM_ROOT + "/jwt_secret.txt";
let secret: string;
if (fs.existsSync(secret_file)) {
  secret = fs.readFileSync(secret_file, { encoding: "utf8" });
} else {
  secret = randomString(20);
  fs.writeFileSync(secret_file, secret);
}
process.env.JWT_SECRET = secret;

//
// Initialize or check database dir
//
if (argsParser.opts().docker === false) {
  if (fs.existsSync(process.env.DATABASE_DIR) === false) {
    fs.mkdirSync(process.env.DATABASE_DIR);
  }
} else {
  if (fs.existsSync(process.env.DATABASE_DIR) === false) {
    die("In docker context, database dir shall be a volume!");
  }
}

if (process.env.NODE_ENV === "development") {
  process.env.LOG_LEVEL = "trace";
  const nodemon = await import("nodemon");
  nodemon.default({
    exec: "tsx",
    script: process.env.PROGRAM_ROOT + "/src/server/main.ts",
    watch: [ process.env.PROGRAM_ROOT + "/src/server" ],
  });
} else {
  await import("file://" + process.env.PROGRAM_ROOT + "/src/server/main.ts");
}
