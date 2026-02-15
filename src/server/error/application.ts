import express from "express";
import * as server from "@server/server";

//
// ApplicationError that handle server.HTTP.Status
//
export class ApplicationError extends Error {
  readonly status: server.HTTP.StatusType;

  constructor(status: server.HTTP.StatusType, extra_message?: string) {
    let msg = "Erreur " + status.toString() + ": " + server.HTTP.getMessage(status);
    if (extra_message) {
      msg += " (" + extra_message + ")";
    }
    super(msg);
    this.name = "ApplicationError";
    this.status = status;
  }

  static from(data: unknown): ApplicationError {
    if (data instanceof ApplicationError) {
      return data;
    }
    if (data instanceof Error) {
      return new ApplicationError(
        server.HTTP.Status.InternalServerError,
        data.message,
      );
    }
    let msg = "Other Error";
    if (data && typeof data === "object") {
      msg += ": " + JSON.stringify(data);
    }
    return new ApplicationError(
      server.HTTP.Status.InternalServerError,
      msg,
    );
  }

}

//
// Send an error that handle server.HTTP.Status
//
export function send(status: server.HTTP.StatusType, extra_message?: string): never {
  throw new ApplicationError(status, extra_message);
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
