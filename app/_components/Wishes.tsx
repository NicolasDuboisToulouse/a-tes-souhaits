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
  const updateWishes = useCallback(() => {
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
    updateWishes();
  }, [updateWishes]);

  // We shall not be there
  if (user.isValid() == false) return null;

  // Lading...
  if (listId >= 0 && owned === undefined) {
    return <div>Hello {user.displayName} !</div>;
  }

  // We always shall have a selected list unless user has no owned list
  if (listId < 0) {
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
      <WishEditor listId={listId} isOpened={addWishVisible} setOpened={setAddWishVisible} onWishAdded={updateWishes} />
      <div className='text-center pt-4'><button  onClick={() => setAddWishVisible(true)}>Ajouter</button></div>
    </>
  );

  // The draftList is only displayed for the owner
  let draftList: JSX.Element|null = null;
  if (owned && wishes.some((wish) => wish.draft == true)) {
    draftList = (
      <>
        <div className='pt-4 pb-2'>
          <div className='text-2xl'>Brouillons</div>
          <div>Les souhaits ci-dessous ne sont pas visible par les autres utilisateurs.</div>
        </div>
        <WishList user={user} owned={owned} wishes={wishes} draftMode={true} onWhishesChanged={updateWishes} />
      </>
    );
  }

  return (
    <>
      <WishList user={user} owned={owned!} wishes={wishes} draftMode={false} onWhishesChanged={updateWishes} />
      {addWishButton}
      {draftList}
    </>
  );
}
