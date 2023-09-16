import { Wish } from '_components/WishEditor';

export type Wishes = Array<Wish>;

export function WishList({owned, wishes} : {owned: boolean, wishes: Wishes}) {

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

  return (
      <div className='wishList min-w-[60vw]'>
        {wishes.map((wish) => {
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
