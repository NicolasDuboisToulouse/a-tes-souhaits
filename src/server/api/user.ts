import { ApplicationError } from "@server/error";
import { requestLogin } from "@server/protocol";
import * as HTTP from "@shared/httpStatus";
import * as database from "@server/database";
import * as logger from "@shared/logger";
import * as user from "@server/user";

requestLogin((loginInfo) => {
  const passwordHash = database.select<string>(
    "SELECT passwordHash FROM users WHERE userName=?",
    database.pluck,
  ).get(loginInfo.userName);
  if (!passwordHash || !user.checkPassword(loginInfo.password, passwordHash)) {
    // TODO: not an app error !
    throw new ApplicationError(HTTP.Status.Unauthorized,
      "Nom ou mot de passe invalide.");
  }

  const loggedUser = user.get(loginInfo.userName);
  logger.info("User logged in:", loginInfo.userName);

  return loggedUser;
});
