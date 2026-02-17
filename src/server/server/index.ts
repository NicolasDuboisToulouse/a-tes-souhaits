import express from "express";
import { Server } from "http";
import cors from "cors";
import { createServer } from "vite";
import helmet from "helmet";
import path from "path";
import * as logger from "@shared/logger";
import * as error from "@server/error";
import * as api from "@server/api";
import * as HTTP from "./httpStatus";

export * as HTTP from "./httpStatus";

//
// protocol-safe version of res.json() for a valid answer
//
export function reply(
  response: express.Response,
  content?: object) {
  response.status(HTTP.Status.Ok).json(content ? content : {});
}

//
// protocol-safe version of res.json() for an error
// displayMessage: by default, display the message as a logger error
//
export function replyError(
  response: express.Response,
  appError: error.ApplicationError,
  displayMessage = true,
) {
  if (displayMessage) logger.error(appError.message);
  response.status(appError.status);
  response.json({ status: appError.status, msg: appError.message });
}

//
// Create express application
// See api/index.ts about extraRoutes
//
export async function createExpressApp(extraRoutes?: express.Router): Promise<express.Express> {

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
    logger.trace("Request URL:", req.url, "data:", req.body);
    next();
  });


  //
  // Import API middleware
  //
  app.use(await api.createRouter(extraRoutes));


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
    const appError = error.ApplicationError.from(err);
    if (req.get("Content-Type") === "application/json") {
      // We receive json, we return json
      replyError(res, appError);
    } else {
      // We receive anything else json (like a simple GET), redirect to error
      res.status(appError.status); // That doesn't works. The status shall be set be on error route request.
      res.redirect("/error/" + encodeURIComponent(appError.message));
    }
    logger.error("Error:", err.stack);
    logger.error("----");
  });

  /* v8 ignore start NODE_ENV cannot tested */
  switch (process.env.NODE_ENV) {
    case "development":
      // in development, run vite as HMR server
      {
        const viteDevServer = await createServer({
          mode: "development",
          server: {
            middlewareMode: true,
          },
        });
        app.use(viteDevServer.middlewares);
      }
      break;

    case "production":
      // in production mode, just serve static (generated) files
      app.use(helmet(), express.static(path.resolve("dist")));
      app.get(/.*/, (_req, res) => res.sendFile(path.resolve("dist", "index.html")));
      break;

    case "test":
      // in test mode, we don't serve client files
      break;

    default:
      logger.die(`Unexepected NODE_ENV: "${process.env.NODE_ENV}"`);
  }
  /* v8 ignore stop */

  return app;
}


//
// Start / Stop the server
//
/* v8 ignore start Server start/stop cannot be easily tested */
export async function start(app?: express.Express): Promise<Server> {
  if (!app) app = await createExpressApp();

  function serverStarted() {
    logger.info("Server is listening on port", port, "...");
  }

  if (!process.env.PROGRAM_PORT || /^[0-9]+$/.test(process.env.PROGRAM_PORT) === false) {
    logger.die("env var PROGRAM_PORT is not a number!");
  }
  const port = parseInt(process.env.PROGRAM_PORT, 10);
  if (isNaN(port)) {
    logger.die("env var PROGRAM_PORT is not a number!");
  }

  const server = app.listen(port, serverStarted);

  server.on("error", (e) => {
    logger.error("Server failure:", e);
    process.exit(1);
  });

  return server;
}

export function stop(server: Server) {
  server.removeAllListeners();
  server.close();
  server.closeAllConnections();
  logger.info("Server is stopped.");
}
/* v8 ignore stop */
