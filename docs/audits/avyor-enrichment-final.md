# AVYOR — Rapport de la passe d'enrichissement

17 septembre 2026. Point de départ et périmètre conservé : `docs/audits/avyor-enrichment-before.md`.

Pipeline complet vert à la clôture : `bun run test:all` → typecheck, lint, **23** tests unitaires, build 12 pages + 404, **20** tests SEO sur le HTML construit, **19** tests E2E (3 ignorés, propres à l'autre profil d'appareil).

---

## Preserved

Volontairement non modifiés, parce qu'ils fonctionnaient déjà :

- La direction visuelle sombre, les tokens, la typographie Manrope locale, la grille éditoriale.
- La homepage et ses sections (manifesto, Story sticky, audiences, feed, Workflow, Gallery, trust, FAQ).
- Le concept d'intro masque-logo, **qui existait déjà** et correspondait au brief : il a été optimisé, pas réécrit.
- `src/lib/store-url.ts`, garde-fou qui rend structurellement impossible un faux lien de store.
- Le ton factuel du contenu et les mentions « données de démonstration ».
- Les pages Creators, Marques, Produit, Comment ça marche, Sécurité, FAQ, Contact : leur contenu était déjà spécifique et suffisant. **Elles n'ont pas été enrichies** — voir « Non fait ».

## Store

Le défaut visible de la référence est corrigé.

- `src/lib/app-download.ts` : module pur, `buildStores(apple, google)`. Une plateforme est disponible **si et seulement si** elle a une URL validée.
- `src/config.ts` dérive `stores`, `storeFor`, `anyStoreAvailable`. Source de vérité unique : publier l'app = changer une variable d'environnement, et navbar, hero, page download et footer suivent.
- `src/components/StoreCard.tsx` : **un** composant, deux états.
  - `available` → badge officiel dans une ancre réelle.
  - `coming-soon` → même badge officiel, conteneur AVYOR discret, mention « Bientôt disponible ». **Ce n'est pas un lien** : aucun `href`, rien à cliquer, pas d'ancre désactivée.
- `<Smartphone />` a disparu. Les visuels Apple et Google Play sont rendus **sans modification** : pas de dégradé AVYOR, pas de contour, pas de déformation. Seul le conteneur est AVYOR.
- Les anciennes règles `.store-pending` / `.soon` / `.store-link` ont été migrées vers `.store-card`, y compris leurs surcharges responsive.

## Navigation CTA

- `src/components/ui/hover-border-gradient.tsx` — primitive, sans connaissance du produit.
- `src/components/DownloadAppButton.tsx` — couche marque : libellé, destination, icône, signal de conversion. Variantes `primary` / `nav` / `hero` / `footer`, tailles `sm` / `md` / `lg`. Navbar desktop, menu mobile et hero l'utilisent tous les trois ; aucune copie par emplacement.
- Le bouton se lit comme l'action principale **avant** toute interaction (dégradé violet plein) ; le bord qui tourne ne fait que récompenser le survol.
- Menu mobile : CTA pleine largeur en fin de panneau, libellé « Télécharger l'app ».
- iPhone SE : le CTA cassait le header à 320 px. Sous 400 px, le mot-symbole laisse place à la marque seule ; le lien garde son nom accessible. Vérifié sans débordement à 320 / 375 / 430.

### Sur le composant Aceternity

La commande `bunx --bun shadcn@latest add @aceternity/hover-border-gradient-demo` **n'a pas été lancée**, après inspection du code réel du registre. Quatre raisons concrètes :

1. `components.json` déclare des alias `@/components` et `@/lib/utils` **qui n'existent ni dans `tsconfig.json` ni dans `vite.config.ts`**. Le fichier livré importe `@/lib/utils` : il n'aurait pas compilé.
2. Il importe `motion` ; le site charge `LazyMotion` + `domAnimation` et n'utilise que `m`. L'import aurait annulé ce découpage.
3. Il maintient un `setInterval` **permanent** qui change un état React toutes les secondes, sur chaque page portant le bouton — donc dans une navbar fixe, en continu.
4. Il est écrit en utilitaires Tailwind avec `bg-black` et un bleu `#3275F8` codés en dur, là où ce projet a un design system CSS.

