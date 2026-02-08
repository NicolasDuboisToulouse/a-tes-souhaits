import { useParams } from "react-router";

export default function Error() {
  const params = useParams();
  return (
    <div style = {{ fontSize: "2em" }}>
      { params.message ? params.message : "Unexpected Error" }
    </div>
  );
}
