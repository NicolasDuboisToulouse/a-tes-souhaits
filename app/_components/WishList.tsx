import { useRef, useContext, useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';

//
// Dialog to add a wish
//
function AddWishDialog({
  listId, isOpened, setOpened, onWishAdded
} : {
  listId:number, isOpened: boolean, setOpened: (opened: boolean) => void, onWishAdded: () => void} )
{
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpened) {
      form.current?.reset();
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialog, form, isOpened]);


  type formInput = { label: string, description: string, add:string };
  const { register, handleSubmit, formState } = useForm<formInput>({mode: 'onSubmit', reValidateMode: 'onSubmit'});
  const { errors } = formState;

  function doAddWish(input: formInput, {draft}: {draft: boolean} ) {
    setOpened(false);
    const request = {...input, draft, listId };
    fetchService.post('/api/wishes/add', request)
      .then(() => {
        onWishAdded();
      })
      .catch(alertService.handleError);
  }

  return (
    <dialog ref={dialog} className="modal w-[80vw]" onCancel={() => setOpened(false)}>
      <div className='v-form'>
      <form ref={form}>
        <div className='form-group'>
          <label>Souhait</label>
          <input type='text' {...register('label', { required: true })} className={`${errors.label ? 'invalid' : ''}`} />
        </div>
        <div className='form-group'>
          <label>Description (optionelle)</label>
          <textarea className='min-h-[8rem]' {...register('description')} />
        </div>
        <div className="button-group">
          <button type='submit' onClick={handleSubmit((input) => doAddWish(input, {draft: false}))}>Ajouter</button>
          <button type='submit' onClick={handleSubmit((input) => doAddWish(input, {draft: true}))}>Brouillon</button>
          <button type='button' onClick={() => setOpened(false)}>Annuler</button>
        </div>
      </form>
      </div>
    </dialog>
  );
}


//
// Wishes returned by the API
//
type Wish = {
  id: number,
  label: string,
  description: string,
  draft: boolean,
  bookedBy: string,
};

type Wishes = Array<Wish>;


//
// Main
//
export function WishList({listId} : {listId: number}) {
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
      <AddWishDialog listId={listId} isOpened={addWishVisible} setOpened={setAddWishVisible} onWishAdded={updateWishs} />
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
    <>
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
      {addWishButton}
    </>
  );
}
