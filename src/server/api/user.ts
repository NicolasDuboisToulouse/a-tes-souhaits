import { UserError } from "@server/error";
import { requestLogin } from "@server/protocol";
import * as database from "@server/database";
import * as logger from "@shared/logger";
import * as user from "@server/user";

requestLogin((loginInfo) => {
  const passwordHash = database.select<string>(
    "SELECT passwordHash FROM users WHERE userName=?",
    database.pluck,
  ).get(loginInfo.userName);
  if (!passwordHash || !user.checkPassword(loginInfo.password, passwordHash)) {
    throw new UserError("Nom ou mot de passe invalide.");
  }

  const loggedUser = user.get(loginInfo.userName);
  logger.info("User logged in:", loginInfo.userName);

  return loggedUser;
});
