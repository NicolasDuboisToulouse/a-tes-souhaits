import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import Spinner from "@client/components/Spinner";
import Alerts from "@client/components/Alerts";
import Routes from "@client/routes";

// Global CSS
import "./colors.css";
import "./global.css";
import "./main.css";

function Index() {
  return (
    <>
      <div id = "header" />
      <Spinner />
      <Alerts />
      <Routes />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Index />
  </StrictMode>,
);
