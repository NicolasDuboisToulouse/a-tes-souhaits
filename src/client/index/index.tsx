import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { useAppStore } from "@client/services/store";
import Spinner from "@client/components/Spinner";
import Alerts from "@client/components/Alerts";
import Login from "@client/components/Login";
import Routes from "@client/routes";

// Global CSS
import "./colors.css";
import "./global.css";
import "./main.css";

/* v8 ignore start */

function Index() {
  const userInfo = useAppStore(state => state.user.info);

  const index = userInfo ? <Routes /> : <Login />;

  return (
    <>
      <div id = "header" />
      <Spinner />
      <Alerts />
      {index}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Index />
  </StrictMode>,
);

/* v8 ignore stop */
