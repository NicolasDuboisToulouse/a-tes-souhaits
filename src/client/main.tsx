import React from "react";
import ReactDOM from "react-dom/client";

async function hello() {
  const response = await fetch("hello", {
    method: "POST",
    body: JSON.stringify({ username: "example" }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.text();
  console.log("resp", data);
}

async function dont_exist() {
  const response = await fetch("dont_exist", {
    method: "POST",
    body: JSON.stringify({ username: "example" }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.text();
  console.log("resp", data);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div>
      <div>A tes souhaits !</div>
      <div><button onClick = {hello}>hello</button></div>
      <div><button onClick = {dont_exist}>dont_exist</button></div>
    </div>
  </React.StrictMode>,
);
