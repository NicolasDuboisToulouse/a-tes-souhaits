import * as webServer from "@server/server";
import * as database from "@server/database";
import * as error from "@server/error";

/* v8 ignore start main cannot be tested */
try {
  database.init();
} catch(e) {
  // Stash error to be displayed when server start.
  error.stash(e);
}

webServer.start();
/* v8 ignore stop */
