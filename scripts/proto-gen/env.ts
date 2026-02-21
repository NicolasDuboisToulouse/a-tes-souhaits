import { setupEnv as setupAppEnv, AppConfig } from "@scripts/tools/setup-app";
import * as logger from "@shared/logger";

export function setupEnv() {
  setupAppEnv(new AppConfig("development"));
  logger.setLevel("trace");
}
