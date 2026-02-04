import * as webServer from "./web";
import * as database from "./database";
import * as error from "./error";

try {
  database.init();
} catch(e) {
  // Stash error to be displayed when server start.
  error.stash(e);
}

webServer.start();
