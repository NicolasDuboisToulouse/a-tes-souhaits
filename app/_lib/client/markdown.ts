import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'

export function markdownToHtml(markdownText: string) {
  const html =  micromark(markdownText, {
    extensions: [ gfm() ],
    htmlExtensions: [ gfmHtml() ] }
  );

  return {
    // This repace is not so good but is it the only solution with micromark.
    // An other solution is to switch to remark/rehype.
    __html: html.replace(/<a /g, '<a target="_blank" ')
  };
}
