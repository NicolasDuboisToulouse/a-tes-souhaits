import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import Alerts from "@client/components/Alerts";
import Header from "@client/components/Header";
import Spinner from "@client/components/Spinner";
import Main from "./main";

/* v8 ignore start */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Spinner />
      <Alerts />
      <div id = "main">
        <Main />
      </div>
    </BrowserRouter>
  </StrictMode>,
);
/* v8 ignore stop */
