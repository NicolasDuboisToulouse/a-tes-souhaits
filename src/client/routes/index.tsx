import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

// Routes
import RouteMain from "./Main";
import RouteServerError from "./ServerError";
import RouteRouteError from "./RouteError";

/* v8 ignore start main cannot be tested */

const router = createBrowserRouter([
  {
    index: true,
    path: "/",
    ErrorBoundary: RouteRouteError,
    Component: RouteMain,
  },
  {
    path: "/error/:message",
    Component: RouteServerError,
  },
]);

export default function Routes() {
  return (
    <div id = "main" className = "h-center">
      <RouterProvider router = {router} />
    </div>
  );
}

/* v8 ignore stop */
