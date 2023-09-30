import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { Wish } from '_lib/wish';
export type { Wish }

export function WishEditor({
  listId,
  isOpened, setOpened,
  onChange,               // Called on wish added or modified
  wish,                   // Wish to modify. Set to undefined for an add-wish dialog
} : {
  listId:number,
  isOpened: boolean, setOpened: (opened: boolean) => void,
  onChange: () => void,
  wish: Wish|undefined,
})
{
  // Form declaration. Set values for an edit dialog
  type formInput = { label: string, description: string };
  const { register, handleSubmit, reset, formState } =
    useForm<formInput>({mode: 'onSubmit', reValidateMode: 'onSubmit', defaultValues: { label: '', description: '' }});
  const { errors } = formState;

  // Handle open dialog
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpened) {
      const values = (wish)?
        { label: wish.label, description: wish.description } :
        { label: '', description: '' };
      reset(values);
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialog, isOpened, reset, wish]);



  // Handle saving wish
  function doSaveWish(input: formInput, {draft}: {draft: boolean} ) {
    setOpened(false);
    const uri = (wish)? '/api/wishes/update' : '/api/wishes/add';
    const request = {...input, draft, listId, wishId: wish?.id };
    fetchService.post(uri, request)
      .then(() => {
        onChange();
      })
      .catch(alertService.handleError);
  }

  // First button label depend on dialog kind
  const publishedButtonLabel = (wish)? (wish.draft)? 'Publier' : 'Modifier' : 'Ajouter';

  // Default button depend on dialog kind
  const defaultButton = (wish)? (wish.draft)? 'draft' : 'publish' : 'publish';

  return (
    <dialog ref={dialog} className="modal w-[80vw]" onCancel={() => setOpened(false)}>
      <div className='v-form'>
      <form>
        <div className='form-group'>
          <label>Souhait</label>
          <input type='text' {...register('label', { required: true })} className={`${errors.label ? 'invalid' : ''}`} />
        </div>
        <div className='form-group'>
          <label>Description (optionelle)</label>
          <textarea className='min-h-[8rem]' {...register('description')} />
        </div>
        <div className="button-group">
          <button
            type={(defaultButton == 'publish')? 'submit':'button'}
            onClick={handleSubmit((input) => doSaveWish(input, {draft: false}))}>
            {publishedButtonLabel}
          </button>
          <button
            type={(defaultButton == 'draft')? 'submit':'button'}
            onClick={handleSubmit((input) => doSaveWish(input, {draft: true}))}>
            Brouillon
          </button>
          <button type='button' onClick={() => setOpened(false)}>Annuler</button>
        </div>
      </form>
      </div>
    </dialog>
  );
}
