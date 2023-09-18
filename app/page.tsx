'use client'
import { useState } from 'react'
import { Lists } from '_components/Lists'
import { WishListManager } from '_components/WishListManager'

export default function Main() {
  const [ listId, setListId ] = useState<number|undefined>(undefined);

  return (
    <div className="main">
      <Lists onListChange={setListId} />
      <WishListManager listId={listId} />
    </div>
  );
}
