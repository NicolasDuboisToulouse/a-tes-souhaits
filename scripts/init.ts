import { Command, Option } from "commander";
import path from "path";
import fs from "fs";
const program = new Command();

program.description("Initialize environment to run the project");

program.addOption(new Option("-n, --node <env>", "Node environment (currently not used)")
  .choices([ "development", "production" ])
  /* .makeOptionMandatory() */);
program.addOption(new Option("-d, --docker", "Program will run in docker. './database' shall be a volume")
  .default(false));

program.parse();

// Initialize database dir in non-docker env
if (program.opts().docker === false) {
  const database_dir = path.normalize(import.meta.dirname + "/../database");
  if (fs.existsSync(database_dir) === false) {
    fs.mkdirSync(database_dir);
  }
}
