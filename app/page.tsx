'use client'
import { useContext } from 'react'
import { UserContext, UserProvider } from '_components/UserProvider'

function Welcome() {
  const { user, logout } = useContext(UserContext)!;
  return (
    <div className="main">
      Hello {user.displayName} !
      {user.isAdmin? ' (administrator)' : ''}
      {user.firstLogin? ' (first login)' : ''}
      <button onClick={logout}>Logout</button>
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
