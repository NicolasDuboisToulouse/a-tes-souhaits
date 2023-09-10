import { spinnerService } from '_components/Spinner';

export class FetchError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
};

export async function post(url: string, content?: Object) : Promise<any> {
  spinnerService.addWaiter();

  const body = (content)? JSON.stringify(content) : '{}';

  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
    .then(response =>
      response.json()
        .then(data => ({status: response.status, data: data}))
        .catch(() =>  ({status: response.status, data: {}}))
    )
    .then((answer) => {
      if (answer.status != 200) {
        throw new FetchError(answer.data.message || `Unexpected error [HTTP ${answer.status}].`, answer.status);
      }
      return Promise.resolve(answer.data);
    })
    .finally(spinnerService.removeWaiter);
}
