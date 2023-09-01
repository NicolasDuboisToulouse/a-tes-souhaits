'use client'
import { useContext } from 'react'
import { UserContext } from '_components/UserProvider'

export default function Main() {
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
