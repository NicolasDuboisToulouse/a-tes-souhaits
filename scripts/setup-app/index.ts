import { OptionValues } from "commander";
import path from "path";
import fs from "fs";

//
// App configuration
//
const envValues = [ "production", "development", "test" ] as const;
export type EnvType = typeof envValues[number];

export class AppConfig {
  readonly env: EnvType;
  readonly port: number;

  constructor(param: EnvType | OptionValues | { env: EnvType; port?: number }) {
    if (typeof param === "string") {
      this.env = param;
      this.port = 3000;
    } else {
      // Note: OptionValues type drop typescript checks
      if (!param.env || !envValues.includes(param.env)) {
        throw new Error("env options must be in " + JSON.stringify(envValues));
      }
      if (param.port && typeof param.port !== "number") throw new Error("port option must be a number");

      this.env = param.env;
      this.port = param.port ? param.port : 3000;
    }
  }
}

//
// Setup global env
//
export function setupEnv(appConfig: AppConfig) {
  process.env.NODE_ENV = appConfig.env;
  process.env.PROGRAM_ROOT = path.resolve(import.meta.dirname, "..", "..");
  process.env.PROGRAM_PORT = appConfig.port.toString();
  process.env.DATABASE_DIR = path.join(process.env.PROGRAM_ROOT, "database");
  process.env.DATABASE_SCHEMAS = path.join(process.env.PROGRAM_ROOT, "schemas");
  if (process.env.NODE_ENV === "test") {
    process.env.LOG_LEVEL = "trace";
    process.env.TESTS_RESULT_DIR = path.join(process.env.PROGRAM_ROOT, "tests_result");
    process.env.DATABASE_DIR = path.join(process.env.TESTS_RESULT_DIR, "database");
  }
}

//
// Setup server
//
export async function setupServer(appConfig: AppConfig) {

  //
  // Global env init
  //
  setupEnv(appConfig);

  //
  // Get or Generate jwt secret
  // This is used as salf for user/password cookies
  //
  const secret_file = path.join(process.env.PROGRAM_ROOT!, "jwt_secret.txt");
  let secret: string;
  if (fs.existsSync(secret_file)) {
    secret = fs.readFileSync(secret_file, { encoding: "utf8" });
  } else {
    secret = randomString(20);
    fs.writeFileSync(secret_file, secret);
  }
  process.env.JWT_SECRET = secret;
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
