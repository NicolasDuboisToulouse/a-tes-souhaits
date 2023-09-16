'use client'
import { useState } from 'react'
import { Lists } from '_components/Lists'
import { Wishes } from '_components/Wishes'

export default function Main() {
  const [ listId, setListId ] = useState<number>(-1);

  return (
    <div className="main">
      <Lists onListChange={setListId} />
      <Wishes listId={listId} />
    </div>
  );
}
