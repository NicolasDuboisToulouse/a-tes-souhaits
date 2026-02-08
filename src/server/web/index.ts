import express from "express";
import cors from "cors";
import { createServer } from "vite";
import helmet from "helmet";
import * as error from "@server/error";
import logger from "@server/logger";
import * as api from "@server/api";

export async function start() {

  const app = express();
  app.set("env", process.env.NODE_ENV);
  app.use(cors());
  app.use(express.json());

  // Dispatch error that was raised before server starts
  error.handleStashed(app);

  // Display the requested URL
  app.use((
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.trace("Request URL: " + req.url + ", data: " + req.body);
    next();
  });


  //
  // Some tests
  //
  app.all("/hello", (
    req: express.Request,
    res: express.Response
  ) => {
    if (req.get("Content-Type") !== "application/json") {
      error.send(error.HTTP.codes.Forbidden);
    }
    logger.info("req", req.body);
    res.json({ hello: "world" });
  });

  app.all("/do_error", (
    _req: express.Request,
    _res: express.Response
  ) => {
    error.send(error.HTTP.codes.BadRequest, "An Error");
  });

  app.all("/timeout", async(
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    setTimeout(() => {
      try {
        error.send(error.HTTP.codes.InternalServerError);
      } catch(err) {
        next(err);
      }
    }, 1000);
  });

  //
  // Catch invaid API call
  //
  app.all(api.ROOT_URL_RE, (
    _req: express.Request,
    _res: express.Response
  ) => {
    error.send(error.HTTP.codes.Forbidden, "Appel API invalide");
  });


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
    let result: { status: error.HTTP.CodesType; msg: string } = {
      status: error.HTTP.codes.Ok,
      msg: error.HTTP.getMessage(error.HTTP.codes.Ok)
    };

    if (err instanceof error.ApplicationError) {
      // Hanlded application error
      result = { status: err.code, msg: err.message };
      logger.error("Application error: %o", result);
    } else if (err instanceof Error) {
      // unhanlded server error
      result = {
        status: error.HTTP.codes.InternalServerError,
        msg: err.message ? err.message : "No error message"
      };
      logger.error("Internal error: %o", result);
    } else {
      // Not an error ? We shall not be here
      result = { status: error.HTTP.codes.InternalServerError, msg: "Unexpected Error" };
      logger.error("Not an error ??: %o", result);
    }
    logger.error("Error: %s", err.stack);

    if (req.get("Content-Type") === "application/json") {
      // We receive json, we return json
      res.status(result.status);
      res.send(result);
    } else {
      // We receive anything else json (like a simple GET), redirect to error
      res.status(result.status);
      res.redirect("/error/" + encodeURIComponent(result.msg));
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
        // TODO: https
        // https: ...
        middlewareMode: true,
      },
    });
    app.use(viteDevServer.middlewares);
  } else {
    // in production mode, just serve static files
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
