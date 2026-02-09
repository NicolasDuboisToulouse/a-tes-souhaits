import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import Spinner from "@client/components/Spinner";

// Global CSS
import "./colors.css";
import "./global.css";
import "./main.css";

// Routes
import RouteDebug from "./Debug";
import RouteServerError from "./ServerError";
import RouteRouteError from "./RouteError";

const router = createBrowserRouter([
  {
    index: true,
    path: "/",
    ErrorBoundary: RouteRouteError,
    Component: RouteDebug,
  },
  {
    path: "/error/:message",
    Component: RouteServerError,
  },
]);

// Main page
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <div id = "header" />
    <Spinner />
    <div id = "main" className = "h-center">
      <RouterProvider router = {router} />
    </div>
  </StrictMode>,
);
