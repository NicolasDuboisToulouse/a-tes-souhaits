import express from "express";
import logger from "@server/logger";

const router = express.Router();

router.post("/hello", (
  req: express.Request,
  res: express.Response
) => {
  logger.info("req", req.body);
  res.json({ hello: "world" });
});

export default router;
