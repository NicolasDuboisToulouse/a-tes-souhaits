import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';

export function WishEditor({
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
