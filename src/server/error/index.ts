export * as HTTP from "./httpResponseStatus";
export { ApplicationError, send, stash, handleStashed } from "./application";

export function die(text?: string): never {
  if (text) console.error(text);
  process.exit(1);
}
