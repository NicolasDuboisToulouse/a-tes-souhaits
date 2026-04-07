import { requestEmpty } from "@server/core/protocol";

requestEmpty(() => {
  console.log("request empty");
});
