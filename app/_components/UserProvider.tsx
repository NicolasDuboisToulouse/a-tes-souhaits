import { createContext, useState, useEffect } from 'react';
import { spinnerService } from '_components/Spinner';
import { alertService } from '_components/Alerts';
import { Login } from '_components/Login';
import { User } from '_lib/user';
export type { User }

// UserContext that can be retrived by useContext(UserContext)
interface UserContextType {
  user: User;
  logout: () => void;
}
export const UserContext = createContext<UserContextType|undefined>(undefined);


// Types for login callback
export type LoginInfo = {
  userName: string,
  password: string
}
export type LoginFunc = (loginInfo: LoginInfo) => void;


//
// UserProvider
//  * perform autologin & login
//  * provide UserContext to its children
//
export function UserProvider({children} : {children: React.ReactNode}) {
  const [ user, setUser ] = useState<User|undefined>();

  // Perform autologon at first load
  useEffect(() => {
    spinnerService.wait(fetch('api/users/autologon').
      then(response => response.json().then(data => ({status: response.status, body: data}) )).
      then((answer) => {
        if (answer.status === 200) {
          const user = User.fromObject(answer.body);
          setUser(user);
        } else {
          if (answer.body.message) console.log(answer.body.message);
        else console.log('Unexpected autologon error');
          setUser(new User());
        }
      }).
      catch(() => {
        console.log('Unexpected autologon error');
        setUser(new User());
      }));
  }, []);

  // autologon will display a spinner. Do not display anything else.
  if (user == null) {
    return null;
  }

  // Callback function to perform login
  const doLogin: LoginFunc = function(loginInfo: LoginInfo) {
    spinnerService.wait(fetch('api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginInfo) }).
      then(response => response.json().then(data => ({status: response.status, body: data}) )).
      then((answer) => {
        if (answer.status === 200 && answer.body.userName != null) {
          setUser(User.fromObject(answer.body));
        } else {
          if (answer.body.message) {
            alertService.addAlert('La connexion a echouée: ' + answer.body.message);
          } else {
            alertService.addAlert('La connexion a echouée.');
          }
        }
      }));
  }

  // Callback to logout current user
  const doLogout = function() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(new User());
  }

  // Display either childen or login form
  return (
    <UserContext.Provider value={{user, logout: doLogout}}>
      { (user.isValid())? children : <Login doLogin={doLogin} /> }
    </UserContext.Provider>
  )
}
