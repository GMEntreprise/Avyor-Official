/**
 * Le jeton de validation Google Search Console.
 *
 * Il est public par construction : Google le lit dans le HTML servi. Il n'est
 * pas un secret, mais il ne doit pas disparaître — Google revérifie la
 * propriété périodiquement, et sans cette balise l'accès à Search Console est
 * perdu, avec lui le sitemap déclaré et l'inspection d'URL.
 *
 * Il n'est écrit que sur la page d'accueil de chaque langue : c'est l'adresse
 * que Google vérifie (`https://avyor.app/`).
 */
export const GOOGLE_SITE_VERIFICATION = '2_KIPuPQH7fm8FttGOMRTlHEULVpfLrpvyc8wsL_kLg';
