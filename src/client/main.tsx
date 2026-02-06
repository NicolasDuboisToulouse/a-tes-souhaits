import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import Spinner from "./components/Spinner";
import * as request from "./services/request";

function Main() {
  async function hello() {
    const data = await request.get("hello");
    console.log("resp", data);
  }

  async function dont_exist() {
    const data = await request.get("dont_exist", { username: "example" });
    console.log("resp", data);
  }

  async function error() {
    const data = await request.get("error", { username: "example" });
    console.log("resp", data);
  }

  async function timeout() {
    const data = await request.get("timeout");
    console.log("resp", data);
  }

  return (
    <div>
      <div>A tes souhaits !</div>
      <div><button onClick = {hello}>hello</button></div>
      <div><button onClick = {error}>error</button></div>
      <div><button onClick = {dont_exist}>dont_exist</button></div>
      <div><button onClick = {timeout}>timeout</button></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Spinner />
    <Main />
  </StrictMode>,
);
