import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { useAppStore } from "@client/services/store";
import Header from "@client/components/Header";
import Spinner from "@client/components/Spinner";
import Alerts from "@client/components/Alerts";
import Login from "@client/components/Login";
import Routes from "@client/routes";

// Global CSS
import "./colors.css";
import "./global.css";
import "./main.css";

/* v8 ignore start */

function Main() {
  const userInfo = useAppStore(state => state.user.info);

  const main = userInfo ? <Routes /> : <Login />;

  return (
    <>
      <Header />
      <Spinner />
      <Alerts />
      {main}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

/* v8 ignore stop */
