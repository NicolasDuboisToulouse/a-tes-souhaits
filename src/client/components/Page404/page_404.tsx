import { useLocation } from "react-router";

/* v8 ignore start */
export default function Page404() {
  const location = useLocation();
  return (
    <div role = "error">Page not found: {location.pathname}</div>
  );
}
/* v8 ignore stop */
