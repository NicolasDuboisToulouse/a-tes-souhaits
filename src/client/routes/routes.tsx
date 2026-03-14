import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

// Routes
import RouteDebug from "./Debug/debug";
import RouteServerError from "./ServerError/server-error";
import RouteRouteError from "./RouteError/route-error";

/* v8 ignore start */

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

export default function Routes() {
  return (
    <div id = "main" className = "h-center">
      <RouterProvider router = {router} />
    </div>
  );
}

/* v8 ignore stop */
