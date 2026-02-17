import { useParams } from "react-router";
import "../error.css";

export default function ServerError() {
  const params = useParams();
  return (
    <div className = "error-main" data-testid = "serverError">
      { params.message ? params.message : "Unexpected Error" }
    </div>
  );
}
