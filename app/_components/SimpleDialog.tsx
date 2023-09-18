'use client'
import { useRef, useEffect } from 'react'
import { createRoot, Root } from 'react-dom/client'

// Define the dialog container that **HAS TO** be defined somewhere in the DOM
export function SimpleDialogContainer() {
  return <div id='simple-dialog' />;
}

// Content: what to display
// bouttons: array of (label, callback). without a callback, the button will just close the dialog.
type DialogProperties = {
  content: JSX.Element|string,
  buttons: Array<{label: string, onClick?: (() => void)}>
};

// Display the dialog according to its properties
export function simpleDialog(properties: DialogProperties) {
  if (! root) {
    const target = document.getElementById('simple-dialog');
    if (! target) return; // SimpleDialogContainer is not mounted...
    root = createRoot(target);
  }
  root.render(<SimpleDialog visible={true} properties={properties} />);
}

function hideDialog() {
  if (root) {
    root.render(<SimpleDialog visible={false} />);
  }
}

// The dialog itself
function SimpleDialog({visible, properties} : { visible: boolean, properties?: DialogProperties }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (visible) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [visible]);

  function handleClick(callback: (() => void)|undefined) {
    hideDialog();
    if (callback) callback();
  }

  if (! properties) return null;

  return (
    <dialog ref={dialog} className="modal"  onCancel={hideDialog}>
      {properties.content}
      <div className="button-group mt-4">
        {properties.buttons.map((button, id) => {
          return <button key={id} type='button' onClick={() => handleClick(button.onClick)}>{button.label}</button>
        })}
      </div>
    </dialog>
  );
}

// The container as React Root
let root: Root|undefined = undefined;
