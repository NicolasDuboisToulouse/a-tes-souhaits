import * as protocol from "@client/protocol";
import { useAppStore } from "@client/services/store";

export default function Debug() {
  const userInfo = useAppStore(state => state.user.info);
  const alertsAdd = useAppStore(state => state.alerts.add);

  async function hello() {
    protocol.requestHello({ message: "example" })
      .then(data => { console.log("resp", data); return data; })
      .catch(protocol.handleRequestError);
  }

  async function empty() {
    protocol.requestEmpty()
      .then(data => { console.log("resp", data); return data; })
      .catch(protocol.handleRequestError);
  }

  async function dont_exist() {
    protocol.requestDontExists()
      .then(data => { console.log("resp", data); return data; })
      .catch(protocol.handleRequestError);
  }

  async function do_error() {
    protocol.requestDoError()
      .then(data => { console.log("resp", data); return data; })
      .catch(protocol.handleRequestError);
  }

  async function timeout() {
    protocol.requestTimeout()
      .then(data => { console.log("resp", data); return data; })
      .catch(protocol.handleRequestError);
  }

  function addAlert() {
    alertsAdd("An alert");
    alertsAdd("An alert2");
  }

  if (userInfo === undefined) return null;

  return (
    <>
      <div>A tes souhaits !</div>
      <div><button onClick = {addAlert}>addAlert</button></div>
      <div><button onClick = {hello}>hello</button></div>
      <div><button onClick = {empty}>empty</button></div>
      <div><button onClick = {do_error}>do_error</button></div>
      <div><button onClick = {dont_exist}>dont_exist</button></div>
      <div><button onClick = {timeout}>timeout</button></div>
    </>
  );
}
