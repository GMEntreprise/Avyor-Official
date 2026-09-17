# AVYOR — Audit avant passe d'enrichissement

Date : 17 septembre 2026. État de départ : **tout est vert** (typecheck, lint, 6 tests unitaires, build 12 pages + 404, 14 tests SEO sur le HTML construit).

## Architecture actuelle

React 19 + Vite 7 + TypeScript strict, Bun. Pas de routeur client : `scripts/prerender.mjs` rend chaque route en HTML statique via `src/entry-server.tsx`, puis `entry-client.tsx` hydrate. Le contenu est typé et centralisé dans `src/content/site.ts` (`pages`, `faqs`, `scenes`, `navigation`, `facts`) et `src/content/legal.json`.

Scripts réels : `dev`, `build`, `preview`, `typecheck`, `lint`, `test` (node:test), `test:seo`, `test:e2e` (Playwright), `test:all`, `measure`, `budget`, `assets:build`, `webp`, `format`.

## Composants existants

| Fichier | Rôle |
| --- | --- |
| `Navbar.tsx` | Header flottant + `Brand`, sentinelle IntersectionObserver pour l'état `compact`, menu mobile Radix Dialog |
| `Hero.tsx` | Vidéo différée (1,2 s après `load`), respect `saveData` et reduced motion, contrôle lecture/pause |
| `Intro.tsx` | **Loader de marque déjà présent** : masque SVG sur le logo réel qui s'ouvre, une fois par session |
| `Story.tsx` | Device sticky piloté par IntersectionObserver sur 4 scènes |
| `Workflow.tsx` | Onglets Radix Creator / marque |
| `Gallery.tsx` | Carrousel captures, clavier + pointer drag |
| `Faq.tsx` | `<details>` natifs alimentés par `faqs` |
| `Device.tsx` | Captures réelles responsive + `DemoCaption` (mention données de démonstration) |
| `StoreButtons.tsx` | Badges officiels si URL vérifiée, **sinon fallback icône générique** |
| `Footer.tsx` | CTA final, navigation, signature SVG avec glow au pointeur |
| `ui/button.tsx` | `cva` : variants primary / secondary / text, tailles default / small |
| `ui/tabs.tsx` | Ré-export Radix |

## Design tokens

`src/styles.css` (2206 lignes, CSS natif + Tailwind v4) : `--navy #0b1020`, `--surface #1a1f2e`, `--violet #7c5cff`, `--muted #a9b1c3`, `--line rgba(199,207,234,.15)`, `--fast .18s`, `--normal .28s`, `--ease cubic-bezier(.22,1,.36,1)`. Miroir JS dans `src/config.ts` → `motionTokens`. Typo Manrope Variable locale, préchargée au build.

## Ce qui est explicitement à préserver

- L'intro masque logo → révélation (le concept demandé **existe déjà** et fonctionne).
- La direction sombre premium, les tokens, la typographie, la grille éditoriale.
- `src/lib/store-url.ts` : garde-fou qui n'accepte que des URL HTTPS sur `apps.apple.com` / `play.google.com`. C'est ce qui empêche structurellement tout faux lien store.
- `DemoCaption` partout où des captures apparaissent.
- Le ton factuel du contenu : aucun chiffre, avis ou logo client inventé.
- La suite de tests SEO sur le HTML **construit** (pas sur le source).

## Problèmes constatés

1. **P0 — Cartes store génériques.** `StoreButtons.tsx` utilise `<Smartphone />` de lucide quand l'URL store est absente. C'est le défaut visible sur la référence : la zone ne communique ni App Store ni Google Play. Les vrais badges officiels existent pourtant déjà dans `public/assets/badges/`, mais ne sont montés que dans l'état disponible, qui n'arrivera qu'au lancement.
2. **P0 — CTA navbar non distinctif.** `<Button size="small" className="nav-download">` : même traitement visuel que le reste, pas de rupture avec les liens de navigation.
3. **P0 — CTA mobile faible.** Libellé « Découvrir le téléchargement », en bas de panneau, sans traitement particulier.
4. **P1 — Pages légales structurellement courtes.** `privacy` 8 sections, `terms` 8, `legal` 3. Pas de sommaire, pas d'ancres stables, pas de deep links.
5. **P1 — Aucun test anti-`localhost`** dans le HTML de production.
6. **Constat asset** : le badge App Store présent est la version **anglaise** (`Download_on_the_App_Store_Badge_US-UK`), alors que le site est en français. Apple fournit une version française officielle ; elle n'est pas dans le dépôt.

## Ce qui est déjà conforme

- `href="#"` déjà interdit par test SEO.
- Source de vérité store déjà unique (`src/config.ts` ← variables d'environnement ← `storeUrl`). Pas de `const iosAvailable = false` dupliqué.
- Schema `SoftwareApplication` déjà conditionné à l'existence d'une vraie URL ; `FAQPage` déjà conditionné à une FAQ visible et vérifié texte par texte contre le HTML.
- `motion` (Framer Motion 12) déjà installé, chargé en `LazyMotion` + `domAnimation`.
- shadcn configuré (`components.json`, alias `@/components`, `@/lib/utils`, lucide).
- Reduced motion respecté dans `Intro`, `Hero`, `Story`, `Gallery`.