Le concept a donc été repris — API (`as`, `containerClassName`, `className`), structure, bord qui se déplace — avec un dégradé conique animé en CSS : aucun re-rendu, aucun timer, `prefers-reduced-motion` respecté, couleurs violet → bleu AVYOR.

## Loader

L'intro existait et remplissait déjà le brief : masque sur le logo réel qui s'ouvre sur le Hero, une fois par session, `aria-hidden`, `pointer-events: none`, pas de verrou de défilement, animation de secours CSS, timer nettoyé, ignorée en `prefers-reduced-motion` et si le démarrage dépasse 500 ms.

Un vrai défaut a été corrigé : le masque chargeait **`logo.png`, 447 Ko**, en tout premier, devant l'affiche du Hero. Un asset dédié `assets/brand/logo-mask.webp` (512 px, alpha, **45 Ko**) a été ajouté au pipeline `scripts/build-assets.mjs`. Le master reste intact byte pour byte.

## Pages enrichies

- **`/download/`** : intro reformulée, cinq sections réelles (ce que permet l'app, Creator ou marque, appareils, coût, contact) et liens internes vers Produit / Parcours / FAQ. La page indique explicitement qu'aucun fichier d'installation n'est distribué hors des deux magasins.
- **`/privacy/`, `/terms/`, `/legal/`** : voir ci-dessous.

## Privacy

De 8 à **26 sections** (~1 590 mots). Renseignées à partir du fonctionnement réel : Supabase pour l'authentification et l'hébergement, Stripe pour les paiements, PostHog pour la mesure, Sentry pour les erreurs ; catégories de données, visibilité des profils, messagerie, matching, notifications ; droits RGPD détaillés un par un ; **procédure réelle de suppression de compte** (Réglages → Sécurité) ; autorité de contrôle avec le lien CNIL.

Le site lui-même est traité séparément et honnêtement : aucun cookie, aucune mesure d'audience, une seule préférence de session pour l'intro.

**9 TODO juridiques** explicites, affichés dans la page : identité de l'éditeur, hébergeur du site, événements PostHog, localisation des prestataires, mécanisme de transfert hors UE, durées de conservation chiffrées, désignation d'un DPO, âge minimum, autorité chef de file.

## Terms

De 8 à **28 sections** (~1 420 mots) : objet, définitions, accès, compte, obligations, profils Creator, comptes marque, campagnes, candidatures et matching, collaborations, contenus, **droits d'usage sur les livrables**, propriété intellectuelle, messagerie, paiements, annulations, comportements interdits, modération, suspension, suppression, responsabilité, disponibilité, services tiers, données, modification, contact.

**2 TODO** : âge minimum, droit applicable et juridiction compétente. Aucune clause de compétence n'a été présumée.

## Legal

De 3 à **9 sections**, dont une section « Marques de tiers » qui attribue explicitement App Store à Apple Inc. et Google Play à Google LLC.

**5 TODO** : raison sociale et immatriculation, directeur de la publication, coordonnées postales, entités des hébergeurs, hébergeur du site.

**Aucune donnée juridique n'a été inventée.** Un test échoue sur tout SIRET, forme sociale chiffrée ou adresse d'apparence réelle.

## Table des matières juridique

`LegalTableOfContents` : sticky à gauche en desktop, repliable en mobile, ancres stables, deep links (`/privacy/#supprimer-mon-compte`) fonctionnels après rechargement, section active via IntersectionObserver — **aucune écoute de scroll, aucun `setState` par pixel**.

Deux défauts trouvés et corrigés en cours de route : l'ancre atterrissait 230 px trop bas (`scroll-padding-top` et `scroll-margin-top` s'additionnaient), et le sommaire actif était décalé d'une section.

## SEO

Nouveaux invariants sur le **HTML construit** :

- Aucun `localhost`, `127.0.0.1`, `0.0.0.0`, `:4173` ni `:5173` dans les pages, le sitemap, `robots.txt`, `llms.txt` ou `build-meta.json`.
- Tout lien externe vers un domaine ressemblant à un store **doit** être `apps.apple.com` ou `play.google.com`.
- La page download expose exactement deux cartes, avec les deux visuels officiels, sans lien sur une plateforme non publiée.
- Les trois documents juridiques : sommaire d'au moins 9 entrées, **chaque ancre résout vers une section réellement servie**, aucun doublon, liens croisés entre les trois.

