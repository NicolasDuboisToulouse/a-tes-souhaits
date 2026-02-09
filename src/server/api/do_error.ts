import express from "express";
import logger from "@server/logger";
import * as error from "@server/error";

const router = express.Router();

router.post("/do_error", (
  req: express.Request,
  _res: express.Response
) => {
  logger.info("req", req.body);
  error.send(error.HTTP.codes.BadRequest, "An Error");
});

export default router;
