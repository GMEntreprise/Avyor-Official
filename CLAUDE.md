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
- **Une animation ne masque jamais du contenu servi.** L'état masqué de `Reveal` est porté par `.motion-ready`, posée par le client après reprise : sans JavaScript, tout reste lisible. Un test le vérifie sur le CSS construit.
- Numérotez avec `ordinal()` : `0{i + 1}` donne « 010 » à partir de la dixième.
- `motion` est chargé via `LazyMotion` + `domAnimation` : importez `m`, jamais `motion`.
- **L'alias `@/` n'est pas configuré.** Les composants shadcn/Aceternity doivent être adaptés en imports relatifs avant intégration.
- Réutilisez les tokens de `src/styles.css` (`--navy`, `--surface`, `--violet`, `--muted`, `--line`, `--fast`, `--normal`, `--ease`). Pas de nouveau rayon, couleur, ombre ou police arbitraire.
- **Budget** : `bun run budget` mesure le JS réellement chargé par une page (entrée + imports statiques), pas la somme de tous les chunks. Le contenu volumineux propre à quelques routes se charge à la demande.

## Règles SEO

- Les tests portent sur le **HTML construit** (`tests/seo/`), pas sur le source.
- Chaque page indexable : `title` unique, `description` unique, un seul `h1`, `canonical`, OpenGraph, Twitter.
- **Aucun `localhost`, `127.0.0.1` ni port de développement** dans le build de production : un test l'interdit.
- Le **schema décrit le visible** : pas de `FAQPage` sans FAQ affichée, pas de `SoftwareApplication` sans URL de store vérifiée, jamais d'`AggregateRating` ni de prix.
- Pas de clé de traduction brute, pas de mot dupliqué dans les titres.

## À préserver

L'identité visuelle sombre, la typographie Manrope locale, l'intro masque-logo une fois par session, la grille éditoriale et le ton factuel. Enrichissez ; ne refondez pas.
