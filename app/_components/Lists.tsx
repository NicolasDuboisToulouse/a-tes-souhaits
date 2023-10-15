import { useState, useEffect, ChangeEvent } from 'react'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';

type List = {
  id:        number,
  title:     string,
};

type ListInfos = {
  lists: Array<List>,
  myListId: number,
};

export function Lists({onListChange} : {onListChange: (listId:number) => void}) {
  const [ listInfos, setListInfos ] = useState<ListInfos>({lists:[], myListId:-1});

  useEffect(() => {
    fetchService.post('/api/lists/list')
      .then((listInfos: ListInfos) => {
        setListInfos(listInfos);
        onListChange(listInfos.myListId);
      })
      .catch(alertService.handleError)
  }, [onListChange]);

  function handleListChange(event: ChangeEvent<HTMLSelectElement>) {
    const listId = parseInt(event.target.value, 10);
    onListChange(isNaN(listId)? -1 : listId);
  }

  if (listInfos.lists.length === 0) return null;

  return (
    <div className='text-center text-xl mb-6'>
      <select defaultValue={listInfos.myListId} onChange={handleListChange}>
        <option hidden value='-1'>Choisir une liste</option>
        {listInfos.lists.sort((l1, l2) => l1.title.localeCompare(l2.title)).map((list) => {
          return <option key={list.id} value={list.id}>{list.title}</option>;
        })}
      </select>
    </div>
  );
}
