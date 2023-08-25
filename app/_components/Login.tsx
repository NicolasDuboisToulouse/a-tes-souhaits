/*
 * Log-in form
 */
import { useForm } from 'react-hook-form';

import { alertService } from '_components/Alerts';
import { User } from '_lib/user';

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
        if (answer.status === 200 && answer.body.userName != null) {
          onLoginUser(User.fromObject(answer.body));
        } else {
          if (answer.body.message) alertService.addAlert('La connexion a echouée: ' + answer.body.message);
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
