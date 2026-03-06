import express from "express";
import cors from "cors";
import { once as eventOnce } from "node:events";
import * as request from "./request";
import { Server } from "http";

let baseURL: string;
let server: Server;

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
    res.json({ errorMessage: "An ServerError" });
  });

  app.post("/test/invalidJson", (
    _req: express.Request,
    res: express.Response,
  ) => {
    res
      .set("Content-type", "application/json")
      .send("{,,");
  });

  server = app.listen(() => {
    app.emit("listening");
  });
  server.on("close", () => { console.log("Test Server is closed."); });
  await eventOnce(app, "listening");
  console.log("Test server is listening on ", server.address());

  const address = server.address();
  if (!address || typeof address !== "object" || typeof address.port !== "number") {
    throw new Error("Unexpected server address !");
  }

  baseURL = "http://127.0.0.1:" + address.port;
});

afterAll(() => {
  server.close();
});


//
// Tests
//
describe("Request validation", () => {

  it("Request valid", async() => {
    return request.post(baseURL + "/test/validJson")
      .then(
        (data) => {
          expect(data).toStrictEqual({ hello: "world" });
          return true;
        });
  });

  it("Request no Content-Type", async() => {
    return expect(request.post(baseURL + "/test/invalidContentType")).rejects.toThrow();
  });

  it("Request ServerError", async() => {
    return expect(request.post(baseURL + "/test/serverError"))
      .rejects.toStrictEqual(new Error("An ServerError"));
  });

  it("Request invalid json", async() => {
    return expect(request.post(baseURL + "/test/invalidJson")).rejects.toThrow();
  });

});
