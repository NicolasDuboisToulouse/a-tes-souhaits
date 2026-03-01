import { useAppStore } from "@client/services/store";
import * as HTTP from "@shared/httpStatus";

// Error returned by the server
export class ApplicationError extends Error {
  readonly status: HTTP.StatusType;

  constructor(data: { status: HTTP.StatusType; msg: string }) {
    const msg = (data.msg.length)
      ? data.msg
      : "Erreur " + data.status.toString() + ": " + HTTP.getMessage(data.status);
    super(msg);
    this.name = "ApplicationError";
    this.status = data.status;
  }
}

// Object that depend on the request
type responseDataTtpe = object;

// perform a request an return a Promise<responseDataTtpe>
// On error, it is handled (message displayed) and the
// promise is rejected.
export function post(
  url: string,
  content?: object,
): Promise<responseDataTtpe> {

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
        const keys = Object.keys(result);
        if (keys.length === 2 && keys.includes("status") && keys.includes("msg")) {
          throw new ApplicationError(result);
        }

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
