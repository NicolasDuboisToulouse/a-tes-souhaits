import * as HTTP from "./httpResponseStatus";

//
// ApplicationError that handle HTTP.codes
//
export class ApplicationError extends Error {
  readonly code: HTTP.CodesType;

  constructor(code: HTTP.CodesType, extra_message?: string) {
    let msg = code.toString() + ": " + HTTP.getMessage(code);
    if (extra_message) {
      msg += " (" + extra_message + ")";
    }
    super(msg);
    this.name = "ApplicationError";
    this.code = code;
  }
}

//
// Send an error that handle HTTP.codes
//
export function send(code: HTTP.CodesType, extra_message?: string): never {
  throw new ApplicationError(code, extra_message);
}

//
// Stash an error that will be displayed at next client request
// Typically you shash error when server is not yet started
//
type stashedErrorType = Error | ApplicationError | unknown | undefined;
let stashed: stashedErrorType = undefined;
export function stash(error: stashedErrorType) {
  stashed = error;
}
export function getStashed(): stashedErrorType {
  return stashed;
}
