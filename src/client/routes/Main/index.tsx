import * as request from "@client/services/request";

export default function Debug() {
  async function hello() {
    const data = await request.post("/api/hello", { username: "example" });
    console.log("resp", data);
  }

  async function dont_exist() {
    const data = await request.post("/api/dont_exist", { username: "example" });
    console.log("resp", data);
  }

  async function do_error() {
    const data = await request.post("/api/do_error", { username: "example" });
    console.log("resp", data);
  }

  async function timeout() {
    const data = await request.post("/api/timeout");
    console.log("resp", data);
  }

  return (
    <>
      <div>A tes souhaits !</div>
      <div><button onClick = {hello}>hello</button></div>
      <div><button onClick = {do_error}>do_error</button></div>
      <div><button onClick = {dont_exist}>dont_exist</button></div>
      <div><button onClick = {timeout}>timeout</button></div>
    </>
  );
}
