import express from "express";
import * as error from "@server/error";
import * as server from "@server/server";

const ROOT_URL = "/api/";
const ROOT_URL_RE = /^\/api\/.*/;

//
// Create the API router
// extraRoutes can be provided to insert routes after the API
// ones but before the 404 catch. This router will be relative
// to "/api/".
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
      error.send(server.HTTP.Status.Forbidden);
    } else {
      next();
    }
  });


  //
  // Load all API routes
  //
  await useRoute(router, "./hello");
  await useRoute(router, "./do_error");
  await useRoute(router, "./timeout");

  if (extraRoutes) {
    router.use(ROOT_URL, extraRoutes);
  }


  //
  // Catch invaid API call
  //
  router.all(ROOT_URL_RE, (
    req: express.Request,
    res: express.Response
  ) => {
    server.replyError(res, new error.ApplicationError(server.HTTP.Status.NotFound, req.url));
  });

  return router;
}


async function useRoute(router: express.Router, route: string) {
  const routeRouter = (await import(route)).default;
  router.use(ROOT_URL, routeRouter);
}
