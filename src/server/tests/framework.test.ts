import express from "express";
import * as utils from "@tests/server/utils";
import * as server from "@server/server";
import * as error from "@server/error";

beforeAll(async() => {
  const router = express.Router();

  //
  // Routes for reply tests
  //
  router.post("/test/replyEmpty", (
    _req: express.Request,
    res: express.Response,
  ) => {
    server.reply(res);
  });

  router.post("/test/replyObject", (
    _req: express.Request,
    res: express.Response,
  ) => {
    server.reply(res, { hello: "world" });
  });

  //
  // Add routes for error.application tests
  //
  router.post("/test/applicationFromApp", (
    _req: express.Request,
    res: express.Response,
  ) => {
    server.replyError(
      res,
      error.ApplicationError.from(
        new error.ApplicationError(
          server.HTTP.Status.BadRequest,
          "An error",
        ),
      ),
    );
  });

  router.post("/test/applicationFromError", (
    _req: express.Request,
    res: express.Response,
  ) => {
    server.replyError(
      res,
      error.ApplicationError.from(new Error("An error")),
      false,
    );
  });

  router.post("/test/applicationFromOther", (
    _req: express.Request,
    res: express.Response,
  ) => {
    server.replyError(
      res,
      error.ApplicationError.from({ err: "An error" }),
    );
  });

  //
  // Add routes for throwing error tests
  //
  router.post("/test/throw", (
    _req: express.Request,
    _res: express.Response,
  ) => {
    throw new error.ApplicationError(
      server.HTTP.Status.InternalServerError,
      "Throwed error",
    );
  });

  global.testApp = await server.createExpressApp(router);
});


//
// Tests
//
describe("Global framewok tests", () => {

  it("Base API error", async() => {

    await utils.get(global.testApp, "/api/hello", false)
      .expect(server.HTTP.Status.Found)
      .expect("Content-type", /text/)
      .expect("location", /^\/error\//);

    await utils.get(global.testApp, "/api/do/not/exist")
      .expect(server.HTTP.Status.NotFound)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(server.HTTP.Status.NotFound));

    await utils.get(global.testApp, "/api/test/throw", true)
      .expect(server.HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        server.HTTP.Status.InternalServerError,
        "Throwed error",
      ));

  });

  it("Base valid API request", async() => {

    await utils.get(global.testApp as express.Express, "/api/test/replyEmpty")
      .expect(server.HTTP.Status.Ok)
      .expect("Content-type", /application\/json/)
      .expect({});

    await utils.get(global.testApp, "/api/test/replyObject")
      .expect(server.HTTP.Status.Ok)
      .expect("Content-type", /application\/json/)
      .expect({ hello: "world" });
  });

  it("Check ApplicationError", async() => {

    await utils.get(global.testApp, "/api/test/applicationFromApp")
      .expect(server.HTTP.Status.BadRequest)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        server.HTTP.Status.BadRequest,
        "An error",
      ));

    await utils.get(global.testApp, "/api/test/applicationFromError")
      .expect(server.HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        server.HTTP.Status.InternalServerError,
        "An error",
      ));

    await utils.get(global.testApp, "/api/test/applicationFromOther")
      .expect(server.HTTP.Status.InternalServerError)
      .expect("Content-type", /application\/json/)
      .expect(utils.isJsonError(
        server.HTTP.Status.InternalServerError,
        "Other Error: {\"err\":\"An error\"}",
      ));
  });

  it("Stashed error test", async() => {
    error.stash(new error.ApplicationError(server.HTTP.Status.Unauthorized, "Stashed error"));
    await utils.get(global.testApp, "/", false)
      .expect(server.HTTP.Status.Found)
      .expect("Content-type", /text/)
      .expect("location", /^\/error\//);

  });

});
