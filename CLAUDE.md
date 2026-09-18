# AVYOR — contraintes du site

Vitrine React + Vite + TypeScript strict, pré-rendue au build, publiée en cinq langues. Bun. Pas de routeur client : chaque route et chaque langue sont un HTML statique hydraté ensuite.

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
- Le site et l'application sont publiés dans les mêmes cinq langues : fr, en, es, he, ar.

## Langues

Cinq langues : `fr` (référence), `en`, `es`, `he`, `ar`. Tout est déclaré dans `src/i18n/locales.ts` — la liste, le sens de lecture, l'étiquette et le code de chacune. **Aucune bibliothèque d'internationalisation n'est chargée** : le site est pré-rendu une fois par langue, le visiteur reçoit du HTML fini et le navigateur ne télécharge aucun moteur de traduction.

- **Le français vit à la racine**, les autres langues sous un préfixe : `/creators/` et `/en/creators/`. Les slugs sont identiques dans toutes les langues ; seul le texte change. `routeFor(locale, slug)`, `splitPath(path)` et `swapLocale(path, cible)` sont la seule façon de fabriquer ou de lire une adresse.
- **Un fichier de contenu par langue** : `src/content/locales/<lang>.ts` (coquille et interface), `src/content/deep/<lang>.ts` (corps de page longs) et `src/content/legal/<lang>.json`. Le type `SiteContent` de `src/content/types.ts` impose le même contenu partout : une traduction manquante est une erreur de compilation, pas une phrase française dans une page arabe.
- **Les composants ne connaissent aucune chaîne.** Tout passe par `useSite()`, `useUi()` et `useHref()` de `src/content/context.tsx`. Un lien se construit avec `href(slug)`, jamais avec `/slug/` écrit à la main : un test échoue sur tout lien interne qui sort de la langue de la page.
- **Les langues sont des morceaux séparés.** `src/content/index.ts` ne contient que des imports dynamiques ; `entry-client.tsx` ne charge que la langue de la page. N'importez jamais un fichier de `locales/`, `deep/` ou `legal/` statiquement depuis un composant : les cinq langues repartiraient dans le bundle de tout le monde. Le rendu serveur, lui, les importe toutes — c'est `entry-server.tsx`, il ne va pas dans le navigateur.
- **Les ancres juridiques ne se traduisent pas.** Les `id` de `legal/*.json` sont identiques dans les cinq langues, sinon un lien profond partagé dans une langue casserait dans les autres. Un test compare les ancres, les listes et les `todo` à la référence française.
- **Un document juridique traduit annonce que le français fait foi** (`ui.legal.translationNotice`). Ne publiez pas de traduction juridique sans cette mention.
- **Écriture de droite à gauche** : `he` et `ar`. La feuille de style n'utilise **que des propriétés logiques** (`margin-inline-start`, `padding-inline`, `border-inline-start`, `text-align: start`) — un test refuse toute propriété physique. Ce qui est orienté à la main reste à corriger sous `[dir='rtl']` : dégradés de lisibilité (`90deg` → `270deg`), cadrage des arrière-plans, flèches de lien, filets décoratifs. Le nom « avyor. » porte `dir="ltr"`, sinon le point passe devant le mot.
- **Ajouter une langue** : l'inscrire dans `LOCALES` et `localeMeta`, écrire les trois fichiers de contenu, l'ajouter aux chargeurs de `src/content/index.ts` et aux imports de `entry-server.tsx`, puis compléter les tables de vérification de `tests/unit/content.test.mjs` et `tests/unit/legal.test.mjs`. Le reste suit tout seul : pages, sitemap, hreflang, `llms.txt`.
- **Le sélecteur de langue est une vraie navigation** (`src/components/LanguageSelector.tsx`), pas un changement d'état : il efface la page puis charge l'adresse de la langue demandée, avec un délai de sécurité pour que le fondu ne retienne jamais le visiteur. La transition entre documents du navigateur (`@view-transition`) a été essayée puis retirée : elle s'interrompt sur ce site en écrivant une erreur dans la console du visiteur.

