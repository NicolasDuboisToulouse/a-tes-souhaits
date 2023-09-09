import { useRef, useContext, useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'
import { UserContext } from '_components/UserProvider'
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
export default function ManageLists() {
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

      <AddList isOpened={addListVisible} setOpened={setAddListVisible} onListAdded={updateLists}/>
      <div className='text-center'>
        <button onClick={() => setAddListVisible(true)}>Ajouter</button>
      </div>
    </div>
  );
}
