import { requestHello } from "@server/core/protocol";

requestHello((helloReq) => {
  console.log(helloReq);
  return { message: "hello!" };
});
