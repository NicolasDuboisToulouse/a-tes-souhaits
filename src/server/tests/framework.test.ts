import express from "express";
import * as utils from "@tests/server/utils";
import * as HTTP from "@shared/httpStatus";
import * as error from "@server/error";
import { createExpressApp } from "@server/server";

beforeAll(async() => {
  const router = express.Router();

  //
  // Routes for reply tests
  //
  router.post("/test/replyEmpty", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res.status(HTTP.Status.Ok).json({});
  });

  router.post("/test/replyObject", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res.status(HTTP.Status.Ok).json({ hello: "world" });
  });

  //
  // Add routes for error.application tests
  //
  router.post("/test/applicationFromApp", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw error.ApplicationError.from(
      new error.ApplicationError(
        HTTP.Status.BadRequest,
        "An error",
      ),
    );
  });

  router.post("/test/applicationFromError", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw error.ApplicationError.from(new Error("An error"));
  });

  router.post("/test/applicationFromOther", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw error.ApplicationError.from({ err: "An error" });
  });

  //
  // Add routes for throwing error tests
  //
  router.post("/test/throw", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw new error.ApplicationError(
      HTTP.Status.InternalServerError,
      "Throwed error",
    );
  });

  global.testApp = await createExpressApp(router);
});


//
// Tests
//
describe("Global framewok tests", () => {

  it("Base API error", async() => {

    await utils.get(global.testApp, "/api/hello", false)
      .expect(HTTP.Status.Found)
      .expect("Content-type", /text/)
      .expect("location", /^\/error\//);

    await utils.get(global.testApp, "/api/do/not/exist")
      .expect(HTTP.Status.NotFound)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(HTTP.Status.NotFound));

    await utils.get(global.testApp, "/api/test/throw", true)
      .expect(HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        HTTP.Status.InternalServerError,
        "Throwed error",
      ));

  });

  it("Base valid API request", async() => {

    await utils.get(global.testApp as express.Express, "/api/test/replyEmpty")
      .expect(HTTP.Status.Ok)
      .expect("Content-type", /application\/json/)
      .expect({});

    await utils.get(global.testApp, "/api/test/replyObject")
      .expect(HTTP.Status.Ok)
      .expect("Content-type", /application\/json/)
      .expect({ hello: "world" });
  });

  it("Check ApplicationError", async() => {

    await utils.get(global.testApp, "/api/test/applicationFromApp")
      .expect(HTTP.Status.BadRequest)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        HTTP.Status.BadRequest,
        "An error",
      ));

    await utils.get(global.testApp, "/api/test/applicationFromError")
      .expect(HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        HTTP.Status.InternalServerError,
        "An error",
      ));

    await utils.get(global.testApp, "/api/test/applicationFromOther")
      .expect(HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        HTTP.Status.InternalServerError,
        "Other Error: {\"err\":\"An error\"}",
      ));
  });

  it("Stashed error test", async() => {
    error.stash(new error.ApplicationError(HTTP.Status.Unauthorized, "Stashed error"));
    await utils.get(global.testApp, "/", false)
      .expect(HTTP.Status.Found)
      .expect("Content-type", /text/)
      .expect("location", /^\/error\//);

  });

});
