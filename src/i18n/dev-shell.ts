import { localeMeta, splitPath } from './locales.ts';

/**
 * Gives the development shell the language of the address being served.
 *
 * In production each language is its own prerendered document, whose `<html>`
 * carries its language — and the client reads the page's language from there
 * (`entry-client.tsx`). Development serves a single `index.html`, frozen in
 * French, so every address rendered in French whatever the URL said: the
 * translations were complete, the shell simply never said which one to load.
 *
 * Only `vite.config.ts` imports this: it never travels to the browser.
 */
export function localizeShell(html: string, route: string): string {
  const { locale } = splitPath(route.split('?')[0].replace(/index\.html$/, ''));
  const { tag, dir } = localeMeta[locale];
  return html.replace(/<html\b[^>]*>/, `<html lang="${tag}" dir="${dir}">`);
}
