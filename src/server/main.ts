import { startServer } from "./api/init";
import database from "./database/database";
import * as error from "./api/error/error";

try {
  database.init();
} catch(e) {
  // Stash error to be displayed when server start.
  error.stash(e);
}

startServer();
