import { useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';

type List = {
  id:        number,
  title:     string,
  userNames: Array<string>,
};

export default function ManageLists() {
  const { user } = useContext(UserContext)!;
  const [ lists, setLists ] = useState<Array<List>>([]);
  const router = useRouter();

  // Refresh page on list list change
  const updateLists = useCallback(() => {
    if (user.isAdmin == false) {
      router.push('/401');
    }
    fetchService.post('/api/lists/list')
      .then((data) => {
        console.log(data);
        setLists(data);
      })
      .catch((error) => {
        if (error instanceof fetchService.FetchError && error.status == 401) {
          router.push('/401');
        } else {
          alertService.handleError(error);
        }
      });
  }, [router, user]);

  useEffect(() => {
    updateLists();
  }, [updateLists]);

  if (lists.length === 0) return null;

  return (
    <div className='pb-2'>
      <div className='text-2xl pb-2'>Lists</div>
      <table className='border-2 border-white mb-2'>
        <thead>
          <tr className="border-b-2 border-black bg-orange-300 [&>th]:px-2"><th>Id</th><th>Titles</th><th>Owners</th></tr>
        </thead>
        <tbody>
          {lists.map((list) => {
            return (
              <tr className='even:bg-orange-300 [&>td]:p-2' key={list.id}>
                <td>{list.id}</td>
                <td>{list.title}</td>
                <td> </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='text-center'>
        <button>Ajouter</button>
      </div>
    </div>
  );
}
