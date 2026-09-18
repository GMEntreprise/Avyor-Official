# AVYOR — contraintes du site

Vitrine React + Vite + TypeScript strict, pré-rendue au build. Bun. Pas de routeur client : chaque route est un HTML statique hydraté ensuite.

## Commandes réelles

```
bun run dev         bun run typecheck    bun run lint
bun run test        bun run test:seo     bun run test:e2e
bun run build       bun run budget       bun run measure
bun run test:all    bun run assets:build
```

N'inventez pas de script absent de `package.json`.

## Source de vérité produit

Le site décrit l'application réelle, dont le code est dans `/Users/shavod/Developer/Avyor`. **Avant d'écrire une affirmation produit, vérifiez-la** dans `src/i18n/resources/fr.json`, `app/(creator)`, `app/(advertiser)` ou `src/features/`. `docs/audits/avyor-content-audit.md` récapitule les faits vérifiés.

Pièges connus, protégés par des tests :

- **L'authentification à deux facteurs n'existe pas** : l'app affiche « Bientôt disponible ».
- **Une candidature envoyée ne peut pas être retirée** depuis l'application.
- **Aucun délai de virement chiffré** : il dépend du calendrier du compte Stripe.
- Le site est en français ; l'application, elle, est traduite en cinq langues.

## Contenu long et budget

`src/content/site.ts` ne porte que les métadonnées partagées. Les corps de page (`src/content/sections.ts`) et le juridique (`src/content/legal.json`) sont réunis dans `src/content/deep.ts`, **chargé à la demande** par `entry-client.tsx` uniquement sur une page intérieure. N'importez jamais `deep`, `sections` ou `legal.json` statiquement depuis un composant : cela les remettrait dans le bundle que toutes les pages téléchargent.

## Règles de contenu

- **Aucune donnée inventée.** Pas d'avis, de note, de nombre d'utilisateurs, de logo client ni de résultat chiffré qui ne soit pas attesté.
- **Aucune information juridique inventée.** Raison sociale, SIRET, adresse, directeur de publication, DPO, durées de conservation, droit applicable : tant qu'ils ne sont pas fournis, ils restent un `todo` visible dans `src/content/legal.json`, jamais une valeur plausible.
- **Aucune promesse absolue** : « révolutionnaire », « n°1 », « 100 % sécurisé », « garanti », « instantané » sont proscrits sans preuve.
- Les captures montrent des **données de démonstration** : `DemoCaption` doit les accompagner.

## Règles de téléchargement

- **Une seule source de vérité** : `src/config.ts` dérive `stores` de `buildStores()` à partir des variables d'environnement, filtrées par `src/lib/store-url.ts`. Aucun `const iosAvailable` ailleurs.
- `store-url.ts` n'accepte que `https://apps.apple.com/.../id<number>` et `https://play.google.com/store/apps/details?id=...`. **Aucune autre URL de store ne peut devenir un lien.**
- **Jamais `href="#"`** : un test SEO échoue sur tout lien vide.
- **Jamais d'icône de téléphone générique pour représenter un store.** Les visuels officiels Apple et Google vivent dans `public/assets/badges/` et sont rendus **sans modification** : pas de dégradé AVYOR, pas de contour, pas de déformation. Seul le conteneur est AVYOR.
- Une plateforme non publiée n'est **pas un lien** : `StoreCard` rend un élément inerte, pas une ancre désactivée.
- Un seul composant porte le CTA : `DownloadAppButton` (variantes `primary` / `nav` / `hero` / `footer`). Ne le recopiez pas par emplacement.

## Règles techniques

- **Reduced motion** : toute animation respecte `prefers-reduced-motion`.
- **Pas d'état React piloté par le scroll.** Utilisez IntersectionObserver, MotionValue ou des variables CSS. Aucun `setState` par pixel scrollé.
- **Pas d'animation permanente** hors interaction : pas de `setInterval` qui redessine en continu.
- **L'intro est rendue par le serveur** (`src/components/Intro.tsx`, monté par `App` quand `!slug`). Elle ne doit contenir **ni état, ni effet, ni timer** : son rendu serveur et son rendu client doivent être identiques, sinon l'hydratation casse. Tout ce qui varie est en CSS — l'animation et sa fin (`visibility: hidden` sur la dernière image, qui sert aussi de filet de sécurité), `prefers-reduced-motion`, et la règle « une fois par session » via la classe `.intro-seen`.
  Elle a déjà été cassée une fois en la conditionnant à `performance.now()` après hydratation : à froid le bundle arrivait trop tard, l'intro était sautée et ne jouait qu'au rechargement. **Ne la faites pas dépendre du JavaScript.**
- **Le garde de session (`src/components/intro-session.ts`) s'injecte dans `<head>` avant peinture**, depuis `scripts/prerender.mjs` en production **et** depuis le plugin de `vite.config.ts` en développement. Le pré-rendu ne tourne pas sous `vite dev` : tout ce qui n'est injecté que par lui devient invisible en développement.
- **Une animation ne masque jamais du contenu servi.** L'état masqué de `Reveal` est porté par `.motion-ready`, posée par le client après reprise : sans JavaScript, tout reste lisible. Un test le vérifie sur le CSS construit.
- Numérotez avec `ordinal()` : `0{i + 1}` donne « 010 » à partir de la dixième.
- `motion` est chargé via `LazyMotion` + `domAnimation` : importez `m`, jamais `motion`.
- **L'alias `@/` n'est pas configuré.** Les composants shadcn/Aceternity doivent être adaptés en imports relatifs avant intégration.
- **Une image utilisée par un composant s'importe depuis `src/assets/`**, elle ne se désigne pas par une adresse `/assets/…` vers `public/`. Importée, Vite l'empreinte : son absence fait échouer le build au lieu de partir en 404 en production, et chaque nouvelle version reçoit une adresse qu'aucun navigateur n'a en cache. `public/` est réservé aux fichiers qui doivent garder une adresse fixe : favicons, `og.png`, manifeste, `robots.txt`. Un test l'impose pour le logo.
- Réutilisez les tokens de `src/styles.css` (`--navy`, `--surface`, `--violet`, `--muted`, `--line`, `--fast`, `--normal`, `--ease`). Pas de nouveau rayon, couleur, ombre ou police arbitraire.
- **Budget** : `bun run budget` mesure le JS réellement chargé par une page (entrée + imports statiques), pas la somme de tous les chunks. Le contenu volumineux propre à quelques routes se charge à la demande.

