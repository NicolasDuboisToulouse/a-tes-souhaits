import { useForm } from "react-hook-form";
import {
  LoginInfo,
  requestLogin,
  handleRequestError,
} from "@client/protocol";
import { useAppStore } from "@client/services/store";

export default function Login() {
  const userSet = useAppStore(state => state.user.set);
  const { register, handleSubmit, formState } = useForm<LoginInfo>();
  const { errors } = formState;

  function submit(loginInfo: LoginInfo) {
    requestLogin(loginInfo)
      .then(userSet)
      .catch(handleRequestError);
  }

  return (
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
      <div className = "button-group">
        <button type = "submit">Connexion</button>
      </div>
    </form>
  );
}
