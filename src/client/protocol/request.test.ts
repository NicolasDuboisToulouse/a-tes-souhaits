import express from "express";
import cors from "cors";
import { once as eventOnce } from "node:events";
import * as request from "./request";

//
// Launch test server
//
beforeAll(async() => {
  const app = express();
  app.set("env", process.env.NODE_ENV);
  app.use(cors());
  app.use(express.json());

  app.post("/test/validJson", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res.json({ hello: "world" });
  });

  app.post("/test/invalidContentType", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res
      .set("Content-type", "text/html")
      .send("<div>hello, world!</div>");
  });

  app.post("/test/serverError", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res.json({ status: 404, msg: "An ServerError" });
  });

  app.post("/test/invalidJson", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res
      .set("Content-type", "application/json")
      .send("{,,");
  });

  const server = app.listen(() => {
    app.emit("listening");
  });
  server.on("close", () => { console.log("Test Server is closed."); });
  await eventOnce(app, "listening");
  console.log("Test server is listening on ", server.address());

  const address = server.address();
  if (!address || typeof address !== "object" || typeof address.port !== "number") {
    throw new Error("Unexpected server address !");
  }

  global.testServer = server;
  global.testBaseUrl = "http://127.0.0.1:" + address.port;
});

afterAll(() => {
  global.testServer.close();
});


//
// Tests
//
describe("Request validation", () => {

  it("Request valid", async() => {
    return request.post(global.testBaseUrl + "/test/validJson")
      .then(
        (data) => {
          expect(data).toStrictEqual({ hello: "world" });
          return true;
        });
  });

  it("Request no Content-Type", async() => {
    return expect(request.post(global.testBaseUrl + "/test/invalidContentType")).rejects.toThrow();
  });

  it("Request ServerError", async() => {
    return expect(request.post(global.testBaseUrl + "/test/serverError"))
      .rejects.toStrictEqual(new request.ApplicationError({ status: 404, msg: "An ServerError" }));
  });

  it("Request invalid json", async() => {
    return expect(request.post(global.testBaseUrl + "/test/invalidJson")).rejects.toThrow();
  });

});
