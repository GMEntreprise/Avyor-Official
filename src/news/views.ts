/**
 * The News reading views: list, search, article, table of contents.
 *
 * Only News pages need them, so the browser loads this module on those routes
 * alone — the same way the long page bodies are loaded — and every other page
 * of the site stays as light as before.
 */
export { NewsIndex } from './NewsIndex';
export { NewsArticle } from './NewsArticle';