## Icônes en volume

Les icônes du manifeste et de la section 06 sont **dessinées** dans `src/components/Icons3D.tsx` et **servies en fichiers `.svg`** : `scripts/build-icons.tsx` les exporte vers `src/assets/icons/` avant chaque `build` et chaque `dev`. Ne les rendez pas en SVG inline dans la page : c'est de l'illustration pure, qui n'a rien à faire dans le JavaScript que chaque visiteur télécharge — inline, elles ont fait dépasser le budget. Toute nouvelle icône suit la même recette, décrite en entier dans `docs/design/icones-3d-prompt.md` (prompt réutilisable sur d'autres sites).

- **Modifiez le composant, jamais le fichier `.svg`** : il est régénéré et vos changements seraient écrasés.
- **`build.assetsInlineLimit` reste à 0** dans `vite.config.ts`. Sinon Vite replie tout fichier de moins de 4 ko dans le JavaScript, en URL encodée pour les SVG. Un test l'interdit.

- **Une lumière, en haut à gauche, pour toute la famille.** Couches, de l'arrière vers l'avant : ombre au sol, épaisseur décalée de 4-5 px, face en dégradé diagonal, liseré spéculaire, zones creusées avec paroi, détails en relief, brillance découpée à la forme.
- **SVG pur** : ni image embarquée, ni ressource externe, ni texte, ni filtre de flou. Les ombres sont des dégradés.
- **Identifiants via `useId()`** dans le composant. En fichier, chaque icône est son propre document ; un test vérifie que chaque `url(#…)` mène à un identifiant du même fichier.
- **Décoratives** : `<img alt="" loading="lazy">`. Le texte porte le sens.
- **Palette de la marque uniquement** : violet `#7c5cff` et ses teintes, bleu `#5a7cf5`, surface `#1d2247`, ombre `#010208`.
- **Taille** : 88-104 px sur ordinateur ; sur téléphone, liste avec l'icône à 64-68 px à gauche. Avant d'intégrer, chercher les règles responsives qui visent déjà les `svg` du conteneur : deux sections avaient une règle qui les aurait écrasées à 16 et 30 px.
- **Relire en grand avant d'intégrer** : rendre chaque icône à 280 px sur le vrai fond et chercher les défauts connus — brillance en rectangle, ombre invisible, creux sans paroi, chevauchements, pièces qui dépassent.

## Déploiement

Vercel, configuré par `vercel.json`. Runbook complet : `docs/site/deploiement-vercel.md`.

- **`dist/_headers` n'est lu que par Netlify et Cloudflare.** Vercel l'ignore : tout en-tête ajouté là doit l'être aussi dans `vercel.json`, et un test échoue sinon.
- **`/assets/` mélange fichiers empreintés et médias au nom stable.** Le cache immuable est réservé aux `.js`, `.css` et `.woff2`. Les médias sont en `max-age=0, must-revalidate`.
- **Vercel applique les en-têtes aux réponses d'erreur aussi.** Un `max-age` positif sur un média fige une 404 passagère dans le navigateur : c'est arrivé au logo, resté introuvable une semaine après son retour. Ne donnez jamais de `max-age` positif à un fichier au nom stable.
- **Le site reste `noindex` tant qu'il vit sur un domaine `vercel.app`.** `scripts/vercel-build.mjs` refuse de construire un site indexable sur ce domaine, pour ne pas mettre une copie en concurrence avec le vrai domaine.
- **Tout motif de `.vercelignore` commence par `/`.** Sans ancrage, la syntaxe gitignore vise le nom à toutes les profondeurs : `brand/` a exclu `public/assets/brand/` et le logo n'a jamais été servi en production.
- L'URL canonique ne vient pas d'un fichier versionné : elle est déduite de `VERCEL_PROJECT_PRODUCTION_URL`, ou forcée par `VITE_SITE_URL`.

## Règles SEO

- Les tests portent sur le **HTML construit** (`tests/seo/`), pas sur le source.
- Chaque page indexable : `title` unique, `description` unique, un seul `h1`, `canonical`, OpenGraph, Twitter.
- **Aucun `localhost`, `127.0.0.1` ni port de développement** dans le build de production : un test l'interdit.
- Le **schema décrit le visible** : pas de `FAQPage` sans FAQ affichée, pas de `SoftwareApplication` sans URL de store vérifiée, jamais d'`AggregateRating` ni de prix.
- Pas de clé de traduction brute, pas de mot dupliqué dans les titres.

## À préserver

L'identité visuelle sombre, la typographie Manrope locale, l'intro masque-logo une fois par session, la grille éditoriale et le ton factuel. Enrichissez ; ne refondez pas.
