import express from "express";
import supertest from "supertest";
import * as HTTP from "@shared/httpStatus";
export type JsonResponse = { httpStatus: number; json: object };
//
// Execute a POST request and return the result
// if arg is an object or unset, it will be  converted to json an a json request will be performed.
// if arg is false, a non-json request will be performed.
// if dump is true, the supertest object will be dump on console (debug)
//
export function clientRequest(
  app: express.Express,
  route: string,
  arg?: object | boolean,
  dump = false,
) {
  const json = arg === undefined || arg === true || typeof arg === "object";
  const content = typeof arg === "object" ? arg : undefined;
  const body = json ? JSON.stringify(content) : undefined;

  return supertest(app).post(route)
    .set("Content-Type", json ? "application/json" : "text/html")
    .send(body)
    .expect(
      (supertestTest) => {
        if (dump) {
          console.log("supertest:", supertestTest);
        }
      },
    );
}

//
// Return a function that check response is a valid json error
//
export function isJsonError(status: HTTP.StatusType, msgRe?: string) {
  return (response: object) => {
    if (!("body" in response)) throw new Error("Response withut body!");

    const body = response.body as object;
    if (!("status" in body)) throw new Error("No status in error body!");
    if (!("msg" in body)) throw new Error("No msg in error body!");
    if ("data" in body) throw new Error("data present in error body!");
    if (body.status !== status) throw new Error(`body.status ${body.status} != ${status}`);
    if (typeof body.msg !== "string") throw new Error("body.msg is not a string");
    if (msgRe && !RegExp(String.raw`${msgRe}`).test(body.msg)) {
      throw new Error(`body.msg is '${body.msg}' wich no match RegEx '${msgRe}'`);
    }
  };
}
