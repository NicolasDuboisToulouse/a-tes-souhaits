import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import Main from "./components/Main";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);
