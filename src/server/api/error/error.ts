import express from "express";
import ejs from "ejs";
import * as fs from "fs";

//
// Supported error code with their value and description
//
export const HTTPCodes = {
  Ok:                  200,
  BadRequest:          400,
  Unauthorized:        401, // aka unauthenticated according to the standard
  Forbidden:           403,
  NotFound:            404,
  InternalServerError: 500,
} as const;

type HTTPCodesType = typeof HTTPCodes[keyof typeof HTTPCodes];

const HTTPMessages: Record<HTTPCodesType, string> = {
  [HTTPCodes.Ok]:                  "Ok",
  [HTTPCodes.BadRequest]:          "Requête invalide",
  [HTTPCodes.Unauthorized]:        "Connection requise",
  [HTTPCodes.Forbidden]:           "Accès refusé",
  [HTTPCodes.NotFound]:            "Page non trouvée",
  [HTTPCodes.InternalServerError]: "Erreur interne",
};

//
// ApplicationError that handle HTTPCodes
//
class ApplicationError extends Error {
  readonly code: HTTPCodesType;

  constructor(code: HTTPCodesType, extra_message?: string) {
    let msg = code.toString() + ": " + HTTPMessages[code];
    if (extra_message) {
      msg += " (" + extra_message + ")";
    }
    super(msg);
    this.name = "ApplicationError";
    this.code = code;
  }
}

//
// Send an error that handle HTTPCodes
//
export function send(code: HTTPCodesType, extra_message?: string) {
  throw new ApplicationError(code, extra_message);
}

//
// Install express error middleware
//
export function installMiddleware(app: express.Express) {

  // Handle invalid URI
  app.use((
    req: express.Request,
  ) => {
    // just call the main error handler with 404
    throw new ApplicationError(HTTPCodes.NotFound, req.url);
  });

  //
  // Main error handler
  // - Handle ApplicationError, Error and unknown type
  // - Display information in server console
  // - Return either an JSON content or an HTML one depending on
  //   Content-Type of the  request.
  //
  app.use((
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction, // Must be define to make express call this Middleware
  ) => {
    console.log("----");
    let result: { status: HTTPCodesType, msg: string } = {
      status: HTTPCodes.Ok,
      msg: HTTPMessages[HTTPCodes.Ok]
    };

    if (err instanceof ApplicationError) {
      // Hanlded application error
      result = { status: err.code, msg: err.message };
      console.error("Application error:", result);
    } else if (err instanceof Error) {
      // unhanlded server error
      result = { status: HTTPCodes.InternalServerError, msg: err.message ? err.message : "No error message" };
      console.error("Internal error:", result);
    } else {
      // Not an error ? We shall not be here
      result = { status: HTTPCodes.InternalServerError, msg: "Unexpected Error" };
      console.error("Not an error ??:", result);
    }
    console.log("Error: ", err);

    if (req.get("Content-Type") === "application/json") {
      // We receive json, we return json
      res.send(result);
    } else {
      // We receive anything else json (like a simple GET), we return HTML
      const ejsError = fs.readFileSync(import.meta.dirname + "/error.ejs", "utf8");
      const html = ejs.render(ejsError, { message: result.msg });
      res.set("Content-Type", "text/html");
      res.send(html);
    }
    console.log("----");
  });
}
