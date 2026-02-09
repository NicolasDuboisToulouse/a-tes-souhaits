export { ApplicationError, send, stash, handleStashed } from "./application";
import logger from "@server/logger";

/* v8 ignore start */
export function die(text?: string): never {
  if (text) logger.error(text);
  process.exit(1);
}
/* v8 ignore stop */
