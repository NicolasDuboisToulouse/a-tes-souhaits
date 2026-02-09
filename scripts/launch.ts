import { Command, Option, InvalidArgumentError } from "commander";
import { AppConfig, setupServer } from "./setup-app";


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
// Setup environment
//
const appConfig = new AppConfig(argsParser.opts());
await setupServer(appConfig);


//
// Launch
//
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
