import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useAppStore } from "@client/services/store";
import "./password.css";

export default function Password() {
  const navigate = useNavigate();
  const userInfo = useAppStore(state => state.user.info);
  const addAlert = useAppStore(state => state.alerts.add);

  type formInput = { password: string; confirmPassword: string };
  const { register, handleSubmit, formState, getValues } = useForm<formInput>({ mode: "onSubmit", reValidateMode: "onSubmit" });
  const { errors } = formState;

  // Note: user shall have been handled in parent container
  if (!userInfo) return null;

  function doChangePassword(input: formInput) {
    /*
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
     */
  }

  function comparePasswords(value: string) {
    if (value === getValues("confirmPassword")) return true;
    addAlert("Vos saisies ne sont pas identiques !");
    return false;
  }

  return (
    <form onSubmit = {handleSubmit(doChangePassword)} autoComplete = "off" acceptCharset = "UTF-8">
      <div>Bienvenue {userInfo.displayName}.</div>
      <div id = "passwordHeader">
        { (userInfo.firstLogin)
          ? <div>Choisissez votre mot de passe.</div>
          : <div>Vous pouvez changer de mot de passe.</div> }
      </div>
      <div className = "form-group">
        <label>Nouveau mot de passe</label>
        <input type = "password" {...register("password", { required: true, validate: comparePasswords })} className = {`${errors.password ? "invalid" : ""}`} />
      </div>
      <div className = "form-group">
        <label>Confirmation</label>
        <input type = "password" {...register("confirmPassword", { required: true })} className = {`${errors.confirmPassword ? "invalid" : ""}`} />
      </div>
      <div className = "button-group">
        <button type = "submit">Modifier</button>
        { (userInfo.firstLogin === false) ? "" : <button type = "button" onClick = {() => { navigate("/"); }}>Annuler</button> }
      </div>
    </form>
  );
}
