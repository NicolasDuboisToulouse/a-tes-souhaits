import * as protocol from "@client/protocol";

export default function Debug() {
  async function hello() {
    const data = await protocol.requestHello({ message: "example" });
    console.log("resp", data);
  }

  async function empty() {
    await protocol.requestEmpty();
    console.log("request done");
  }

  async function dont_exist() {
    const data = await protocol.requestDontExists();
    console.log("resp", data);
  }

  async function do_error() {
    protocol.requestDoError().catch(() => {
      console.log("An error occurs");
    });
    console.log("Do error done.");
  }

  async function timeout() {
    protocol.requestTimeout().catch(() => {
      console.log("An error occurs");
    });
    console.log("Timeout done.");
  }

  return (
    <>
      <div>A tes souhaits !</div>
      <div><button onClick = {hello}>hello</button></div>
      <div><button onClick = {empty}>empty</button></div>
      <div><button onClick = {do_error}>do_error</button></div>
      <div><button onClick = {dont_exist}>dont_exist</button></div>
      <div><button onClick = {timeout}>timeout</button></div>
    </>
  );
}
