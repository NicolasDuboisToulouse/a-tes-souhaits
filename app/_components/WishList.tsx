import { Wish } from '_components/WishEditor';
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { simpleDialog } from '_components/SimpleDialog'
import { User } from '_lib/user'
import { BookedBy, WishArray } from '_lib/wish'
import { markdownToHtml } from '_lib/client/markdown';
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

  function setBooked(booked: boolean) {
    fetchService.post('/api/wishes/setBooked', {wishId: wish.id, booked})
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
    if (wish.bookedBy == BookedBy.Nobody) {
      return <button className='self-start flex-none p-1' title='Réserver' onClick={() => setBooked(true)}>Réserver</button>;
    } else if (wish.bookedBy == BookedBy.Me) {
      return <button className='self-start flex-none p-1' title='Libérer' onClick={() => setBooked(false)}>Libérer</button>;
    } else {
      return <span>Réservé.</span>
    }
  }
}

// Display a wish description
function WishDescription({ description } : { description: string } ) {
  return <div className='markdown ml-1' dangerouslySetInnerHTML={markdownToHtml(description)} />
}

// Main
export function WishList({
  user, owned, wishArray, draftMode, onChange, onEditWish
} : {
  user: User, owned: boolean, wishArray: WishArray, draftMode: boolean, onChange: () => void, onEditWish: (wish: Wish) => void
}) {

  // Only owner may have drafts
  if (owned == false && draftMode == true) return null;

  // Filter list according to draft status
  let displayedWishArray = (owned == false)? wishArray : wishArray.filter((wish) => wish.draft == draftMode);

  // Handle empty list
  if (displayedWishArray.length == 0) {
    if (owned == false) {
      return (
        <>
          <div>Hello {user.displayName} !</div>
          <div>Cette liste de souhaits est actuellement vide.</div>
        </>
      );
    }
    else if (wishArray.length == 0) { // Only if completly empty
      return (
        <>
          <div>Hello {user.displayName} !</div>
          <div>Qu&apos;est-ce qui vous ferez plaisir ?</div>
          <div>Cliquez sur [Ajouter] pour ajouter un souhait !</div>
        </>
      );
    }
    return null;
  }

  // Display list
  return (
    <div className='wishList min-w-[60vw]'>
      {displayedWishArray.map((wish) => {
        return (
          <div className='p-2 flex flex-wrap gap-1' key={wish.id}>
            <div className='flex-1 pr-4'>
              <div className='text-lg leading-4'>{wish.label}</div>
              <WishDescription description={wish.description} />
            </div>
            <WishActions wish={wish} owned={owned} onChange={onChange} onEdit={onEditWish} />
          </div>
        )
      })}
    </div>
  );
}
