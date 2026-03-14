import {
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import "../error.css";

export default function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div role = "RouteError">
        <div role = "MainText" className = "error-main">
          {error.status} {error.statusText}
        </div>
        <div role = "SecondaryText" className = "error-seconday">{error.data}</div>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div role = "RouteError">
        <div role = "MainText" className = "error-main">Error: {error.message}</div>
        <div role = "SecondaryText" className = "error-seconday">The stack trace is:</div>
        <div role = "ErrorStack" className = "error-stack">{error.stack}</div>
      </div>
    );
  } else {
    return <div role = "RouteError" className = "error-main">Unknown Error</div>;
  }
}
