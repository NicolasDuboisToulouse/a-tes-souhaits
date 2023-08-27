import { useForm } from 'react-hook-form';
import { LoginInfo, LoginFunc } from '_components/UserProvider'

export function Login({doLogin} : {doLogin: LoginFunc}) {
  type formInput = LoginInfo;
  const { register, handleSubmit, formState } = useForm<formInput>();
  const { errors } = formState;

  return (
    <div className='v-form absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
      <form onSubmit={handleSubmit(doLogin)} autoComplete='off' acceptCharset='UTF-8'>
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
