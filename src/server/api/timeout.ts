import { requestTimeout } from "@server/core/protocol";
import { ApplicationError } from "@server/error";
import * as HTTP from "@shared/httpStatus";

requestTimeout(() => {
  let _sum = 0;
  for (let i = 0; i < 1000000000; i++) {
    _sum += i;
  }
  throw new ApplicationError(HTTP.Status.InternalServerError, "timeout");
});
