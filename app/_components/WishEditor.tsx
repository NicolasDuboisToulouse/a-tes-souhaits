import { useRef, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { micromark } from 'micromark'
import {gfm, gfmHtml} from 'micromark-extension-gfm'
import * as fetchService from '_lib/client/fetchService';
import { alertService } from '_components/Alerts';
import { simpleDialog } from '_components/SimpleDialog'
import { Wish } from '_lib/wish';
export type { Wish }

export function WishEditor({
  listId,
  isOpened, setOpened,
  onChange,               // Called on wish added or modified
  wish,                   // Wish to modify. Set to undefined for an add-wish dialog
} : {
  listId:   number,
  isOpened: boolean, setOpened: (opened: boolean) => void,
  onChange: () => void,
  wish:     Wish|undefined,
})
{
  // Description preview/edit mode
  const [ previewMode, setPreviewMode ] = useState<boolean>(false);

  // Form declaration. Set values for an edit dialog
  type formInput = { label: string, description: string };
  const { register, handleSubmit, reset, formState, getValues } =
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
      setPreviewMode(false);
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialog, isOpened, reset, wish]);

  // Prevent dialog render if not needed
  if (! isOpened) return null;

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

  // Toggle description/preview
  function togglePreview() {
    setPreviewMode(!previewMode);
  }

  let inputDescription = null;
  if (previewMode == false) {
    inputDescription = <textarea className='min-h-[8rem]' {...register('description')} />;
  } else {
    inputDescription = <div className='preview min-h-[8rem]'
                         dangerouslySetInnerHTML={ {
                           __html: micromark(getValues('description'), { extensions: [gfm()], htmlExtensions: [gfmHtml()] })
                         } } />;
  }

  // Help
  function help() {
    simpleDialog({
      content: <>
                 <div>La description peut contenir des liens <i>cliquables</i> (copiez/coller simplement l&apos;adresse) et même des caractères de formattage.</div>
                 <div>Par exemple:&nbsp;
                   <span className="description-example">Un **super** cadeau</span>&nbsp;
                   affichera&nbsp;
                   <span className="description-example">Un <b>super</b> cadeau</span>.
                 </div>
                 <div>Le bouton <span className='icon icon-preview'><span>Aperçu</span></span> vous permet d&apos;avoir un aperçu.</div>
               </>,
      buttons: [
        { label: "Ok" },
        { label: "Syntaxe", onClick: () => { window.open('https://commonmark.org/help','_blank') } }
      ]
    });
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
          <div className='flex gap-1'>
            <label className='flex-auto'>Description (optionelle)</label>
            <div className='markdown-menu flex-initial'>
              <button type='button' title='Aperçu' onClick={togglePreview}>
                <span className='icon icon-preview'><span>Aperçu</span></span>
              </button>
              <button type='button' title='Aide' onClick={help}>
                <span className='icon icon-question'><span>Aide</span></span>
              </button>
            </div>
          </div>
          {inputDescription}
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
