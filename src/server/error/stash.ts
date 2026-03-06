import express from "express";
import { ApplicationError } from ".";

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

//
// Handle error that was stashed
//
export function handleStashed(app: express.Express) {
  app.use((
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    const error = getStashed();
    if (error) {
      stash(undefined);
      throw error;
    } else {
      next();
    }
  });
}
