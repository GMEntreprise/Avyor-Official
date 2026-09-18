# AVYOR — production Hero
Production des images : 17 septembre 2026. Vérification Remotion : 18 septembre 2026.

## Livrables terminés
- Un avatar maître, cinq plans paysage, cinq plans mobiles composés séparément.
- Même personnage fictif, tenue graphite, studio navy, accents violets. Plan 03 : mains d'un interlocuteur côté marque, sans nouveau visage.
- Enseigne AVYOR nette dans les décors, générée avec le fichier officiel `brand/masters/avyor-logo.png` comme référence. L'enseigne est une interprétation photographique générée, pas un collage pixel pour pixel du logo.
- Écrans volontairement neutres sur les PNG sources ; captures de l'application ajoutées uniquement dans Remotion.
- Deux animatiques H.264, deux posters PNG et WebP.
- Projet Remotion autonome, tests, commandes de rendu et contrôles de production.

## Fichiers
`video/source/images/avatar-master.png`
`video/source/images/shot-01-start.png`
`video/source/images/shot-02-recording.png`
`video/source/images/shot-03-brand-discovery.png`
`video/source/images/shot-04-collaboration.png`
`video/source/images/shot-05-final.png`

Les cinq variantes verticales portent les mêmes noms dans `video/source/images/mobile/`.
Dimensions natives livrées : 1672 × 941 paysage, 941 × 1672 portrait. Ratios proches de 16:9 / 9:16 ; aucun agrandissement des PNG sources.
Les compositions sont rendues en 1920 × 1080 / 1080 × 1920 ; ces dimensions de sortie ne signifient pas un gain de détail natif.

Galerie locale : `video/index.html`. Archive : `video/avyor-hero-images.zip`.
Prompts image : `docs/video/image-prompts.json`. Prompts de mouvement : `docs/video/runway-prompts.json`.
Manifeste dimensions / tailles / SHA-256 : `video/source/images/manifest.json`.

## Storyboard et temps
24 fps. Chaque source demandée à Runway : 3 s / 72 images. Recouvrement de 6 images entre plans. Total : 336 images, 14 s.

| Plan | Début | Fin exclusive | Intention |
|---|---:|---:|---|
| 01 | 0 | 72 | Régler le téléphone |
| 02 | 66 | 138 | Tourner le contenu produit |
| 03 | 132 | 204 | Découvrir un Creator côté marque |
| 04 | 198 | 270 | Consulter une campagne et échanger |
| 05 | 264 | 336 | Finaliser le tournage et revenir au début |

Les 8 dernières images fondent vers la première image figée du film. Cette solution est testée pour les animatiques ; le mouvement final / raccord de caméra sera réévalué sur le métrage Runway.
Les transitions actuelles sont des fondus de prévisualisation avec un accent violet discret. Les match cuts motivés par les mouvements réels restent à régler sur les clips définitifs.

## Installation et architecture
Générateur officiel : `bunx create-video@latest --yes --blank --no-tailwind`.
Template courant : Remotion 4.0.526, React 19.2.3, TypeScript 5.9.3. Bun 1.3.14.
Projet dans `tools/avyor-video/`, lockfile propre. Les packages et sources du site n'ont pas été modifiés par ce travail.

`src/config/timing.ts` : timing unique.
`src/config/assets.ts` : association des images et captures.
`production.json` : sélection unique des clips Runway approuvés, actuellement vide.
`PhoneScreen` : projection des captures sur quatre coins mesurés, avec perspective.
`sampleTrack` : interpolation déterministe de points de suivi normalisés.
`CinematicOverlay`, `AvyorPulse`, `SafeAreaGuide` : traitement visuel et guide optionnel.
Compositions séparées desktop, mobile et posters. Les animations sont entièrement calculées à partir des frames.

Les dérivés PNG/WebP des posters sortent de Remotion. L'export vidéo final utilisera le FFmpeg livré avec Remotion pour disposer des codecs H.264 et VP9 indépendamment de ceux du FFmpeg système.

## Interface AVYOR
Captures copiées sans changement depuis les sources du site :
- Feed → `video/ui/discover.png`, plan 03.
- Campagnes → `video/ui/campaign.png`, début du plan 04.
- Collaboration / messagerie → `video/ui/collaboration.png`, fin du plan 04.
- Portfolio → `video/ui/portfolio.png`, disponible mais non utilisé dans ce montage.

