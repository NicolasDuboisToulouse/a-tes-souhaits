import { Wish } from '_components/WishEditor';
import { User } from '_lib/user'

export type Wishes = Array<Wish>;

export function WishList({user, owned, wishes, draftMode} : {user: User, owned: boolean, wishes: Wishes, draftMode: boolean}) {

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

  // Buttons associated with a wish depend on owned status
  let wishButtons: JSX.Element|null = null;
  if (owned) {
    wishButtons = (
      <>
        <button className='self-start flex-none p-1' title='Modifier'><span className='icon icon-modify'><span>Modifier</span></span></button>
        <button className='self-start flex-none p-1' title='Supprimer'><span className='icon icon-delete'><span>Supprimer</span></span></button>
      </>
    );
  } else {
    wishButtons = <button className='self-start flex-none p-1' title='Réserver'>Réserver</button>;
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
              {wishButtons}
            </div>
          )
        })}
      </div>
  );
}
