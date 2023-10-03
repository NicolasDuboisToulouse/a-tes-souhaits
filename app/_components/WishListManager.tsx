import { useContext, useState, useCallback, useEffect } from 'react'
import { UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { Wish, WishEditor } from './WishEditor';
import { WishArray, WishList } from '_components/WishList';


export function WishListManager({listId} : {listId: number|undefined}) {
  // Logged-in user
  const { user } = useContext(UserContext)!;
  // List of wishes to display
  const [ wishArray, setWishArray ] = useState<WishArray|undefined>(undefined);
  // Does logged-in user own these wishes
  const [ owned, setOwned ] = useState<boolean>(false);
  // Control the visiblity of the wish editor
  const [ wishEditorVisible, setWishEditorVisible ] = useState<boolean>(false);
  // Control the content of the wish editor
  const [ editedWish, setEditedWish ] = useState<Wish|undefined>(undefined);
  // Store the last render date
  let lastRenderDate = Date.now();

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


  // Call update() if document become visible (user navigate back to this tab)
  // and the component has not been render for a while
  const mayUpdate = useCallback(() => {
    if (listId && listId > 0 &&
      document.visibilityState === "visible" &&
      (Date.now() - lastRenderDate) > 10 * 60 * 1000) {
        update();
    }
  }, [listId, lastRenderDate, update]);

  useEffect(() => {
    addEventListener("visibilitychange", mayUpdate);
    return () => { removeEventListener("visibilitychange", mayUpdate); }
  }, [mayUpdate]);


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
          <div>Les souhaits ci-dessous ne sont pas visibles par les autres utilisateurs.</div>
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
