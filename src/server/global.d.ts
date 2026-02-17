import express from "express";

declare global {
  // app for tests
  var testApp: express.Express;
  var testData: unknown;
  var testComponent: () => JSX.Element;
}
