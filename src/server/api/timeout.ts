import express from "express";
import * as error from "@server/error";
import * as server from "@server/server";

const router = express.Router();

router.post("/timeout", (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  setTimeout(() => {
    try {
      error.send(server.HTTP.Status.InternalServerError, "timeout");
    } catch(err) {
      next(err);
    }
  }, 1000);
});

export default router;
