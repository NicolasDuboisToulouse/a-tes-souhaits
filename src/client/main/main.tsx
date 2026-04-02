import { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { handleRequestError, requestTokenLogin } from "@client/protocol";
import { useAppStore } from "@client/services/store";
import Login from "@client/components/Login";
import Debug from "@client/components/Debug/debug";
import ServerError from "@client/components/ServerError";
import Page404 from "@client/components/Page404";

// Global CSS
import "./colors.css";
import "./global.css";
import "./main.css";

export default function Main() {
  const [ doTokenLogin, setDoTokenLogin ] = useState(true);
  const userState = useAppStore(state => state.user);

  useEffect(() => {
    if (doTokenLogin) {
      requestTokenLogin()
        .then(userState.set)
        .finally(() => setDoTokenLogin(false))
        .catch(handleRequestError);
    }
  }, [ userState, doTokenLogin ]);

  // Do not render anything while performing token login.
  // The token login request will display a spinner.
  if (doTokenLogin) return null;

  // Display login page if no user connected
  // By this way, we keep the route once logged-in
  if (userState.info === undefined) return <Login />;

  return (
    <Routes>
      <Route path = "" element = {<Debug />} />
      <Route path = "/debug" element = {<Debug />} />
      <Route path = "/error/:message" element = {<ServerError />} />
      <Route path = "*" element = {<Page404 />} />
    </Routes>
  );
}
