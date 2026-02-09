import express from "express";
import logger from "@server/logger";
import * as error from "@server/error";

const router = express.Router();

router.post("/timeout", (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  logger.info("req", req.body);
  setTimeout(() => {
    try {
      error.send(error.HTTP.codes.InternalServerError, "timeout");
    } catch(err) {
      next(err);
    }
  }, 1000);
});

export default router;
