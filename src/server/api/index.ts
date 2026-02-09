import express from "express";
import * as error from "@server/error";
import logger from "@server/logger";

export const ROOT_URL = "/api/";
export const ROOT_URL_RE = /^\/api\/.*/;

export const router = express.Router();

//
// Check API requests are json
//
router.use(ROOT_URL, (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  if (req.get("Content-Type") !== "application/json") {
    error.send(error.HTTP.codes.Forbidden);
  } else {
    next();
  }
});


//
// Load all API
//
import hello from "./hello";
router.use(ROOT_URL, hello);

import do_error from "./do_error";
router.use(ROOT_URL, do_error);

import timeout from "./timeout";
router.use(ROOT_URL, timeout);


//
// Catch invaid API call
//
router.all(ROOT_URL_RE, (
  req: express.Request,
  res: express.Response
) => {
  const err = new error.ApplicationError(error.HTTP.codes.NotFound, req.url).protocolError();
  logger.error(err);
  res.status(err.status);
  res.json(err);
});
