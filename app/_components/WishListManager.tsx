import { useContext, useState, useCallback, useEffect } from 'react'
import { UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { Wish, WishEditor } from './WishEditor';
import { WishArray, WishList } from '_components/WishList';


export function WishListManager({listId} : {listId: number|undefined}) {
  const { user } = useContext(UserContext)!;
  const [ wishArray, setWishArray ] = useState<WishArray|undefined>(undefined);
  const [ owned, setOwned ] = useState<boolean>(false);
  const [ wishEditorVisible, setWishEditorVisible ] = useState<boolean>(false);
  const [ editedWish, setEditedWish ] = useState<Wish|undefined>(undefined);

  // Refresh page on wish list change
  const update = useCallback(() => {
    if (listId !== undefined) {
      if (listId >= 0) {
        fetchService.post('/api/wishes/list', {listId})
          .then((data) => {
            setOwned(data.isOwner);
            setWishArray(data.wishArray);
          })
          .catch(alertService.handleError);
      } else {
        setOwned(false);
        setWishArray([]);
      }
    }
  }, [ listId ]);

  useEffect(() => {
    update();
  }, [update]);

  // We shall not be there
  if (user.isValid() == false) return null;

  // Lading...
  if (listId == undefined || wishArray === undefined) {
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

  // Callbacks to show wishEditor
  function addWish() {
    setEditedWish(undefined);
    setWishEditorVisible(true);
  }

  function editWish(wish: Wish) {
    setEditedWish(wish);
    setWishEditorVisible(true);
  }

  // addWishButton: display an add button if we own the list
  const addWishButton = (owned == false)? null : (
    <div className='text-center pt-4'><button  onClick={addWish}>Ajouter</button></div>
  );

  // The draftList is only displayed for the owner
  let draftList: JSX.Element|null = null;
  if (owned && wishArray.some((wish) => wish.draft == true)) {
    draftList = (
      <>
        <div className='pt-4 pb-2'>
          <div className='text-2xl'>Brouillons</div>
          <div>Les souhaits ci-dessous ne sont pas visible par les autres utilisateurs.</div>
        </div>
        <WishList user={user} owned={owned} wishArray={wishArray} draftMode={true} onChange={update} onEditWish={editWish} />
      </>
    );
  }

  return (
    <>
      <WishEditor listId={listId} isOpened={wishEditorVisible} setOpened={setWishEditorVisible} onChange={update} wish={editedWish} />
      <WishList user={user} owned={owned!} wishArray={wishArray} draftMode={false} onChange={update} onEditWish={editWish} />
      {addWishButton}
      {draftList}
    </>
  );
}
