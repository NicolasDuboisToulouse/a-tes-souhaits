import * as HTTP from "@shared/httpStatus";

//
// Server error or invalid com client/server
//
export class ApplicationError extends Error {
  readonly status: HTTP.StatusType;

  constructor(status: HTTP.StatusType, extra_message?: string) {
    let msg = "Erreur " + status.toString() + ": " + HTTP.getMessage(status);
    if (extra_message) {
      msg += " (" + extra_message + ")";
    }
    super(msg);
    this.name = "ApplicationError";
    this.status = status;
  }
}
