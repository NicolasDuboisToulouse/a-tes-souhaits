import { useAppStore } from "@client/services/store";

// perform a request an return a Promise<server object>
// On error, it is handled (message displayed) and the
// promise is rejected.
export function post(
  url: string,
  content?: object,
): Promise<unknown> {

  const appState = useAppStore.getState();
  appState.spinner.add();

  const body = (content) ? JSON.stringify(content) : "{}";
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    .catch(
      (error) => {
        console.log(error);
        if (error instanceof Error) {
          appState.alerts.add(error.message);
        }
        throw error;
      })
    .finally(appState.spinner.remove);
}