Ces captures contiennent des données de démonstration existantes. Elles ne sont pas des preuves de résultats réels. Le contexte de démonstration doit être conservé lors de l'intégration publique. Aucun profil Creator supplémentaire n'a été inventé pour remplir un fichier manquant.

Coins d'écran des animatiques mesurés sur les PNG, puis contrôlés visuellement sur des frames rendues. Le suivi des clips Runway ne peut pas être déduit de ces coordonnées fixes : il reste à produire après génération vidéo.

## Exports réellement produits
| Sortie | Dimensions | Durée | Taille |
|---|---|---|---:|
| `previews/avyor-animatic-desktop.mp4` | 1920 × 1080 | 14 s | 4 053 599 octets |
| `previews/avyor-animatic-mobile.mp4` | 1080 × 1920 | 14 s | 4 915 398 octets |
| `posters/hero-avyor-desktop-poster.png/webp` | 1920 × 1080 | fixe | voir manifeste des fichiers |
| `posters/hero-avyor-mobile-poster.png/webp` | 1080 × 1920 | fixe | voir manifeste des fichiers |

Les MP4 d'aperçu sont des **animatiques d'images fixes**, avec mouvement de cadre léger et incrustations réelles. Ce ne sont pas des clips Image-to-Video.
Les posters fixes constituent la ressource reduced-motion ; l'application de la préférence utilisateur sur le site relève de l'intégration ultérieure.

## Vérification
- RED observé avant implémentation : test pipeline en échec car `timing.ts` n'existait pas.
- GREEN : 8 tests de timeline, homographie, interpolation, présence des sources, validation des médias et isolation du runtime.
- Typecheck, lint et bundle Remotion passent.
- Rendu desktop, mobile, posters PNG et WebP exécuté.
- Contrôle visuel des 11 images générées et des écrans incrustés sur 4 frames desktop/mobile.
- ffprobe : 24 fps, 336 images, 14 s, aucune piste audio, dimensions attendues.
- FFmpeg blackdetect : aucune frame entièrement noire détectée au seuil documenté dans le script.
- Différence moyenne RGB première/dernière frame : desktop 1,277/255 ; mobile 1,537/255, après compression H.264.
- Mesures dans `video/exports/measurements.json` et `validation.json`.
- `bun run video:check` échoue **volontairement** avec la liste des clips et suivis d'écran manquants. Aucune fausse réussite de production.
- Les tests du site ne sont pas relancés : son code est traité par l'autre agent et aucun changement runtime n'a été effectué ici.

## Commandes
Depuis `tools/avyor-video` :
```sh
bun run video:studio
bun run video:preview:desktop
bun run video:preview:mobile
bun run video:poster
bun run typecheck
bun run lint
bun test
bun run build
bun scripts/validate-exports.ts
bun run video:measure
```
Après réception, sélection et tracking des clips :
```sh
bun run assets:sync
bun run video:check
bun run video:render:desktop
bun run video:render:mobile
```

## Ce qui reste
Le plugin Runway a été trouvé mais aucune connexion n'est confirmée dans cette session. Il faut le connecter, ou fournir les clips générés dans le compte Runway, avant de terminer le film.

Les dix clips (5 desktop + 5 mobile) restent à générer, inspecter et sélectionner. Les prompts sont prêts. Sur les plans 03 et 04, relever les coins d'écran pendant toute la séquence ; conserver le SHA-256 de la version contrôlée. Rejeter une génération qui altère les mains, le visage, les lettres AVYOR ou le téléphone. Refaire une incrustation du vrai logo si le mouvement abîme la signalétique.

Les masters définitifs, versions web MP4/WebM, match cuts et validation du film final ne sont donc pas marqués terminés. Le site n'a pas été intégré ni déployé.

## Références vérifiées
- [Installation Remotion](https://www.remotion.dev/docs)
- [Générateur officiel Remotion](https://www.remotion.dev/docs/cli/create-video)
- [Runway Gen-4.5](https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5) : Image-to-Video, choix 16:9/9:16, 24/25 fps ; sortie native indiquée à 720p. Une composition 1080p ne transforme pas automatiquement ces sources en métrage natif 1080p.
- [Guide Image-to-Video](https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide) : utiliser les images pour la composition et des prompts courts pour le mouvement.
