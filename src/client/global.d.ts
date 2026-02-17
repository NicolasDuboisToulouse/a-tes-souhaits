import { Server } from "http";

declare global {
  var testServer: Server;
  var testBaseUrl: string;
}
