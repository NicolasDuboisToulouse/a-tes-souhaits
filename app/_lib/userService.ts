import { spinnerService } from '_components/Spinner';
import { alertService } from '_components/Alerts';
import { User } from '_lib/user';
export { User }

export type LoginInfo = {
  userName: string,
  password: string
}

export type SetUserFunc = (user: User) => void;

// Try to login user with loginInfo
// call onUserLogin on success (nothing on failure)
export function login(loginInfo: LoginInfo, onUserLogin: SetUserFunc): void {
  spinnerService.wait(fetch('api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginInfo) }).
    then(response => response.json().then(data => ({status: response.status, body: data}) )).
    then((answer) => {
      if (answer.status === 200 && answer.body.userName != null) {
        onUserLogin(User.fromObject(answer.body));
      } else {
        if (answer.body.message) {
          alertService.addAlert('La connexion a echouée: ' + answer.body.message);
        } else {
          alertService.addAlert('La connexion a echouée.');
        }
      }
    }));
}

// Try to autologon user
// call onUserLogin either with an invalid user or with the logged-in user
export function autoLogon(onUserLogin: SetUserFunc): void {
  spinnerService.wait(fetch('api/users/autologon').
    then(response => response.json().then(data => ({status: response.status, body: data}) )).
    then((answer) => {
      if (answer.status === 200) {
        const user = User.fromObject(answer.body);
        onUserLogin(user);
      } else {
        if (answer.body.message) console.log(answer.body.message);
        else console.log('Unexpected autologon error');
        onUserLogin(new User());
      }
    }).
    catch(() => {
      console.log('Unexpected autologon error');
      onUserLogin(new User());
    }));
}
