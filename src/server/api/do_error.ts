import express from "express";
import * as error from "@server/error";
import * as server from "@server/server";

const router = express.Router();

router.post("/do_error", (
  _req: express.Request,
  _res: express.Response
) => {
  error.send(server.HTTP.Status.BadRequest, "An Error");
});

export default router;
