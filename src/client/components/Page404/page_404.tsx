import { useLocation } from "react-router";

export default function Page404() {
  const location = useLocation();
  return (
    <div role = "error">Page not found: {location.pathname}</div>
  );
}
