/**
 * Rewrites the News redirects of vercel.json from the published articles.
 * The admin does it at every publication; this is for a hand edit of
 * content/news/, which the build otherwise refuses.
 */
import { syncRedirects, defaultPaths } from '../src/news/store.server.ts';

syncRedirects(defaultPaths);
console.log('Redirections News de vercel.json alignées sur les articles publiés.');
