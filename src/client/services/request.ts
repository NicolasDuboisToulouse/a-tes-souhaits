import { useAppStore } from "../services/store";

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
          .catch(
            (jsonParseError) => {
              // TODO: handle error
              console.log(jsonParseError);
              return Promise.reject();
            })
    )
    .then(
      (answer) => {
        if (answer.status !== 200) {
          // TODO handle error
          console.log(answer);
        }
        return Promise.resolve(answer.data);
      })
    .catch(
      (fetchError) => {
        // TODO: handle error
        console.log(fetchError);
        return Promise.reject();
      })
    .finally(appState.removeSpinner);
}
