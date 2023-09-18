import { Wish } from '_components/WishEditor';
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { simpleDialog } from '_components/SimpleDialog'
import { User } from '_lib/user'
import { WishArray } from '_lib/wish'
export type { WishArray }


// Actions for a single wish
function WishActions({
  wish, owned, onChange, onEdit
} : {
  wish: Wish, owned: boolean, onChange: () => void, onEdit: (wish: Wish) => void
}) {

  function askDeleteWish() {
    if (wish.draft == false) {
      simpleDialog({
        content: <><div>Attention, ce souhait est peut-être réservé !</div><div>La suppression est définitive !</div></>,
        buttons: [
          { label: "Brouillon", onClick: () => wishToDraft() },
          { label: "Supprimer", onClick: () => deleteWish() },
          { label: "Annuler" },
        ]
      });
    } else {
      simpleDialog({
        content: <div>Attention, la suppression est définitive !</div>,
        buttons: [
          { label: "Supprimer", onClick: () => deleteWish() },
          { label: "Annuler" },
        ]
      });
    }
  }

  function wishToDraft() {
    fetchService.post('/api/wishes/toDraft', {wishId: wish.id})
      .then(() => {
        onChange();
      })
      .catch(alertService.handleError);
  }

  function deleteWish() {
    fetchService.post('/api/wishes/del', {wishId: wish.id})
      .then(() => {
        onChange();
      })
      .catch(alertService.handleError);
  }

  if (owned) {
    return (
      <>
        <button className='self-start flex-none p-1' title='Modifier' onClick={() => onEdit(wish)}>
          <span className='icon icon-modify'><span>Modifier</span></span>
        </button>
        <button className='self-start flex-none p-1' title='Supprimer' onClick={askDeleteWish}>
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
  user, owned, wishes, draftMode, onChange, onEditWish
} : {
  user: User, owned: boolean, wishes: WishArray, draftMode: boolean, onChange: () => void, onEditWish: (wish: Wish) => void
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
            <WishActions wish={wish} owned={owned} onChange={onChange} onEdit={onEditWish} />
          </div>
        )
      })}
    </div>
  );
}
