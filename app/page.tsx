'use client'
import { useState } from 'react'
import { Lists } from '_components/Lists'
import { WishList } from '_components/WishList'

export default function Main() {
  const [ listId, setListId ] = useState<number>(-1);

  return (
    <div className="main">
      <Lists onListChange={setListId} />
      <WishList listId={listId} />
    </div>
  );
}
