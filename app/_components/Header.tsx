'use client'
import { useEffect, useRef, useContext } from 'react';
import { UserContext } from '_components/UserProvider'
import { useRouter } from 'next/navigation'

export function Header() {

  const button = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLUListElement>(null);
  const router = useRouter();

  // Handle popup - popout
  useEffect( () => {
    const handleMenu = (event: MouseEvent) => {
      if (popup.current && button.current) {
        if (button.current.contains(event.target as Node) && popup.current.style.opacity != '1') {
          const popStyle = popup.current.style;
          const popupBox = popup.current.getBoundingClientRect();
          const buttonBox = button.current.getBoundingClientRect();
          popStyle.left = (buttonBox.right - popupBox.width - 5) + 'px';
          popStyle.visibility = "visible";
          popStyle.opacity = "1";
        } else {
          const popStyle = popup.current.style;
          popStyle.opacity = "0";
          popStyle.visibility = "hidden";
        }
      }
    }
    document.addEventListener('click', handleMenu, true);
    return () => {
      document.removeEventListener('click', handleMenu, true);
    };
  }, [button]);


  // Menu content
  const { user, logout } = useContext(UserContext)!;
  type Item = { text: string, target: (() => void)|string};
  const items : Array<Item> = [
    { text: "Déconnetion", target: logout },
    { text: "Changer de mot de passe", target: '/users/password' },
  ];
  if (user.isAdmin) {
    items.push({ text: "Administration", target: '/users/admin' });
  }


  return (
	<div id='header' className="text-end">
      <button ref={button} tabIndex={-1} className="menu rounded-full border-0 m-1 p-1 hover:border-0 focus:border-0 active:border-0 bg-transparent transition-colors">
        {/* https://mui.com/ */}
        <svg className="w-6" viewBox="0 0 24 24" fill="#B44200">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2
          2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
      <ul ref={popup} className="menu text-lg absolute rounded p-0 m-0 opacity-0 invisible transition-opacity
      [&>li]:px-1 [&>li]:m-0 [&>li]:cursor-pointer [&>li>a]:block">
        {items.map( (item: Item) => {
          let action;
          if (typeof item.target === 'string') {
            action = <a onClick={() => router.push(item.target as string)}>{item.text}</a>
          } else {
            action = <a onClick={item.target}>{item.text}</a>
          }
          return ( <li key={item.text}>{action}</li> );
        })
        }
      </ul>
    </div>
  );
}