## Contenu long et budget

`src/content/locales/<lang>.ts` ne porte que les métadonnées partagées. Les corps de page (`src/content/deep/<lang>.ts`) et le juridique (`src/content/legal/<lang>.json`) sont **chargés à la demande** par `entry-client.tsx`, uniquement sur une page intérieure et uniquement dans la langue affichée.

## Règles de contenu

- **Aucune donnée inventée.** Pas d'avis, de note, de nombre d'utilisateurs, de logo client ni de résultat chiffré qui ne soit pas attesté.
- **Aucune information juridique inventée.** Raison sociale, SIRET, adresse, directeur de publication, DPO, durées de conservation, droit applicable : tant qu'ils ne sont pas fournis, ils restent un `todo` visible dans `src/content/legal/<lang>.json` — dans les cinq langues à la fois —, jamais une valeur plausible.
- **Aucune promesse absolue** : « révolutionnaire », « n°1 », « 100 % sécurisé », « garanti », « instantané » sont proscrits sans preuve.
- Les captures montrent des **données de démonstration** : `DemoCaption` doit les accompagner.

## Règles de téléchargement

- **Une seule source de vérité** : `src/config.ts` dérive `stores` de `buildStores()` à partir des variables d'environnement, filtrées par `src/lib/store-url.ts`. Aucun `const iosAvailable` ailleurs.
- `store-url.ts` n'accepte que `https://apps.apple.com/.../id<number>` et `https://play.google.com/store/apps/details?id=...`. **Aucune autre URL de store ne peut devenir un lien.**
- **Jamais `href="#"`** : un test SEO échoue sur tout lien vide.
- **Deux boutons, un par plateforme**, rendus par `StoreCard` : App Store en bleu, Google Play en vert, chacun avec sa marque dessinée (`StoreMark`) et deux lignes — ce que le visiteur fait, puis où. Les noms « App Store » et « Google Play » ne se traduisent jamais ; la ligne du dessus, si.
- **Jamais d'icône de téléphone générique pour représenter un store.** Un test l'interdit.
- Ce choix est un choix de marque assumé : Apple et Google demandent d'utiliser leurs visuels officiels, conservés dans `public/assets/badges/`. Si le lancement impose de revenir à leurs badges, `StoreCard` est le seul endroit à changer.
- Une plateforme non publiée n'est **pas un lien** : `StoreCard` rend un `div` inerte, pas une ancre désactivée. Elle garde la couleur de sa plateforme, d'un cran plus sourde, et dit « bientôt disponible » à la place de l'action.
- Un seul composant porte le CTA générique : `DownloadAppButton` (variantes `primary` / `nav` / `hero` / `footer`). Ne le recopiez pas par emplacement.
- **Sur petit écran, la barre porte le sélecteur de langue** et non le CTA générique ; les deux plateformes sont dans le menu. Le panneau du menu défile (`overflow-y: auto`, `max-height: calc(100dvh - 32px)`) : il porte la navigation, la langue et les deux boutons.

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
- **Budget** : `bun run budget` mesure `jsGzip` (entrée + imports statiques), `jsGzipPerLocale` (ce qu'un visiteur télécharge dans sa langue, la plus lourde) et `jsGzipAllLocales` (tout ce que le build produit, plafonné par langue). Un visiteur paie une langue ; le build les porte toutes.

## Icônes en volume

Les icônes du manifeste et de la section 06 et les cinq drapeaux du sélecteur de langue sont **dessinés** dans `src/components/Icons3D.tsx` et **servis en fichiers `.svg`** : `scripts/build-icons.tsx` les exporte vers `src/assets/icons/` avant chaque `build` et chaque `dev`. Ne les rendez pas en SVG inline dans la page : c'est de l'illustration pure, qui n'a rien à faire dans le JavaScript que chaque visiteur télécharge — inline, elles ont fait dépasser le budget. Toute nouvelle icône suit la même recette, décrite en entier dans `docs/design/icones-3d-prompt.md` (prompt réutilisable sur d'autres sites).

