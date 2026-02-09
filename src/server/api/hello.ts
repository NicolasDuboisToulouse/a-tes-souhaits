import express from "express";
import * as server from "@server/server";

const router = express.Router();

router.post("/hello", (
  _req: express.Request,
  res: express.Response
) => {
  server.reply(res, { hello: "world" });
});

export default router;
