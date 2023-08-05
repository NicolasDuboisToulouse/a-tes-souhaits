'use client'

import { currentUser } from 'lib/user'
import { redirect } from 'next/navigation'

export default function Main() {
  if (currentUser.name === null) {
    redirect('/login');
  }
  return <div>Hello {currentUser.name} !</div>;
}
