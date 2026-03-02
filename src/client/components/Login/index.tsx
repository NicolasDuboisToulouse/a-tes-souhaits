import { useForm } from "react-hook-form";
import { LoginInfo, requestLogin } from "@client/protocol";
import { useAppStore } from "@client/services/store";

export default function Login() {
  const userSet = useAppStore(state => state.user.set);
  const { register, handleSubmit, formState } = useForm<LoginInfo>();
  const { errors } = formState;

  function submit(loginInfo: LoginInfo) {
    requestLogin(loginInfo).then(user => userSet(user));
  }

  return (
    <div className = "h-center">
      <form onSubmit = {handleSubmit(submit)} acceptCharset = "UTF-8">
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
