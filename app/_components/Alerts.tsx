'use client'
import { useState } from 'react';

export const alertService = {
  addAlert : (message: string) => { alert(message) },
  handleError,
}

function handleError(error: any, options : { displayAlert?: boolean } = { displayAlert: true } ) {
  const message = (typeof error === 'string')? error : (error && error.message) || 'Unexpected error.';
  console.log(message);
  if ((options.displayAlert === false) == false) {
    alertService.addAlert(message);
  }
}

export function Alerts() {
  type AlertInfo = { id:number, message: string, fading_out: boolean };
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [nextId, setNextId] = useState<number>(0);

  alertService.addAlert = addAlert;

  function addAlert(message: string) {
    setTimeout(() => {
      const newAlert = { id: nextId, message, fading_out: false };
      setNextId(nextId => nextId + 1);
      setAlerts(alerts => [...alerts, newAlert ]);
      setTimeout(() => { closeAlert(newAlert); }, 5000);
    }, 0);
  }

  function closeAlert(alert: AlertInfo) {
    const fadeAlert = { ...alert, fading_out: true };
    setAlerts(alerts => alerts.map(alert => alert.id === fadeAlert.id ? fadeAlert : alert ));
    setTimeout(() => { deleteAlert(fadeAlert); }, 300);
  }

  function deleteAlert(alert: AlertInfo) {
    setAlerts(alerts => alerts.filter(m_alert => m_alert.id != alert.id));
  }

  return (
    <div className="w-fit z-[100] screen-center">
      {alerts.map(
        (alert, index) => {
          return (
            <div key={index} className={`alert ${alert.fading_out?'fadeout':''}`}>
              <button autoFocus onClick={() => {closeAlert(alert)} }>{String.fromCharCode(0x2716)}</button>
              {alert.message}
            </div>
          );
        })
      }
    </div>
  );
}

