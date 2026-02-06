import express from "express";
import ejs from "ejs";
import fs from "fs";
import logger from "../logger";
import * as HTTP from "./httpResponseStatus";
import { send as sendError, ApplicationError } from "./application";

//
// Install express error middleware
//
export function install(app: express.Express) {

  // Handle invalid URI
  app.use((
    req: express.Request,
  ) => {
    // just call the main error handler with 404
    sendError(HTTP.codes.NotFound, req.url);
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
    logger.error("----");
    let result: { status: HTTP.CodesType; msg: string } = {
      status: HTTP.codes.Ok,
      msg: HTTP.getMessage(HTTP.codes.Ok)
    };

    if (err instanceof ApplicationError) {
      // Hanlded application error
      result = { status: err.code, msg: err.message };
      logger.error("Application error: %o", result);
    } else if (err instanceof Error) {
      // unhanlded server error
      result = {
        status: HTTP.codes.InternalServerError,
        msg: err.message ? err.message : "No error message"
      };
      logger.error("Internal error: %o", result);
    } else {
      // Not an error ? We shall not be here
      result = { status: HTTP.codes.InternalServerError, msg: "Unexpected Error" };
      logger.error("Not an error ??: %o", result);
    }
    logger.error("Error: %s", err.stack);

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
    logger.error("----");
  });
}
