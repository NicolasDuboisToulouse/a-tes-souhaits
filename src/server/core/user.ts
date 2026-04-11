import * as bcrypt from "bcrypt";
import * as database from "@server/core/database";
import { User } from "@server/core/protocol";
import { ApplicationError } from "@server/error";
import * as HTTP from "@shared/httpStatus";
import * as logger from "@shared/logger";

type SqlUser = {
  userName: string;
  isAdmin: number;
};

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function checkPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function get(userName: string): User {
  const user = database.select<SqlUser>(
    "SELECT userName, displayName, firstLogin, isAdmin FROM users WHERE userName=?",
  ).get(userName);
  if (!user) {
    logger.error("Try to select an user that don't exists:", userName);
    throw new ApplicationError(HTTP.Status.BadRequest,
      "Unexpected database request");
  }
  return {
    ...user,
    isAdmin: user.isAdmin !== 0,
  };
}
