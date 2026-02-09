import * as HTTP from "./httpResponseStatus";
export * as HTTP from "./httpResponseStatus";
export { ApplicationError, send, stash, handleStashed } from "./application";
import logger from "@server/logger";

export function die(text?: string): never {
  if (text) logger.error(text);
  process.exit(1);
}

export interface ProtocolError { status: HTTP.CodesType; msg: string }
