'use client'
import { useState, useEffect } from 'react'

import { Login } from '_components/Login';
import * as userService from '_lib/userService'


export default function Main() {
  const [ user, setUser ] = useState<userService.User|undefined>();

  // perform autologon at first load
  useEffect(() => {
    userService.autoLogon(setUser);
  }, []);

  if (user == null) {
    return null;
  }

  if (user.isValid() == false) {
    return <Login onUserLogin={setUser} />
  }

  return (
    <div>
      Hello {user.displayName} !
      {user.isAdmin? ' (administrator)' : ''}
      {user.firstLogin? ' (first login)' : ''}
    </div>
  );
}
