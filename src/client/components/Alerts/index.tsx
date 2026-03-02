import { useAppStore } from "@client/services/store";
import "./alert.css";
import { useState } from "react";

type Alert = {
  id: number;
  message: string;
  fadingOut: boolean;
};

export default function Alerts() {
  const [ nextId, setNextId ] = useState<number>(0);
  const [ alerts, setAlerts ] = useState<Alert[]>([]);
  const newMessages = useAppStore(state => state.alerts.newMessages);
  const clearMessages = useAppStore(state => state.alerts.clear);

  function removeAlert(id: number) {
    setAlerts(alerts => alerts.filter(a => a.id !== id));
  }

  function fadeoutAlert(id: number) {
    setAlerts(alerts => {
      setTimeout(() => { removeAlert(id); }, 300);
      return alerts.map(a => (a.id !== id) ? a : { ...a, fadingOut: true });
    });
  }

  if (newMessages.length) {
    const newAlerts = [ ...alerts ];
    let newNextId = nextId;
    for (const message of newMessages) {
      const id = newNextId++;
      newAlerts.push({ id, message, fadingOut: false });
      setTimeout(() => { fadeoutAlert(id); }, 5000);
    }
    setNextId(newNextId);
    setAlerts(newAlerts);
    clearMessages();
  }

  return (
    <div className = "absolute-center-child" data-testid = "alerts-container">
      { alerts.map(alert => {
        return (
          <div
            key = {alert.id}
            className = {"alert" + (alert.fadingOut ? " fadeout" : "")}
            data-testid = {"alert-" + alert.id.toString()}
          >
            <button onClick = {() => { removeAlert(alert.id); }} title = "Fermer">
              <span className = "icon icon-close" />
            </button>
            <span>{alert.message}</span>
          </div>
        );
      })}
    </div>
  );
}
