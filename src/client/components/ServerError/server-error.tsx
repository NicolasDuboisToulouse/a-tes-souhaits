import { useParams } from "react-router";

export default function ServerError() {
  const params = useParams();
  return (
    <div role = "error">
      { params.message ? params.message : "Unexpected Error" }
    </div>
  );
}
