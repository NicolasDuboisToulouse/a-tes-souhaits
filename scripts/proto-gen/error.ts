import * as logger from "@shared/logger";

//
// Display error then exit
//
export function parseError(path: string, msg: string): never {
  logger.die(path, logger.noSpace(":"), msg);
}
