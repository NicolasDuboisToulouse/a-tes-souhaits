import { requestDoError } from "@server/core/protocol";
import { ApplicationError } from "@server/error";
import * as HTTP from "@shared/httpStatus";

requestDoError(() => {
  throw new ApplicationError(HTTP.Status.BadRequest, "An Error");
});
