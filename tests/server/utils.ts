import express from "express";
import supertest from "supertest";
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
// Return a function that check response is a protocol error
//
export function isResponseError(errorMessageRe?: string) {
  return (response: object) => {
    if (!("body" in response)) throw new Error("Response without body!");
    const body = response.body as object;
    if (!("errorMessage" in body)) throw new Error("No errorMessage in error body!");
    if (typeof body.errorMessage !== "string") throw new Error("body.errorMessage is not a string");
    if (errorMessageRe && !RegExp(String.raw`${errorMessageRe}`).test(body.errorMessage)) {
      throw new Error(`body.errorMessage is '${body.errorMessage}' wich no match RegEx '${errorMessageRe}'`);
    }
  };
}
