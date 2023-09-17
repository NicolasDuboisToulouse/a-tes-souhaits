import { Wish } from '_components/WishEditor';
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { User } from '_lib/user'

export type Wishes = Array<Wish>;

// Actions for a single wish
function WishActions({wish, owned, onWhishesChanged} : {wish: Wish, owned: boolean, onWhishesChanged: () => void}) {

  function deleteWish(id: number) {
    fetchService.post('/api/wishes/del', {wishId: id})
      .then(() => {
        onWhishesChanged();
      })
      .catch(alertService.handleError);
  }

  if (owned) {
    return (
      <>
        <button className='self-start flex-none p-1' title='Modifier'>
          <span className='icon icon-modify'><span>Modifier</span></span>
        </button>
        <button className='self-start flex-none p-1' title='Supprimer' onClick={()=>deleteWish(wish.id)}>
          <span className='icon icon-delete'><span>Supprimer</span></span>
        </button>
      </>
    );
  } else {
    return <button className='self-start flex-none p-1' title='Réserver'>Réserver</button>;
  }
}


// Main
export function WishList({
  user, owned, wishes, draftMode, onWhishesChanged
} : {
  user: User, owned: boolean, wishes: Wishes, draftMode: boolean, onWhishesChanged: () => void
}) {

  // Only owner may have drafts
  if (owned == false && draftMode == true) return null;

  // Filter list according to draft status
  let displayWishes = (owned == false)? wishes : wishes.filter((wish) => wish.draft == draftMode);

  // Handle empty list
  if (displayWishes.length == 0) {
    if (owned == false) {
      return (
        <>
          <div>Hello {user.displayName} !</div>
          <div>Cette liste de souhaits est actuellement vide.</div>
        </>
      );
    }
    else if (wishes.length == 0) { // Only if completly empty
      return (
        <>
          <div>Hello {user.displayName} !</div>
          <div>Qu&apos;est-ce qui vous ferais plaisir ?</div>
          <div>Cliquez sur [Ajouter] pour ajouter un souhait !</div>
        </>
      );
    }
    return null;
  }

  // Display list
  return (
      <div className='wishList min-w-[60vw]'>
        {displayWishes.map((wish) => {
          return (
            <div className='p-2 flex flex-wrap gap-1' key={wish.id}>
              <div className='flex-1 pr-4'>
                <div className='text-lg leading-4'>{wish.label}</div>
                <div className='text-base ml-1'>{wish.description}</div>
              </div>
              <WishActions wish={wish} owned={owned} onWhishesChanged={onWhishesChanged} />
            </div>
          )
        })}
      </div>
  );
}
