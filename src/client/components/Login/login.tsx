import { useForm } from "react-hook-form";
import {
  LoginInfo,
  requestLogin,
  requestTokenLogin,
  handleRequestError,
} from "@client/protocol";
import { useAppStore } from "@client/services/store";
import { useEffect, useState } from "react";

export default function Login() {
  const userSet = useAppStore(state => state.user.set);
  const [ waitTokenLogin, setWaitTokenLogin ] = useState(true);
  const { register, handleSubmit, formState } = useForm<LoginInfo>();
  const { errors } = formState;

  useEffect(() => {
    requestTokenLogin()
      .then(userSet)
      .finally(() => setWaitTokenLogin(false))
      .catch(handleRequestError);
  }, [ userSet ]);

  function submit(loginInfo: LoginInfo) {
    requestLogin(loginInfo)
      .then(userSet)
      .catch(handleRequestError);
  }

  // Do not render login from while performing token login.
  // The token login request will display a sinner.
  if (waitTokenLogin) return null;

  return (
    <div className = "h-center">
      <form name = "login" onSubmit = {handleSubmit(submit)} acceptCharset = "UTF-8">
        <div className = "form-group">
          <label>
            Nom{" "}
            <input
              type = "text"
              {...register("userName", { required: true })}
              autoCapitalize = "none"
              className = {`${errors.userName ? "invalid" : ""}`}
              autoFocus = {true}
            />
          </label>
        </div>
        <div className = "form-group">
          <label>
            Mot de passe{" "}
            <input
              type = "password"
              {...register("password", { required: true })}
              className = {`${errors.password ? "invalid" : ""}`}
            />
          </label>
        </div>
        <button type = "submit">Connexion</button>
      </form>
    </div>
  );
}
