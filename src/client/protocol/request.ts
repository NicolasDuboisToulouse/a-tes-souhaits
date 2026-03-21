import { useAppStore } from "@client/services/store";

// perform a request an return a Promise<server object>
// On error, it is handled (message displayed) and the
// promise is rejected.
export function post(
  url: string,
  content?: object,
): Promise<object> {

  const appState = useAppStore.getState();
  appState.spinner.add();

  const body = (content) ? JSON.stringify(content) : "{}";
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body })
    .then(
      (response) => {
        if (!response.headers.has("Content-type") ||
          !/json/.test(response.headers.get("Content-type")!)) {
          throw new Error("Invalid content type: " + response.headers.get("Content-type"));
        }
        return response.json();
      },
    )
    .then(
      (result) => {
        if (result.errorMessage) throw new Error(result.errorMessage);
        return result;
      },
    )
    .finally(appState.spinner.remove);
}

//
// Display an alert on Error
//
/* v8 ignore start this function is always mocked*/
export function handleRequestError(error: unknown) {
  console.error(error);
  if (error instanceof Error) {
    useAppStore.getState().alerts.add(error.message);
  }
}
/* v8 ignore stop */
