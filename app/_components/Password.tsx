import { useContext } from 'react'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'
import { UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/fetchService';
import { alertService } from '_components/Alerts';

// if onPasswordUpdated is not provided, will call router.push('/')
export function Password({onPasswordUpdated = undefined} : {onPasswordUpdated?: (() => void) | undefined}) {
  const router = useRouter();

  const { user } = useContext(UserContext)!;

  type formInput = { password: string, confirmPassword: string };
  const { register, handleSubmit, formState, getValues } = useForm<formInput>({mode: 'onSubmit', reValidateMode: 'onSubmit'});
  const { errors } = formState;

  function doChangePassword(input: formInput) {
    fetchService.post('/api/users/password', input)
      .then(() => {
        alertService.addAlert('Mot de passe changé.');
        if (onPasswordUpdated) {
          onPasswordUpdated();
        } else {
          router.push('/');
        }
      })
      .catch(alertService.handleError);
  }

  function comparePasswords(value: string) {
    if (value === getValues("confirmPassword")) return true;
    alertService.addAlert('Vos saisies ne sont pas identiques !');
    return false;
  }

  if (user == null || user.userName == null) {
    // We shall not be here
    return null;
  }

  return (
    <div className='v-form'>
      <div className="pb-10">
        <div>Bienvenue {user.displayName}.</div>
        { (user.firstLogin)?
          <div>S&apos;il vous plait, changez de mot de passe.</div> :
          <div>Vous pouvez changer de mot de passe.</div> }
      </div>
      <form onSubmit={handleSubmit(doChangePassword)} autoComplete='off' acceptCharset='UTF-8'>
        <div className='form-group'>
          <label>Nouveau mot de passe</label>
          <input type='password' {...register('password', { required: true, validate: comparePasswords })} className={`${errors.password ? 'invalid' : ''}`} />
        </div>
        <div className='form-group'>
          <label>Confirmation</label>
          <input type='password' {...register('confirmPassword', { required: true })} className={`${errors.confirmPassword ? 'invalid' : ''}`} />
        </div>
        <div className="button-group">
          <button type='submit'>Modifier</button>
          { (user.firstLogin)? '' : <button type='button' onClick={() => {router.push('/')}}>Annuler</button> }
        </div>
      </form>
    </div>
  );
}
