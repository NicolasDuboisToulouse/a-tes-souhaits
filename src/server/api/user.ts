import { UserError, ApplicationError } from "@server/error";
import * as HTTP from "@shared/httpStatus";
import { requestLogin, requestTokenLogin } from "@server/core/protocol";
import * as database from "@server/core/database";
import * as logger from "@shared/logger";
import * as user from "@server/core/user";

requestLogin((loginInfo, request) => {
  const passwordHash = database.select<string>(
    "SELECT passwordHash FROM users WHERE userName=?",
    database.pluck,
  ).get(loginInfo.userName);
  if (!passwordHash || !user.checkPassword(loginInfo.password, passwordHash)) {
    throw new UserError("Nom ou mot de passe invalide.");
  }

  const loggedUser = user.get(loginInfo.userName);
  logger.info("User logged in:", loginInfo.userName);

  if (!request.session) {
    throw new ApplicationError(HTTP.Status.InternalServerError,
      "Server session not correctly setup.");
  }
  request.session.user = loggedUser.userName;

  return loggedUser;
});

requestTokenLogin((request) => {
  if (request.session?.user) {
    const loggedUser = user.get(request.session?.user);
    logger.info("User logged in:", loggedUser.userName);
    return loggedUser;
  }
  return undefined;
});
