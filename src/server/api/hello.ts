import { requestHello } from "@server/protocol";

requestHello((helloReq) => {
  console.log(helloReq);
  return { message: "hello!" };
});
