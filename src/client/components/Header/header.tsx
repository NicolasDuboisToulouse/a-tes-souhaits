import { useCallback, useEffect, useRef, useState } from "react";
import "./header.css";
import { useAppStore } from "@client/services/store";


type MenuAction = () => void;

type MenuItem = {
  text: string;
  action: MenuAction;
  role: string;
};

export default function Header() {
  const [ menuVisible, setMenuVisible ] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const userState = useAppStore(state => state.user);

  // Handle click outside menu
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (menuButtonRef.current && menuRef.current &&
      !menuButtonRef.current.contains(event.target as Node) &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setMenuVisible(false);
    }
  }, [ setMenuVisible ]);

  useEffect(() => {
    if (menuVisible) {
      document.addEventListener("mousedown", handleMouseDown);
      return () => { document.removeEventListener("mousedown", handleMouseDown); };
    }
  }, [ menuVisible, handleMouseDown ]);

  function handleButtonClick() {
    setMenuVisible(!menuVisible);
  }

  // Menu actions
  function handleMenuAction(action: MenuAction) {
    setMenuVisible(false);
    action();
  }

  function logout() {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    userState.set(undefined);
  }

  // No user, no menu
  if (userState.info === undefined) return <div role = "header" />;

  // Menu content
  const items: MenuItem[] = [
    { text: "Déconnexion", action: logout, role: "logout" },
    /*    { text: "Changer de mot de passe", action() { console.log("Pass"); } }, */
  ];
  /*
  if (user.isAdmin && pathname != '/users/admin') {
      items.push({ text: "Administration", target: '/users/admin' });
  }
  if (pathname != '/') {
      items.push({ text: "Acceuil", target: '/' });
  }
  if (pathname != '/about') {
    items.push({ text: "À propos", target: '/about' });
  }
   */

  return (
    <div role = "header">
      <button onClick = {handleButtonClick} ref = {menuButtonRef} tabIndex = {-1} >
        {/* https://mui.com/ */}
        <svg viewBox = "0 0 24 24">
          <path
            d = {`M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0
            2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2
            .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z`}
          />
        </svg>
      </button>
      <div>
        <ul ref = {menuRef} className = { menuVisible ? "visible" : "hidden" }>
          {
            items.map(item => {
              return (
                <li key = {item.role}>
                  <a
                    role = {item.role}
                    onClick = {() => handleMenuAction(item.action)}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })
          }
        </ul>
      </div>
    </div>
  );
}
