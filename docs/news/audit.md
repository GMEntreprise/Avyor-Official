# Audit du dépôt avant l’espace News

État constaté le 18 septembre 2026, avant toute écriture de code.

## Détecté

| Sujet | Constat | Où |
| --- | --- | --- |
| Stack | React 19.1, Vite 7.1, TypeScript strict, Bun 1.3, Node 24 | `package.json`, `tsconfig.json` |
| Rendu | Pré-rendu statique : chaque route et chaque langue sont un fichier HTML, hydraté ensuite. **Aucun routeur client** | `scripts/prerender.mjs`, `src/entry-client.tsx` |
| Hébergement | Vercel, site statique, `trailingSlash: true`, redirections et en-têtes déclarés | `vercel.json`, `scripts/vercel-build.mjs` |
| Langues | fr (racine), en, es, he, ar ; `hreflang` réciproques, sitemap, `llms.txt` par langue | `src/i18n/locales.ts` |
| Design | Jetons CSS (`--navy`, `--violet`, `--line`…), Manrope locale, thème sombre | `src/styles.css` |
| Mesure | Vercel Web Analytics et Speed Insights, sans cookie, production uniquement ; `track()` n’émet qu’un événement DOM | `src/entry-client.tsx`, `src/lib/track.ts` |
| Tests | `node --test` (unitaires + HTML construit), Playwright + axe (desktop et mobile) | `tests/` |
| Dépôt | **Public** sur GitHub (`GMEntreprise/Avyor-Official`) | vérifié via l’API GitHub |
| Variables | Uniquement des `VITE_*` publiques (URL du site, indexabilité). Aucun secret suivi | `.env.example`, `.env.production` |

## Manquant

Aucun espace News ou blog : pas de page, pas de route, pas de modèle de contenu, pas d’URL indexée. Aucune authentification, base de données, CMS, stockage de médias ni interface d’administration. Aucun éditeur de texte riche.

`scripts/upstream/tselcloud/blog-automation/` est un exemple **importé d’un autre projet** (ConnectStar, blog généré par un modèle de langage), ignoré par le lint et sans lien avec AVYOR. Il n’a pas été réutilisé : les articles d’AVYOR sont écrits et vérifiés, pas générés en série.

Le workflow communautaire *building-blog* vise Next.js + Sanity : il ne s’applique pas ici. Ses principes utiles ont été repris (structure éditoriale, sommaire, SEO vérifiable, TDD) sans installer Sanity ni migrer le framework. Le document `page-cro` mentionné dans la demande n’était pas joint à la session ; les principes cités dans la demande ont servi de grille (clarté, lecture rapide, confiance, appel à l’action unique), sans popup ni urgence artificielle.

## Décisions retenues

1. **Stockage en fichiers, versionné.** Un JSON par article : `content/news/` pour la version publiée (commitée, déployée), `content/news-drafts/` pour les brouillons. Le dépôt étant public, les brouillons sont exclus de git **et** de `.vercelignore` : ils restent sur le poste de l’éditeur.
2. **Publication = commit + déploiement.** Pas de base de données à administrer, pas de webhook à sécuriser, et le contenu suit l’historique du code. Le délai de mise en ligne est celui de Vercel.
3. **Administration locale uniquement.** Servie par le serveur de développement (`vite.config.ts`), avec une API protégée par jeton de session, contrôle de l’en-tête `Host` et de l’`Origin`. Le site déployé n’a **aucune** surface de mutation ; un test le vérifie.
4. **Éditeur Tiptap**, stockage en JSON ProseMirror. Le sommaire, le rendu public et l’aperçu lisent la même structure : pas d’extraction par expression régulière sur du HTML, pas de conversion intermédiaire. L’éditeur ne part que dans l’admin, jamais dans le bundle public.
5. **URLs** : `/news/`, `/news/page/N/`, `/news/<slug>/`, préfixées par langue (`/en/news/…`). Recherche et filtres vivent dans la chaîne de requête et ne créent pas d’URL indexable.
6. **Une seule section éditoriale** : « News », avec des types (guide pratique, nouveauté AVYOR, retour d’expérience), deux publics et quatre thématiques. Pas de blog en doublon.
7. **Rien n’est publié par ce travail.** Les quatre articles P1 sont livrés en brouillon, relus, prévisualisables ; leur mise en ligne est une décision éditoriale.

## Ce qui n’a pas été fait, et pourquoi

- **Publication programmée** : un site statique ne se reconstruit pas tout seul à une heure donnée. Un sélecteur de date sans exécution serait un mensonge ; la validation refuse d’ailleurs une date de publication future.
- **Migration vers un rendu serveur** (Next.js, Sanity) : le pré-rendu répond déjà au besoin — HTML complet, métadonnées, données structurées, sitemap. Une migration serait une décision séparée, à justifier par un besoin que le pré-rendu ne couvre pas.
- **Commentaires, newsletter, auteurs multiples** : hors périmètre, et sans contenu réel pour les alimenter.
