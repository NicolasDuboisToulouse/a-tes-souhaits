export * as HTTP from "./httpResponseStatus";
export { send, stash, getStashed } from "./application";
export * as expressMiddleware from "./expressMiddleware";

export function die(text?: string): never {
  if (text) console.error(text);
  process.exit(1);
}
