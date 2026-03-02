import { useParams } from "react-router";
import "../error.css";

export default function ServerError() {
  const params = useParams();
  return (
    <div role = "ServerError" className = "error-main">
      { params.message ? params.message : "Unexpected Error" }
    </div>
  );
}