- **Modifiez le composant, jamais le fichier `.svg`** : il est régénéré et vos changements seraient écrasés.
- **`build.assetsInlineLimit` reste à 0** dans `vite.config.ts`. Sinon Vite replie tout fichier de moins de 4 ko dans le JavaScript, en URL encodée pour les SVG. Un test l'interdit.

- **Une lumière, en haut à gauche, pour toute la famille.** Couches, de l'arrière vers l'avant : ombre au sol, épaisseur décalée de 4-5 px, face en dégradé diagonal, liseré spéculaire, zones creusées avec paroi, détails en relief, brillance découpée à la forme.
- **SVG pur** : ni image embarquée, ni ressource externe, ni texte, ni filtre de flou. Les ombres sont des dégradés.
- **Identifiants via `useId()`** dans le composant. En fichier, chaque icône est son propre document ; un test vérifie que chaque `url(#…)` mène à un identifiant du même fichier.
- **Décoratives** : `<img alt="" loading="lazy">`. Le texte porte le sens.
- **Palette de la marque uniquement** : violet `#7c5cff` et ses teintes, bleu `#5a7cf5`, surface `#1d2247`, ombre `#010208`.
- **Taille** : 88-104 px sur ordinateur ; sur téléphone, liste avec l'icône à 64-68 px à gauche. Avant d'intégrer, chercher les règles responsives qui visent déjà les `svg` du conteneur : deux sections avaient une règle qui les aurait écrasées à 16 et 30 px.
- **Relire en grand avant d'intégrer** : rendre chaque icône à 280 px sur le vrai fond et chercher les défauts connus — brillance en rectangle, ombre invisible, creux sans paroi, chevauchements, pièces qui dépassent. **Puis la relire à sa vraie taille** : un drapeau est affiché à 24 px, c'est sa géométrie qui le porte.
- **Un drapeau est un symbole national, pas une illustration de marque** : géométrie et couleurs exactes, seul le cartouche autour (coin arrondi, liseré, reflet) appartient à AVYOR. Une langue n'est pas un pays : là où aucun drapeau ne peut représenter une langue, on prend le plus neutre de ceux en usage — l'arabe est signalé par le drapeau des Émirats arabes unis, et non par un drapeau portant une inscription religieuse.

## Arrière-plans des Heroes

`src/components/PageHero.tsx` affiche un poster immédiatement puis charge la vidéo ; `src/config/page-heroes.ts` impose les noms de fichiers. Pour refaire un arrière-plan, suivez `docs/design/heroes-arriere-plan-prompt.md`, qui contient les prompts de génération et les cibles mesurables.

- **Aucun logo ni mot AVYOR incrusté dans l'image**, et **aucune interface d'application lisible** : le téléphone de la page porte les vrais écrans, et un texte généré se déforme d'une image à l'autre.
- **Zones mesurées, sur ordinateur** : 0-46 % le titre (calme mais pas noir), 46-68 % le sujet, 68-100 % recouvert par le téléphone. Sur mobile l'arrière-plan est couvert à 90 % : visez l'ambiance, pas une scène.
- **Le voile de `.page-hero-surface::after` a été calibré pour des images très sombres.** Toute image plus lisible demande de l'alléger, sinon elle s'éteint.
- Le poster est **une image du film**, jamais un rendu séparé.

## Déploiement

Vercel, configuré par `vercel.json`. Runbook complet : `docs/site/deploiement-vercel.md`.

