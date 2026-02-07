import Spinner from "../Spinner";
import * as request from "../../services/request";
import "./colors.css";
import "./global.css";
import "./main.css";

export default function Main() {
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
    <>
      <div id = "header" />
      <Spinner />
      <div id = "main" className = "h-center">
        <div>A tes souhaits !</div>
        <div><button onClick = {hello}>hello</button></div>
        <div><button onClick = {error}>error</button></div>
        <div><button onClick = {dont_exist}>dont_exist</button></div>
        <div><button onClick = {timeout}>timeout</button></div>
      </div>
    </>
  );
}
