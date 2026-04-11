import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "@client/services/store";
import "./header.css";


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
  const navigate = useNavigate();

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
    { text: "Acceuil", action() { navigate("/"); }, role: "gotoHome" },
    { text: "Déconnexion", action: logout, role: "logout" },
    { text: "Changer de mot de passe", action() { navigate("/changePassword"); }, role: "changePassword" },
    { text: "À propos", action() { navigate("/about"); }, role: "gotoAbout" },
  ];
  if (userState.info.isAdmin) {
    items.push({ text: "Administration", action() { navigate("/admin"); }, role: "gotoAdmin" });
  }

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
        <ul role = "menuHeader" ref = {menuRef} className = { menuVisible ? "visible" : "hidden" }>
          {
            items.map(item => {
              return (
                <li key = {item.role} role = {item.role} onClick = {() => handleMenuAction(item.action)}>
                  <span>{item.text}</span>
                </li>
              );
            })
          }
        </ul>
      </div>
    </div>
  );
}
