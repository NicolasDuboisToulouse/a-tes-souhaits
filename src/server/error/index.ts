export { ApplicationError, send, stash, handleStashed } from "./application";
import logger from "@server/logger";

export function die(text?: string): never {
  if (text) logger.error(text);
  process.exit(1);
}
