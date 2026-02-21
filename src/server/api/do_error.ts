import { requestDoError } from "@server/protocol";
import { ApplicationError } from "@server/error";
import * as HTTP from "@shared/httpStatus";

requestDoError(() => {
  throw new ApplicationError(HTTP.Status.BadRequest, "An Error");
});
