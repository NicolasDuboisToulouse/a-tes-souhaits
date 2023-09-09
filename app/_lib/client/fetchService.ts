import { spinnerService } from '_components/Spinner';

export async function post(url: string, content?: Object) : Promise<any> {
  spinnerService.addWaiter();

  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) })
    .then(response =>
      response.json()
        .then(data => ({status: response.status, data: data}))
        .catch(() =>  ({status: response.status, data: {}}))
    )
    .then((answer) => {
      if (answer.status != 200) {
        throw new Error(answer.data.message || `Unexpected error [HTTP ${answer.status}].`);
      }
      return Promise.resolve(answer.data);
    })
    .finally(spinnerService.removeWaiter);
}
