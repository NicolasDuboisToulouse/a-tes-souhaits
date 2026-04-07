import fs from "fs";
import path from "path";
import * as database from "@server/core/database";
import * as user from "@server/core/user";

export * from "@server/core/database";

function getDatabaseDir(testId: string): string {
  if (typeof process.env.TESTS_TEMP_DIR !== "string") throw new Error("env TESTS_TEMP_DIR is unset!");
  return path.join(process.env.TESTS_TEMP_DIR, "database" + "_" + testId);
}

export function create(testId: string) {
  const database_dir = getDatabaseDir(testId);
  fs.rmSync(database_dir, { force: true, recursive: true });
  database.init(database_dir);

  const addUserStmt = database.statement(
    "INSERT INTO users (userName, displayName, passwordHash, firstLogin, isAdmin) VALUES (?, ?, ?, ?, ?)",
  );

  addUserStmt.run("user1", "user1", user.hashPassword("password1"), 0, 1);
  addUserStmt.run("user2", "user2", user.hashPassword("password2"), 1, 0);
}

export function remove(testId: string) {
  const database_dir = getDatabaseDir(testId);
  database.close();
  fs.rmSync(database_dir, { force: true, recursive: true });
}
