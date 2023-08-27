'use client'
import { useContext } from 'react'
import { UserContext, UserProvider } from '_components/UserProvider'

function Welcome() {
  const { user } = useContext(UserContext);
  return (
    <div>
      Hello {user.displayName} !
      {user.isAdmin? ' (administrator)' : ''}
      {user.firstLogin? ' (first login)' : ''}
    </div>
  );
}

export default function Main() {
  return (
    <UserProvider>
      <Welcome/>
    </UserProvider>
  );
}
