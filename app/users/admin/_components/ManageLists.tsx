import { useRef, useContext, useState, useCallback, useEffect, ChangeEvent } from 'react'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'
import { User, UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';

type List = {
  id:        number,
  title:     string,
  userNames: Array<string>,
};

//
// Dialog to add a list
//
function AddList({isOpened, setOpened, onListAdded} : {isOpened: boolean, setOpened: (opened: boolean) => void, onListAdded: () => void} ) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpened) {
      form.current?.reset();
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialog, form, isOpened]);


  type formInput = { title: string };
  const { register, handleSubmit, formState } = useForm<formInput>({mode: 'onSubmit', reValidateMode: 'onSubmit'});
  const { errors } = formState;

  function doAddList(input: formInput) {
    setOpened(false);
    fetchService.post('/api/lists/add', input)
      .then(() => {
        onListAdded();
      })
      .catch(alertService.handleError);
  }

  return (
    <dialog ref={dialog} className="modal" onCancel={() => setOpened(false)}>
      <div className='v-form'>
      <form ref={form} onSubmit={handleSubmit(doAddList)} >
        <div className='form-group'>
          <label>Title</label>
          <input type='text' {...register('title', { required: true })} className={`${errors.title ? 'invalid' : ''}`} />
        </div>
        <div className="button-group">
          <button type='submit'>Ajouter</button>
          <button type='button' onClick={() => setOpened(false)}>Annuler</button>
        </div>
      </form>
      </div>
    </dialog>
  );
}

// ManageLists pannel
export default function ManageLists({users} : {users: Array<User>}) {
  const { user } = useContext(UserContext)!;
  const [ lists, setLists ] = useState<Array<List>>([]);
  const [addListVisible, setAddListVisible] = useState<boolean>(false);
  const router = useRouter();

  // Refresh page on list list change
  const updateLists = useCallback(() => {
    if (user.isAdmin == false) {
      router.push('/401');
    }
    fetchService.post('/api/lists/list')
      .then((data) => {
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
  }, [updateLists, users]);

  // Delete list
  function deleteList(id: number) {
    fetchService.post('/api/lists/del', { id })
      .then(() => {
        updateLists();
      })
      .catch(alertService.handleError);
  }

  // Add owner
  function addOwner(event: ChangeEvent<HTMLSelectElement>, id: number) {
    fetchService.post('/api/lists/owner/add', { listId: id, userName: event.target.value})
      .finally(() => {
        event.target.value = '-1';
      })
      .then(() => {
        updateLists();
      })
      .catch(alertService.handleError);
  }

  // Delete owner
  function delOwner(event: ChangeEvent<HTMLSelectElement>, id: number) {
    fetchService.post('/api/lists/owner/del', { listId: id, userName: event.target.value})
      .finally(() => {
        event.target.value = '-1';
      })
      .then(() => {
        updateLists();
      })
      .catch(alertService.handleError);
  }

  // userDisplayNames : userName -> displayName
  const userDisplayNames: any = {};
  for (const anyUser of users) {
    userDisplayNames[anyUser.userName as any] = anyUser.displayName;
  }

  return (
    <div className='pb-2'>
      <div className='text-2xl pb-2'>Lists</div>
      <table className='border-2 border-white mb-2 w-full'>
        <thead>
          <tr className="border-b-2 border-black bg-orange-300 [&>th]:px-2"><th>Id</th><th>Titles</th><th>Owners</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {lists.map((list) => {
            return (
              <tr className='even:bg-orange-300 [&>td]:p-2' key={list.id}>
                <td>{list.id}</td>
                <td>{list.title}</td>
                <td>{list.userNames.map(userName => userDisplayNames[userName]).join(', ')}</td>
                <td>
                  <div className='flex flex-wrap gap-1'>
                    <select onChange={(event) => addOwner(event, list.id)}>
                      <option hidden value='-1'>Add owner</option>
                      {users.filter(user => list.userNames.includes(user.userName!) == false).map((user) => {
                        return <option key={user.userName} value={user.userName}>{user.displayName}</option>
                      })}
                    </select>
                    <select onChange={(event) => delOwner(event, list.id)}>
                      <option hidden value='-1'>Del owner</option>
                      {list.userNames.map((userName) => {
                        return <option key={userName} value={userName}>{userDisplayNames[userName]}</option>
                      })}
                    </select>
                    <button className='flex-1 whitespace-nowrap' title='Supprimer'  onClick={() => deleteList(list.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <AddList isOpened={addListVisible} setOpened={setAddListVisible} onListAdded={updateLists}/>
      <div className='text-center'>
        <button onClick={() => setAddListVisible(true)}>Ajouter</button>
      </div>
    </div>
  );
}
