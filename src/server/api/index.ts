import express from "express";
import { ApplicationError } from "@server/error";
import * as HTTP from "@shared/httpStatus";
import { router as protocolRouter } from "@server/protocol";

const ROOT_URL = "/api/";
const ROOT_URL_RE = /^\/api\/.*/;

//
// Create the API router
// extraRoutes can be provided to insert routes after the API
// ones but before the 404 catch. This router will be relative
// to "/api/".
// This is used for testing purposes.
//
export async function createRouter(extraRoutes?: express.Router): Promise<express.Router> {

  const router = express.Router();

  //
  // Check API requests are json
  //
  router.use(ROOT_URL, (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    if (req.get("Content-Type") !== "application/json") {
      throw new ApplicationError(HTTP.Status.Forbidden);
    } else {
      next();
    }
  });


  //
  // Load all API routes
  //
  await import("./user");
  await import("./hello");
  await import("./do_error");
  await import("./empty");
  await import("./timeout");
  router.use(ROOT_URL, protocolRouter);

  if (extraRoutes) {
    router.use(ROOT_URL, extraRoutes);
  }


  //
  // Catch invaid API call
  //
  router.all(ROOT_URL_RE, (
    req: express.Request,
    _res: express.Response,
  ) => {
    throw new ApplicationError(HTTP.Status.NotFound, req.url);
  });

  return router;
}
