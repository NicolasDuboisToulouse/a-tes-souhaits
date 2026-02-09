import express from "express";
import cors from "cors";
import { createServer } from "vite";
import helmet from "helmet";
import logger from "@server/logger";
import * as error from "@server/error";
import * as api from "@server/api";

export async function start() {

  const app = express();
  app.set("env", process.env.NODE_ENV);
  app.use(cors());
  app.use(express.json());


  //
  // Dispatch error that was raised before server starts
  //
  error.handleStashed(app);


  //
  // Display the requested URL
  //
  app.use((
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.trace("Request URL: " + req.url + ", data: " + req.body);
    next();
  });


  //
  // Import API middleware
  //
  app.use(api.router);


  //
  // Main error handler
  // - Trap all error that has been throw in express middleware (ApplicationError, Error, unknown)
  // - Display information in server console
  // - Return either an JSON content or redirect to error page
  //
  app.use((
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction, // Must be define to make express call this Middleware
  ) => {
    logger.error("----");
    let protocolError: error.ProtocolError;

    if (err instanceof error.ApplicationError) {
      protocolError = err.protocolError();
      logger.error("Application error: %o", protocolError);
    } else if (err instanceof Error) {
      protocolError = {
        status: error.HTTP.codes.InternalServerError,
        msg: err.message ? err.message : "Unknown error",
      };
      logger.error("Internal error: %o", protocolError);
    } else {
      protocolError = {
        status: error.HTTP.codes.InternalServerError,
        msg: "Unexpected error"
      };
      logger.error("Not an error ??: %o", protocolError);
    }
    logger.error("Error: %s", err.stack);

    res.status(protocolError.status);
    if (req.get("Content-Type") === "application/json") {
      // We receive json, we return json
      res.json(protocolError);
    } else {
      // We receive anything else json (like a simple GET), redirect to error
      res.redirect("/error/" + encodeURIComponent(protocolError.msg));
    }
    logger.error("----");
  });


  //
  // Launch the server
  //
  function serverStarted() {
    logger.info("Server is listening on port " + port + "...");
  }

  if (process.env.NODE_ENV === "development") {
    // in development, run vite as HMR server
    const viteDevServer = await createServer({
      mode: "development",
      server: {
        middlewareMode: true,
      },
    });
    app.use(viteDevServer.middlewares);
  } else {
    // in production mode, just serve static (generated) files
    app.use(helmet(), express.static("dist"));
  }

  if (!process.env.PROGRAM_PORT || /^[0-9]+$/.test(process.env.PROGRAM_PORT) === false) {
    error.die("env var PROGRAM_PORT is not a number!");
  }
  const port = parseInt(process.env.PROGRAM_PORT, 10);
  if (isNaN(port)) {
    error.die("env var PROGRAM_PORT is not a number!");
  }

  app.listen(port, serverStarted);
}
