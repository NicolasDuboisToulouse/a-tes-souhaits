'use client'
import { useState } from 'react';

export const alertService = {
  addAlert : (message: string) => { alert(message) }
}

export function Alerts() {
  type AlertInfo = { id:number, message: string, fading_out: boolean };
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [nextId, setNextId] = useState<number>(0);

  alertService.addAlert = addAlert;

  function addAlert(message: string) {
    const newAlert = { id: nextId, message, fading_out: false };
    setNextId(nextId => nextId + 1);
    setAlerts(alerts => [...alerts, newAlert ]);
    setTimeout(() => { closeAlert(newAlert); }, 5000);
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
    <div className="h-screen">
      <div className="w-fit z-[100] right-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
    </div>
  );
}

