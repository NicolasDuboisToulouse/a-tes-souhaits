'use client'
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import * as fetchService from '_lib/fetchService';
import { alertService } from '_components/Alerts';
import { Login } from '_components/Login';
import { User } from '_lib/user';
import { Password } from './Password';
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
  const router = useRouter();

  // Perform autologon at first load
  useEffect(() => {
    fetchService.post('/api/users/autologon')
      .then((data) => {
        setUser(User.fromObject(data));
      })
      .catch((error) => {
        setUser(new User());
        alertService.handleError(error, {displayAlert:false});
      });
  }, []);

  // autologon will display a spinner. Do not display anything else.
  if (user == null) {
    return null;
  }

  // Callback function to perform login
  const doLogin: LoginFunc = function(loginInfo: LoginInfo) {
    fetchService.post('/api/users/login', loginInfo)
      .then((data) => {
        if (data.userName == null) throw 'Unexpected error (invalid answer body).';
        setUser(User.fromObject(data));
      })
      .catch(alertService.handleError);
  }

  // Callback to logout current user
  const doLogout = function() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(new User());
    router.push('/');
  }

  // Callback on password change (first login)
  const onPasswordUpdated = function() {
    const newUser = new User(user);
    newUser.firstLogin = false;
    setUser(newUser);
  }

  // Display children only if logged in and password changed
  let content = null;
  if (user.isValid() == false) {
    content = (
      <>
        <div id="header" />
        <Login doLogin={doLogin} />
      </>
    )
  } else if (user.firstLogin) {
    content = (
      <>
        <div id="header" />
        <Password onPasswordUpdated={onPasswordUpdated}/>
      </>
    );
  } else {
    content = children;
  }

  return (
    <UserContext.Provider value={{user, logout: doLogout}}>
      {content}
    </UserContext.Provider>
  )
}
