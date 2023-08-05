'use client';
import { useForm } from 'react-hook-form';

export default function Login() {

  type formInput = { userName: string, password: string };
  const { register, handleSubmit, formState } = useForm<formInput>();
  const { errors } = formState;

  const submit = (input: formInput) => {
    alert("Form validated. User: " + input.userName);
  }

  return (
    <div className="v-form mt-24">
      <form onSubmit={handleSubmit(submit)} autoComplete="off" acceptCharset='UTF-8'>
        <div className="form-group">
          <label>Nom</label>
          <input type="text" {...register("userName", { required: true })} autoComplete="off" autoCapitalize="none" className={`${errors.userName ? 'invalid' : ''}`} />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" {...register("password", { required: true })} className={`${errors.password ? 'invalid' : ''}`} />
        </div>
        <button type="submit">Connection</button>
      </form>
    </div>
  );
}
