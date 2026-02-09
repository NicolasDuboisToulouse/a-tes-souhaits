import * as webServer from "@server/server";
import * as database from "@server/database";
import * as error from "@server/error";

try {
  database.init();
} catch(e) {
  // Stash error to be displayed when server start.
  error.stash(e);
}

webServer.start();
