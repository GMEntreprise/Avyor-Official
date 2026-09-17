/** Session key: the intro belongs to the first page of a visit, not to every page. */
export const INTRO_SESSION_KEY = 'avyor-intro';

/**
 * Runs in <head>, before anything is painted, so a visitor who has already
 * seen the intro this session never catches a flash of it. Same technique as
 * a no-flash theme switch: it only sets a class, it never renders anything.
 *
 * It lives outside the component because it is not markup, and because the
 * build and the dev server both have to inject it from one definition.
 */
export const introScript = `try{var s=sessionStorage;if(s.getItem('${INTRO_SESSION_KEY}'))document.documentElement.classList.add('intro-seen');else s.setItem('${INTRO_SESSION_KEY}','1')}catch(e){}`;
