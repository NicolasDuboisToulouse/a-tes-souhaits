'use client'
import { useContext, useState } from 'react'
import { UserContext } from '_components/UserProvider'
import { Lists } from '_components/Lists'

export default function Main() {
  const { user } = useContext(UserContext)!;
  const [ listId, setListId ] = useState<number>(-1);

  return (
    <div className="main">
      <Lists onListChange={setListId} />
      <div>Hello {user.displayName} !</div>
      <div>Liste selectionnée: {listId}</div>
    </div>
  );
}
