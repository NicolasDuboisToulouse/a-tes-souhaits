/*
 * Log-in form
 */
import { useForm } from 'react-hook-form';

import { alertService } from 'components/Alerts';
import { User } from 'lib/user';

// Callback on log-on
type LoginUserFunc = (user: User) => void;

export function Login({onLoginUser } : { onLoginUser : LoginUserFunc}) {

  type formInput = { userName: string, password: string };
  const { register, handleSubmit, formState } = useForm<formInput>();
  const { errors } = formState;

  function onSubmit(input: formInput) {
    fetch('api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }).
      then(response => response.json().then(data => ({status: response.status, body: data}) )).
      then((answer) => {
        const { message, userName, isAdmin } = answer.body;

        if (answer.status === 200 && userName != null) {
          onLoginUser(User(userName, isAdmin));
        } else {
          if (message) alertService.addAlert('La connexion a echouée: ' + message);
          else alertService.addAlert('La connexion a echouée.');
        }
      });
  }

  return (
    <div className='v-form absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' acceptCharset='UTF-8'>
        <div className='form-group'>
          <label>Nom</label>
          <input type='text' {...register('userName', { required: true })} autoComplete='off' autoCapitalize='none' className={`${errors.userName ? 'invalid' : ''}`} />
        </div>
        <div className='form-group'>
          <label>Mot de passe</label>
          <input type='password' {...register('password', { required: true })} className={`${errors.password ? 'invalid' : ''}`} />
        </div>
        <button type='submit'>Connection</button>
      </form>
    </div>
  );
}
