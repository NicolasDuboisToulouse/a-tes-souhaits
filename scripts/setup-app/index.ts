import { OptionValues } from "commander";
import path from "path";
import fs from "fs";

//
// App configuration
//
export type EnvType = "production" | "development";

export class AppConfig {
  readonly env: EnvType;
  readonly docker: boolean;
  readonly port: number;

  constructor(param: EnvType | OptionValues | { env: EnvType; docker?: boolean; port?: number }) {
    if (typeof param === "string") {
      this.env = param;
      this.docker = false;
      this.port = 3000;
    } else {
      // Note: OptionValues type drop typescript checks
      if (!param.env && param.env !== "production" && param.env !== "development") {
        throw new Error("env options must be production or development");
      }
      if (param.docker && typeof param.docker !== "boolean") throw new Error("docker option must be a boolean");
      if (param.port && typeof param.port !== "number") throw new Error("port option must be a number");

      this.env = param.env;
      this.docker = param.docker ? param.docker : false;
      this.port = param.port ? param.port : 3000;
    }
  }
}

//
// Setup global env
//
export async function setupEnv(appConfig: AppConfig) {
  process.env.NODE_ENV = appConfig.env;
  process.env.PROGRAM_ROOT = path.normalize(import.meta.dirname + "/../..");
  const package_json = await import("file://" + process.env.PROGRAM_ROOT + "/package.json");
  process.env.PROGRAM_VERSION = package_json.version;
  process.env.PROGRAM_PORT = appConfig.port.toString();
  process.env.DATABASE_DIR = process.env.PROGRAM_ROOT + "/database";
  process.env.DATABASE_SCHEMAS = process.env.PROGRAM_ROOT + "/schemas";
}

//
// Setup server
//
export async function setupServer(appConfig: AppConfig) {

  //
  // Global env init
  //
  await setupEnv(appConfig);

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
  if (appConfig.docker === false) {
    if (typeof process.env.DATABASE_DIR !== "string") {
      throw new Error("DATABASE_DIR shall be a directory path.");
    }

    if (appConfig.docker === false) {
      if (fs.existsSync(process.env.DATABASE_DIR) === false) {
        fs.mkdirSync(process.env.DATABASE_DIR);
      }
    } else {
      if (fs.existsSync(process.env.DATABASE_DIR) === false) {
        die("In docker context, database dir shall be a volume!");
      }
    }
  }
}


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
