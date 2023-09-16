import { useContext, useState, useCallback, useEffect } from 'react'
import { UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { WishEditor } from './WishEditor';
import { Wishes, WishList } from '_components/WishList';


export function Wishes({listId} : {listId: number}) {
  const { user } = useContext(UserContext)!;
  const [ wishes, setWishes ] = useState<Wishes>([]);
  const [ owned, setOwned ] = useState<boolean|undefined>(undefined);
  const [addWishVisible, setAddWishVisible] = useState<boolean>(false);

  // Refresh page on wish list change
  const updateWishs = useCallback(() => {
    if (listId >= 0) {
      fetchService.post('/api/wishes/list', {listId})
        .then((data) => {
          setOwned(data.isOwner);
          setWishes(data.wishes);
        })
        .catch(alertService.handleError);
    }
  }, [ listId ]);

  useEffect(() => {
    updateWishs();
  }, [updateWishs]);


  // We shall not be there
  if (user.isValid() == false) return null;

  // Lading...
  if (owned === undefined) {
    return <div>Hello {user.displayName} !</div>;
  }

  // We always shall have a selected list unless user has no owned list
  if (listId == -1) {
    return (
      <div>
        <div>Hello {user.displayName} !</div>
        <div>Il semble que vous ne pouvez pas exprimer de souhaits...</div>
        <div>Criez sur l&apos;administrateur !</div>
      </div>
    );
  }

  // addWishButton: display an add button if we own the list
  const addWishButton = (owned == false)? null : (
    <>
      <WishEditor listId={listId} isOpened={addWishVisible} setOpened={setAddWishVisible} onWishAdded={updateWishs} />
      <div className='text-center pt-4'><button  onClick={() => setAddWishVisible(true)}>Ajouter</button></div>
    </>
  );


  // Empty list
  if (wishes.length == 0) {
    let message;
    if (owned) {
      message = (
        <>
          <div>Qu&apos;est-ce qui vous ferais plaisir ?</div>
          <div>Cliquez sur [Ajouter] pour ajouter un souhait !</div>
          {addWishButton}
        </>
      );
    } else {
      message = <div>Cette liste de souhaits est actuellement vide.</div>;
    }
    return (
      <div>
        <div>Hello {user.displayName} !</div>
        {message}
      </div>
    )
  }

  // Filed list
  return (
    <>
      <WishList owned={owned} wishes={wishes} />
      {addWishButton}
    </>
  );
}