Vérification de mutation effectuée : casser une ancre dans `dist/` fait bien tomber la suite de 20 à 19.

Inchangés et toujours vérifiés : titres et descriptions uniques, un seul `h1`, canonical, OG, Twitter, absence de `href="#"`, schema conforme au visible (`FAQPage` contrôlé texte par texte, `SoftwareApplication` seulement si une URL de store est vérifiée, jamais d'`AggregateRating`).

## Motion

Aucun système d'animation n'a été ajouté : le site en avait déjà un cohérent. Les seules animations nouvelles sont le bord du CTA et les micro-transitions des cartes store, toutes neutralisées sous `prefers-reduced-motion`.

## Performance

Mesures réelles, Lighthouse mobile en local sur le build de prévisualisation :

| | Avant (20:19) | Après (21:02) |
| --- | --- | --- |
| Performance | 0,69 | **0,86** |
| LCP | 5,8 s | **4,1 s** |
| FCP | 3,6 s | **1,8 s** |
| TBT | 10 ms | **0 ms** |
| CLS | 0 | 0 |
| Accessibilité | 1,00 | 1,00 |

Le score SEO passe de 1,00 à 0,69 pour **une seule raison** : l'unique audit en échec est `is-crawlable`, c'est-à-dire le `noindex` **volontaire** de la prévisualisation (`VITE_SITE_INDEXABLE=false`). Ce n'est pas une régression. Le run « avant » avait été fait en configuration indexable.

Ce sont des mesures de laboratoire sur une machine unique, pas des données terrain.

### Budget

Le contenu juridique (8 Ko gzip) partait dans le bundle que **toutes** les pages téléchargent, faisant passer le JS de 141 974 à 148 280 octets — au-dessus du budget. Plutôt que relever le plafond, le contenu a été isolé : `App` reçoit les documents en propriété, le serveur les fournit au pré-rendu, et le client ne les importe que sur les trois routes concernées.

- Bundle principal : **116,8 → 109,5 Ko gzip**.
- JS chargé par une page ordinaire : **140 986 octets**, soit **moins** que les 141 974 de départ.

`scripts/budget.mjs` mesure désormais l'entrée et ses imports statiques — ce qu'une page télécharge réellement — et conserve un plafond global (`jsGzipTotal`, 165 Ko) pour que le découpage ne serve pas à masquer une croissance.

## Accessibility

axe-core (`wcag2a`, `wcag2aa`, `wcag21aa`) sans violation sur `/`, `/creators/`, `/brands/`, `/privacy/`, `/terms/`, `/legal/`, en desktop et en mobile. Focus visible sur le CTA, navigation clavier du sommaire juridique vérifiée, restauration du focus du menu mobile inchangée, aucun débordement horizontal de 320 px à 1440 px.

## Tests

| Commande | Résultat |
| --- | --- |
| `bun run typecheck` | OK |
| `bun run lint` | OK |
| `bun run test` | 23 / 23 |
| `bun run build` | 12 pages + 404 |
| `bun run test:seo` | 20 / 20 |
| `bun run test:e2e` | 19 passés, 3 ignorés |
| `bun run budget` | dans les limites |
| `bun run measure` | voir Performance |

Nouveaux fichiers de test : `tests/unit/app-download.test.mjs`, `tests/unit/download-cta.test.mjs`, `tests/unit/intro.test.mjs`, `tests/unit/legal.test.mjs`.

---

# Seconde passe — lots 7 à 21

Réalisée après lecture de l'application réelle (`/Users/shavod/Developer/Avyor`). Toutes les affirmations ajoutées au site sont traçables dans `src/i18n/resources/fr.json`, `app/(creator)`, `app/(advertiser)` et `src/features/`. Détail dans `docs/audits/avyor-content-audit.md`.

## Ce que la lecture de l'app a changé

Le site sous-décrivait nettement le produit. Faits vérifiés qui n'apparaissaient nulle part :

- Le montant **se négocie dans la conversation**, chacun pouvant faire une **contre-offre**.
- Une fois la proposition acceptée, la somme est **conservée par AVYOR** jusqu'à validation du livrable.
- Le matching s'explique par **six signaux nommés** : niche, plateformes cibles, taux d'engagement, localisation et langue, score de confiance, activité récente.
- L'assistant de campagne compte **quatre étapes** et trois **modèles de rémunération** (fixe, commission, mixte).
- Les candidatures ont **six statuts**, et la marque peut constituer une **shortlist**.
- La création est assistée par des **modèles vidéo guidés** (sept familles, avec étapes, durée et difficulté), un studio, des séries et des stories.
- Le **parcours** comporte XP, niveaux, missions, badges, projets et chronologie.

### Et ce que la lecture a permis d'éviter

- **L'authentification à deux facteurs n'existe pas** : l'app affiche « Bientôt disponible ». Un test interdit désormais d'en parler.
- **Une candidature envoyée ne peut pas être retirée.** Le site le dit explicitement, et un test empêche d'affirmer le contraire.
- Aucun délai de virement chiffré : il dépend du calendrier du compte Stripe.

## Pages enrichies (lots 8 à 11)

| Page | Avant | Après |
| --- | --- | --- |
| `/creators/` | 4 sections | **9** — création assistée, séries et stories, statuts de candidature, négociation, versement en quatre étapes, parcours |
| `/brands/` | 4 sections | **8** — assistant en quatre étapes, modèles de rémunération, ciblage, raisons de compatibilité, shortlist, séquestre |
| `/features/` | 6 sections plates | **8** regroupées en quatre familles : Découvrir, Créer, Collaborer, Piloter |
| `/how-it-works/` | 4 sections mêlées | **10** — deux parcours de cinq étapes, alignés sur les écrans réels |
| `/security/` | 4 sections | **8** — contrôles de compte réels, suppression définitive, séquestre, suivi du versement, motifs de signalement, blocage |
| `/faq/` | 7 questions | **16**, alignées sur la FAQ interne de l'application |
| `/contact/` | 2 sections | **3** — ajout de la voie de signalement |

Les métadonnées et les introductions de ces pages ont été réécrites pour correspondre à leur nouveau contenu.

## Maillage interne (lot 15)

`relatedLinks` dans `src/content/site.ts` : une suite contextuelle par page, au lieu des mêmes trois liens partout. Creators → parcours, Marques → produit, Produit → téléchargement, FAQ → documents juridiques. Un test vérifie que chaque page de contenu propose au moins trois liens, qu'aucun ne pointe vers elle-même, qu'il n'y a pas de doublon et qu'aucune cible n'est morte. Un autre vérifie le fil d'Ariane sur chaque page profonde.

## Motion (lot 16)

`components/motion/Reveal.tsx` + `lib/reveal.ts` : une primitive réutilisable au lieu de recopier `initial` / `animate` partout.

Choix structurant : **l'état masqué n'existe que sous `.motion-ready`**, classe ajoutée par le client après reprise. Sans JavaScript — et pour un robot — le contenu est simplement visible. Aucun état React, aucune écoute de scroll : de simples bascules de classe sur IntersectionObserver.

Trois défauts trouvés et corrigés pendant les tests :

1. Le contenu **sauté** par un scroll instantané (ancre, retour en haut, position restaurée) restait masqué à jamais. L'observateur balaie désormais les blocs passés au-dessus du viewport.
2. Le contenu déjà peint au chargement clignotait. Il est marqué visible **avant** que la classe racine ne soit posée.
3. Mon premier test supposait un viewport desktop ; il exprime maintenant le bon invariant, quelle que soit la taille.

## Numérotation

`0{i + 1}` produisait « 010 » dès la dixième section — visible sur `/how-it-works/` et la FAQ. Un helper `ordinal()` corrige les cinq emplacements concernés, avec un test sur le HTML construit.

## Responsive et accessibilité (lot 17)

Nouveau test : **12 routes × 8 largeurs** (320, 375, 390, 430, 768, 1024, 1280, 1440). Il a trouvé un vrai bug — `/privacy/` débordait de 14 px à 320 px, le `h1` « Politique de confidentialité. » ne tenant pas au corps minimum. Corrigé par `hyphens: auto` et `overflow-wrap: break-word` sur les titres, sans toucher à l'échelle typographique.

axe-core (`wcag2a`, `wcag2aa`, `wcag21aa`) couvre désormais **les douze routes**, en desktop et en mobile, sans violation. Les cibles tactiles du header sont vérifiées.

## Performance (lot 18)

Le contenu enrichi est repassé au-dessus du budget JS (144 881 octets). Plutôt que relever le plafond, les corps de page ont rejoint le mécanisme déjà en place pour le juridique : `src/content/sections.ts` et `src/content/legal.json` sont réunis dans un chunk `deep` que **seule une page intérieure** charge, à la demande.

- Page ordinaire : **141 026 octets** de JS, sous le budget, et toujours sous les 141 974 du point de départ.
- Accueil : ne télécharge **rien** de ce contenu.
- Bundle principal : 109,6 Ko gzip.

Lighthouse mobile après enrichissement : performance **0,87**, LCP **3,9 s**, FCP **1,8 s**, CLS **0**, TBT 10 ms, accessibilité **1,00**. Le score SEO de 0,69 reste dû au seul `noindex` volontaire de la prévisualisation.

## Incident pendant le lot 18 — et sa réparation

Mon script d'extraction des sections a corrompu `site.ts` et `sections.ts` : il cherchait un tableau sur plusieurs lignes et ne gérait pas le cas `sections: [],` écrit sur une seule ligne, ce qui lui a fait avaler des blocs de page entiers.

Réparation : le contenu a été récupéré depuis `.ssr/entry-server.js`, produit par le dernier build vert, puis les deux fichiers ont été **régénérés à partir de données structurées** plutôt que par chirurgie d'expressions régulières. Les douze pages, leurs sections, les seize questions, les quatre scènes, la navigation et les liens contextuels ont été vérifiés un à un après restauration. Les 24 tests SEO sur le HTML construit confirment que le rendu est identique.

## Tests — état final

| Commande | Résultat |
| --- | --- |
| `bun run typecheck` | OK |
| `bun run lint` | OK |
| `bun run test` | **28 / 28** |
| `bun run build` | 12 pages + 404 |
| `bun run test:seo` | **24 / 24** |
| `bun run test:e2e` | **27 passés**, 3 ignorés |
| `bun run budget` | dans les limites |

Fichiers de test ajoutés au fil des deux passes : `app-download`, `download-cta`, `intro`, `legal`, `content`.

## Non fait — à décider

- **§29** détection d'appareil, **§95** dock de téléchargement sticky, storytelling device sticky, QR code : évalués, non implémentés. Le QR est de toute façon exclu tant qu'aucune URL de store réelle n'existe.
- **§93** nouvelle image Open Graph : l'actuelle est déjà composée du master, d'une vraie capture et d'un texte éditorial.
- Le site reste **en français uniquement**, alors que l'application est traduite en cinq langues avec prise en charge RTL. Une version multilingue du site est un projet à part entière.

## Remaining risks

1. **Les 16 TODO juridiques bloquent la mise en production.** Les mentions légales et la politique de confidentialité ne sont pas conformes tant que l'identité de l'éditeur, l'hébergeur, les durées de conservation et le droit applicable ne sont pas fournis. Ces documents n'ont pas été relus par un juriste et ne valent pas conseil juridique.
2. **Le visuel App Store livré est la version anglaise** (`Download_on_the_App_Store_Badge_US-UK`) sur un site en français ; le visuel Google Play, lui, est déjà en français. Apple distribue une version française officielle : il faut la récupérer depuis les ressources Apple et remplacer le fichier. Le redessiner serait contraire aux règles d'Apple, donc rien n'a été fabriqué.
3. `VITE_SITE_INDEXABLE=false` et le domaine de prévisualisation sont toujours actifs. Le domaine `avyor.app` reste à confirmer avant publication.
4. Les mesures de performance sont des runs de laboratoire uniques, à revalider sur l'hébergement réel.
5. `noindex` est posé sur `/privacy/`, `/terms/` et `/legal/`. C'est cohérent avec leur état de préparation, mais à rouvrir au lancement.
