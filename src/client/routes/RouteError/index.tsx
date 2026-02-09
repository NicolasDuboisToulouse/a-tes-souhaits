import {
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import "../error.css";

export default function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <div className = "error-main">
          {error.status} {error.statusText}
        </div>
        <div className = "error-seconday">{error.data}</div>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <div className = "error-main">Error: {error.message}</div>
        <div className = "error-seconday">The stack trace is:</div>
        <div className = "error-stack">{error.stack}</div>
      </div>
    );
  } else {
    return <div className = "error-main">Unknown Error</div>;
  }
}