- **`dist/_headers` n'est lu que par Netlify et Cloudflare.** Vercel l'ignore : tout en-tête ajouté là doit l'être aussi dans `vercel.json`, et un test échoue sinon.
- **`/assets/` mélange fichiers empreintés et médias au nom stable.** Le cache immuable est réservé aux `.js`, `.css` et `.woff2`. Les médias sont en `max-age=0, must-revalidate`.
- **Vercel applique les en-têtes aux réponses d'erreur aussi.** Un `max-age` positif sur un média fige une 404 passagère dans le navigateur : c'est arrivé au logo, resté introuvable une semaine après son retour. Ne donnez jamais de `max-age` positif à un fichier au nom stable.
- **Le site reste `noindex` tant qu'il vit sur un domaine `vercel.app`.** `scripts/vercel-build.mjs` refuse de construire un site indexable sur ce domaine, pour ne pas mettre une copie en concurrence avec le vrai domaine.
- **Tout motif de `.vercelignore` commence par `/`.** Sans ancrage, la syntaxe gitignore vise le nom à toutes les profondeurs : `brand/` a exclu `public/assets/brand/` et le logo n'a jamais été servi en production.
- **Aucune réécriture attrape-tout vers `/index.html`.** Chaque route est pré-rendue et l'accès direct fonctionne : cette règle, réflexe des projets React classiques, servirait l'accueil en 200 à la place de la page 404. Un test la refuse.
- **Un outil de mesure installé doit être déclaré dans `src/content/legal/<lang>.json`, dans chaque langue**, et la mesure ne part que du déploiement de production (`VERCEL_ENV`), ses scripts venant d'un chemin que seul Vercel sert. Un test vérifie les deux.
- L'URL canonique ne vient pas d'un fichier versionné : elle est déduite de `VERCEL_PROJECT_PRODUCTION_URL`, ou forcée par `VITE_SITE_URL`.

## Règles SEO

- Les tests portent sur le **HTML construit** (`tests/seo/`), pas sur le source.
- Chaque page indexable : `title` unique **dans sa langue**, `description` unique, un seul `h1`, `canonical`, OpenGraph avec `og:locale`, Twitter.
- **Référencement international** : chaque page indexable déclare `hreflang` pour les cinq langues **et** pour elle-même, plus un `x-default` vers le français ; le sitemap répète ces alternates en `xhtml:link`. Une chaîne non réciproque est ignorée par Google — un test la vérifie dans les deux sens.
- Les pages `noindex` (juridique) ne déclarent **pas** d'alternates : on ne demande pas aux moteurs d'indexer des traductions de pages qu'on leur demande d'ignorer.
- `dist/404.html` est servi pour toutes les langues : il porte `data-fallback="404"`, et le navigateur reprend la page dans la langue de l'adresse demandée.
- Chaque langue publie son `llms.txt` (`/llms.txt`, `/en/llms.txt`, …), qui renvoie vers les autres.
- **Aucun `localhost`, `127.0.0.1` ni port de développement** dans le build de production : un test l'interdit.
- Le **schema décrit le visible** : pas de `FAQPage` sans FAQ affichée, pas de `SoftwareApplication` sans URL de store vérifiée, jamais d'`AggregateRating` ni de prix.
- Pas de clé de traduction brute, pas de mot dupliqué dans les titres.

## À préserver

L'identité visuelle sombre, la typographie Manrope locale, l'intro masque-logo une fois par session, la grille éditoriale et le ton factuel. Enrichissez ; ne refondez pas.

## Heroes Creators, Marques et Produit

`PageHero` conserve le gabarit éditorial et ajoute un fond uniquement aux trois routes déclarées dans `src/config/page-heroes.ts`. Les images générées et leurs prompts sont conservés dans `brand/sources/page-heroes/`. `node scripts/build-page-heroes.mjs` produit les WebP et les boucles H.264 dans `src/assets/heroes/` ; FFmpeg n'est nécessaire qu'à cette génération explicite, jamais au build du site.

Le poster est servi dès le HTML. Une seule vidéo, choisie pour le viewport, est chargée après le rendu. Respecter l'économie de données, la pause manuelle, la visibilité de la page et le changement de préférence reduced-motion pendant la lecture. Ne pas remplacer les vrais écrans `Device` par une UI générée. Les tests `tests/e2e/page-heroes.spec.ts` couvrent ces comportements et le rendu sans JavaScript.
