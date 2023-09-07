'use client'
import { useContext, useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { User, UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';


//
// Dialog to add a user
//
function AddUser({isOpened, setOpened, onUserAdded} : {isOpened: boolean, setOpened: (opened: boolean) => void, onUserAdded: () => void} ) {
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


  type formInput = { userName: string, displayName: string };
  const { register, handleSubmit, formState } = useForm<formInput>({mode: 'onSubmit', reValidateMode: 'onSubmit'});
  const { errors } = formState;

  function doAddUser(input: formInput) {
    setOpened(false);
    fetchService.post('/api/users/add', input)
      .then(() => {
        onUserAdded();
      })
      .catch(alertService.handleError);
  }

  return (
    <dialog ref={dialog} className="modal" onCancel={() => setOpened(false)}>
      <div className='v-form'>
      <form ref={form} onSubmit={handleSubmit(doAddUser)} >
        <div className='form-group'>
          <label>Login</label>
          <input type='text' {...register('userName', { required: true })} className={`${errors.userName ? 'invalid' : ''}`} />
        </div>
        <div className='form-group'>
          <label>Display name</label>
          <input type='text' {...register('displayName', { required: true })} className={`${errors.displayName ? 'invalid' : ''}`} />
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

// ManageUsers pannel
export default function ManageUsers() {
  const { user } = useContext(UserContext)!;
  const [ users, setUsers ] = useState<Array<User>>([]);
  const [addUserVisible, setAddUserVisible] = useState<boolean>(false);
  const router = useRouter();

  const updateUsers = useCallback(() => {
    if (user.isAdmin == false) {
      router.push('/401');
    }
    fetchService.post('/api/users/list')
      .then((data) => {
        setUsers(data);
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
    updateUsers();
  }, [updateUsers]);


  if (users.length === 0) return null;

  return (
    <div>
      <div className='text-2xl pb-2'>Users</div>
      <table className='border-2 border-white mb-2'>
        <thead>
          <tr className="border-b-2 border-black bg-orange-300 [&>th]:px-2"><th>Login</th><th>Display</th><th>New</th><th>Admin</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((user) => {
            return (
              <tr className='even:bg-orange-300 [&>td]:p-2' key={user.userName}>
                <td>{user.userName}</td>
                <td>{user.displayName}</td>
                <td className='text-center'>{user.firstLogin ? 'Yes' : 'No'}</td>
                <td className='text-center'>{user.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                  <button title='Toggle Admin' className='mr-2'>Admin</button>
                  <button title='Reset password' className='mr-2'>{String.fromCharCode(0x2605)+String.fromCharCode(0x2605)+String.fromCharCode(0x2605)}</button>
                  <button title='Supprimer' className='mr-2'>{String.fromCharCode(0x2716)}</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <AddUser isOpened={addUserVisible} setOpened={setAddUserVisible} onUserAdded={updateUsers}/>
      <div className='text-center'>
        <button onClick={() => setAddUserVisible(true)}>Ajouter</button>
      </div>
    </div>
  );
}
