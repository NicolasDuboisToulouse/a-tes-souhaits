import { useAppStore } from "@client/services/store";

// Error returned by the server
export class ApplicationError {
  readonly status: number;
  readonly msg: string;
  constructor(data: { status: number; msg: string }) {
    this.status = data.status;
    this.msg = data.msg;
  }
}

// Object that depend on the request
type responseDataTtpe = unknown;

// perform a request an return a Promise<responseDataTtpe>
// On error, it is handled (message displayed) and the
// promise is rejected.
export function post(
  url: string,
  content?: object,
): Promise<responseDataTtpe> {

  const appState = useAppStore.getState();
  appState.addSpinner();

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
        const keys = Object.keys(result);
        if (keys.length === 2 && keys.includes("status") && keys.includes("msg")) {
          throw new ApplicationError(result);
        }

        return result;
      },
    )
    .catch(
      (error) => {
        // TODO: handle error
        console.log(error);
        throw error;
      })
    .finally(appState.removeSpinner);
}
