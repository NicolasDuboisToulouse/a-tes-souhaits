import express from "express";
import { clientRequest, isResponseError } from "@tests/server/utils";
import { createExpressApp } from "@server/core/server";
import * as HTTP from "@shared/httpStatus";
import { ApplicationError, stash } from "@server/error";

let expressApp: express.Express;

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
    throw new ApplicationError(
      HTTP.Status.BadRequest,
      "An error",
    );
  });

  router.post("/test/applicationFromError", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw new Error("An error");
  });

  router.post("/test/applicationFromOther", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw { err: "An error" };
  });

  //
  // Add routes for throwing error tests
  //
  router.post("/test/throw", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw new ApplicationError(
      HTTP.Status.InternalServerError,
      "Throwed error",
    );
  });

  expressApp = await createExpressApp(router);
});


//
// Tests
//
describe("Global framewok tests", () => {

  it("Base API error", async() => {

    await clientRequest(expressApp, "/api/hello", false)
      .expect(HTTP.Status.Found)
      .expect("Content-type", /text/)
      .expect("location", /^\/error\//);

    await clientRequest(expressApp, "/api/do/not/exist")
      .expect(HTTP.Status.NotFound)
      .expect("Content-type", /application\/json/)
      .expect(isResponseError());

    await clientRequest(expressApp, "/api/test/throw", true)
      .expect(HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(isResponseError("Throwed error"));

  });

  it("Base valid API request", async() => {

    await clientRequest(expressApp as express.Express, "/api/test/replyEmpty")
      .expect(HTTP.Status.Ok)
      .expect("Content-type", /application\/json/)
      .expect({});

    await clientRequest(expressApp, "/api/test/replyObject")
      .expect(HTTP.Status.Ok)
      .expect("Content-type", /application\/json/)
      .expect({ hello: "world" });
  });

  it("Check ApplicationError", async() => {

    await clientRequest(expressApp, "/api/test/applicationFromApp")
      .expect(HTTP.Status.BadRequest)
      .expect("Content-type", /application\/json/)
      .expect(isResponseError("An error"));

    await clientRequest(expressApp, "/api/test/applicationFromError")
      .expect(HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(isResponseError("An error"));

    await clientRequest(expressApp, "/api/test/applicationFromOther")
      .expect(HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(isResponseError("Unexpected internal error"));
  });

  it("Stashed error test", async() => {
    stash(new ApplicationError(HTTP.Status.Unauthorized, "Stashed error"));
    await clientRequest(expressApp, "/", false)
      .expect(HTTP.Status.Found)
      .expect("Content-type", /text/)
      .expect("location", /^\/error\//);

  });

});
