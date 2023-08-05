'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { setCurrentUser } from 'lib/user';


export default function Login() {

  const router = useRouter();

  type formInput = { userName: string, password: string };
  const { register, handleSubmit, formState } = useForm<formInput>();
  const { errors } = formState;

  async function onSubmit(input: formInput) {
    const request = new Request("login/api", { method: "POST", body: JSON.stringify(input) });

    try {
      const response = await fetch(request);
      const { message, userName } = await response.json();

      if (response.ok != true) {
        if (message != null) throw message;
        else throw "Server error";
      }
      if (userName === null) {
        throw "Server error";
      }
      setCurrentUser({userName: userName});
      router.push('/');
    } catch(err) {
      alert("La connexion a echouée: " + err);
    }
  }

  return (
    <div className="v-form mt-24">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" acceptCharset='UTF-8'>
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
