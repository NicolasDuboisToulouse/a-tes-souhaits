import { useAppStore } from "@client/services/store";

// Object that depend on the request
type responseDataTtpe = unknown;

// perform a request an return a Promise<responseDataTtpe>
// On error, it is handled (message displayed) and the
// promise is rejected.
export function get(
  url: string,
  content?: object
): Promise<responseDataTtpe> {

  const appState = useAppStore.getState();

  appState.addSpinner();

  const body = (content) ? JSON.stringify(content) : "{}";

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body })
    .then(
      (response) =>
        response.json()
          .then((data) => ({ status: response.status, data }))
    )
    .then(
      (answer) => {
        if (answer.status !== 200) {
          // TODO handle error
          console.log(answer);
        }
        return answer.data;
      })
    .catch(
      (error) => {
        // TODO: handle error
        console.log(error);
      })
    .finally(appState.removeSpinner);
}
