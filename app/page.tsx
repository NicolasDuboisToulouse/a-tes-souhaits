'use client'
import { useState, useEffect } from 'react'

import { Login } from '_components/Login';
import { User } from '_lib/user';


export default function Main() {
  const [ user, setUser ] = useState<User>(new User());
  const [ isConnecting, setIsConnecting ] = useState<boolean>(true);

  // Try autologon at first load
  useEffect(() => {
    fetch('api/users/autologon').
      then(response => response.json().then(data => ({status: response.status, body: data}) )).
      then((answer) => {
        if (answer.status === 200) {
          setUser(User.fromObject(answer.body));
        } else {
          if (answer.body.message) console.log(answer.body.message);
          else console.log('Unexpected autologon error');
        }
        setIsConnecting(false);
      }).catch(() => {
        console.log('Unexpected autologon error');
        setIsConnecting(false);
      });
  }, []);

  // login user from Login component
  function handleLoginUser(user: User) {
    setUser(user);
  }


  if (isConnecting) {
    return <div>Connection...</div>;
  }
  if (user.isValid() == false) {
    return <Login onLoginUser={handleLoginUser} />
  }
  return <div>Hello {user.userName} !</div>;
}
