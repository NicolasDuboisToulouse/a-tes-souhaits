import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import Spinner from "@client/components/Spinner";

// Global CSS
import "./colors.css";
import "./global.css";
import "./main.css";

// Routes
import { createBrowserRouter, RouterProvider } from "react-router";
import RouteDebug from "./Debug";
import RouteError from "./Error";

const router = createBrowserRouter([
  {
    index: true,
    path: "/",
    Component: RouteDebug,
  },
  {
    path: "/error/:message",
    Component: RouteError,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <div id = "header" />
    <Spinner />
    <div id = "main" className = "h-center">
      <RouterProvider router = {router} />
    </div>
  </StrictMode>,
);
