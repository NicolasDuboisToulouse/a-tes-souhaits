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

  // Refresh page on user list change
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

  // reset user password
  function resetPassword(user: User) {
    fetchService.post('/api/users/password', { userName: user.userName, password: user.userName })
      .then(() => {
        alertService.addAlert('Mot de passe réinitialisé.');
      })
      .catch(alertService.handleError);
  }

  // Change administration right
  function toggleAdmin(user: User) {
    fetchService.post('/api/users/grant', { userName: user.userName, isAdmin: user.isAdmin == false })
      .then(() => {
        updateUsers();
      })
      .catch(alertService.handleError);
  }

  // Delete user
  function deleteUser(user: User) {
    fetchService.post('/api/users/del', { userName: user.userName })
      .then(() => {
        updateUsers();
      })
      .catch(alertService.handleError);
  }


  if (users.length === 0) return null;

  return (
    <div className='pb-2'>
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
                  <div className='flex flex-wrap gap-1'>
                    <button className='flex-1 whitespace-nowrap' title='Supprimer'  onClick={() => deleteUser(user)}>Supprimer</button>
                    <button className='flex-1 whitespace-nowrap' title='Reset password' onClick={() => resetPassword(user)}>Reset password</button>
                    <button className='flex-1 whitespace-nowrap' title='Toggle Admin' onClick={() => toggleAdmin(user)}>{user.isAdmin ? 'Ungrant' : 'Grant'}</button>
                  </div>
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
