'use client'
import { useState } from 'react';

// spinnerService
// Note: This service need te Spinner to be mounted to works. (And it does not support unmount)
export const spinnerService = {
  addWaiter : () => { },              // Add a waiter. Start annimation for the first one.
  removeWaiter : () => { },           // Remove a waiter. Stop annimation for the last one.
}

// The Spinner itself
export function Spinner() {
  const [waitCounter, setWaitCounter] = useState<number>(0);

  function addWaiter() {
    setWaitCounter(waitCounter => waitCounter + 1);
  }

  function removeWaiter() {
    setWaitCounter(waitCounter => waitCounter - 1);
  }

  spinnerService.addWaiter = addWaiter;
  spinnerService.removeWaiter = removeWaiter;

  if (waitCounter <= 0) {
    return null;
  }

  return (
    <div className='w-fit z-[100] screen-center'>
      {/* Many thanks to https://github.com/SamHerbert/SVG-Loaders */}
      <svg width="4em" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" fill="#F26D21" stroke="#F7EFE2">
        <circle cx="15" cy="15" r="15">
          <animate attributeName="r" from="15" to="15"
            begin="0s" dur="0.8s"
            values="15;9;15" calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="fill-opacity" from="1" to="1"
            begin="0s" dur="0.8s"
            values="1;.5;1" calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="15" r="9" fillOpacity="0.3">
          <animate attributeName="r" from="9" to="9"
            begin="0s" dur="0.8s"
            values="9;15;9" calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="fill-opacity" from="0.5" to="0.5"
            begin="0s" dur="0.8s"
            values=".5;1;.5" calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle cx="105" cy="15" r="15">
          <animate attributeName="r" from="15" to="15"
            begin="0s" dur="0.8s"
            values="15;9;15" calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="fill-opacity" from="1" to="1"
            begin="0s" dur="0.8s"
            values="1;.5;1" calcMode="linear"
            repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
