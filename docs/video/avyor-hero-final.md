# AVYOR Hero — rapport de production

18 septembre 2026. Master desktop rendu à partir des rushes Runway livrés, avec les vrais écrans AVYOR composités. Analyse préalable des rushes : `docs/video/avyor-hero-footage-analysis.md`.

## 1. Architecture

Outil isolé dans `tools/avyor-video`, hors du bundle du site. Le site ne recevra que la vidéo optimisée et son poster.

- `src/config/timing.ts` — la timeline, source de vérité unique. Aucun nombre magique ailleurs.
- `src/config/assets.ts` — les trois beats, leurs images de repli et les vrais écrans AVYOR.
- `production.json` — le verrou : rushes relus, hachés, avec leur suivi d'écran.
- `src/lib/validate-production.ts` + `scripts/check-production.ts` — refusent l'export si un rush manque, est trop court, n'a pas le bon ratio ou le bon framerate, a changé depuis sa relecture, ou n'a pas de suivi couvrant ses images.

## 2. Versions réellement utilisées

Remotion et `@remotion/cli` **4.0.526**, React 19.2.3, TypeScript 5.9.3, Bun 1.3.14. `trimBefore` vérifié dans les types installés — `startFrom` y est déprécié.

## 3. Rushes analysés

| ID | Beat | Orientation | Dimensions | fps | Frames | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| shot-01 | prepare | portrait | 720×1280 | 24 | 97 | 4,04 s |
| shot-02 | recording | paysage | 1280×720 | 24 | 73 | 3,04 s |
| shot-03 | discovery | paysage | 1280×720 | 24 | 49 | 2,04 s |
| shot-04 | collaboration | paysage | 1280×720 | 24 | 73 | 3,04 s |
| shot-05 | final | portrait | 720×1280 | 24 | 73 | 3,04 s |

Catalogue avec hachages : `video/source/runway/manifest.json`. Les sources ne sont pas modifiées.

## 4. Décision de montage

Les cinq rushes couvrent des beats **complémentaires mais dans des orientations incompatibles** : trois paysage (le milieu de l'histoire), deux portrait (les extrémités). Aucun format n'a l'histoire complète.

Plutôt que recadrer d'une orientation à l'autre — 68 % de largeur perdue et un agrandissement de 2,67× sur des sources 720p — le film desktop a été monté avec **les trois rushes paysage réels, sans recadrage ni agrandissement**. C'est le choix qui met AVYOR en avant sans rien inventer.

L'arc tient debout seul : **je crée → on me découvre → la collaboration démarre.**

## 5. Timeline retenue

| Beat | Rush | Trim tête | Durée | Position |
| --- | --- | --- | --- | --- |
| recording | shot-02 | 2 | 70 | 0 → 70 |
| discovery | shot-03 | 1 | 47 | 64 → 111 |
| collaboration | shot-04 | 2 | 70 | 105 → 175 |

**175 images à 24 fps = 7,29 s.** Fondus de 6 images entre beats, boucle de 8 images.

Aucune durée n'est arrondie : chaque beat prend ce que son rush contient réellement, et un test échoue si la timeline demande à un rush plus d'images qu'il n'en a.

## 6. Écrans AVYOR composités

Les écrans noirs des téléphones sont la surface prévue. Deux beats les portent :

- **discovery** → `ui/discover.png`
- **collaboration** → `ui/campaign.png`, qui se fond vers `ui/collaboration.png` en fin de plan

Ce sont de vrais écrans de l'application. Aucune interface n'a été redessinée.

## 7. Suivi d'écran — mesuré, pas supposé

Un seuillage sur les zones sombres a d'abord été essayé : **il échoue**. Mesure à l'appui, l'écran du téléphone (luminance 21–128 à cause des reflets) est **plus clair que le mur du fond** (2–31). Aucun seuil de noir ne peut l'isoler.

Le suivi retenu est une **corrélation normalisée sur les gradients**, amorcée sur un quad lu image par image sur une grille, avec recherche translation + échelle du grossier au fin.

| Rush | Corrélation min / moy | Déplacement final | Vérification |
| --- | --- | --- | --- |
| shot-02 (mur) | 0,667 / 0,747 | dx −310 px, ×1,075 | contour tracé, 4 images |
| shot-03 (écran) | 0,330 / 0,468 | dx −51 px, ×1,040 | contour tracé, 4 images |
| shot-04 (écran) | 0,649 / 0,778 | dx −188 px, ×1,540 | contour tracé, 6 images |

**Chaque suivi a été vérifié visuellement avant d'être accepté.** Deux erreurs ont été prises ainsi : un quad d'amorce deviné au lieu d'être lu, qui a fait suivre le visage du Creator, et le seuillage évoqué ci-dessus. Les chiffres seuls ne les auraient pas révélées.

Les suivis sont décimés à une clé sur trois ; `sampleTrack` interpole entre elles.

## 8. Logo déformé — traité, pas ignoré

Sur `shot-02`, le mot-symbole au mur mute d'une image à l'autre : « AVY », un V brisé, « A YOR ». Le symbole au-dessus est stable et correct.

Deux approches ont été essayées et rejetées :

1. **Recadrage** — la caméra panote, donc aucun cadrage statique ne l'exclut sur toute la durée ; et il ajoutait un agrandissement.
2. **`backdrop-filter`** — ne survit pas au `transform` du parent, aucun effet au rendu.

Retenu : **une seconde passe floutée du même plan, révélée uniquement sur la bande du mot-symbole** par un masque ellipsoïdal adouci et suivi. Le mur garde sa couleur, sa lueur et son mouvement ; seules les lettres cessent de se former. Vérifié sur cinq images : plus aucune lettre lisible, symbole intact.

## 9. Poster

Le poster desktop est **une image du film** (frame 135), extraite du master par ffmpeg.

Un `Still` rendu séparément a d'abord produit un défaut visible : le `Still` n'ayant pas de timeline, la vidéo affichait sa première image pendant que le suivi était échantillonné à l'image 32 — **l'écran AVYOR flottait à côté du téléphone**. Extraire du film supprime cette classe d'erreur, et un test vérifie que l'image choisie tombe sur un beat qui montre un écran, loin des fondus.

Mobile : pas de rush portrait, donc le poster reste rendu depuis l'image de repli.

## 10. Exports mesurés

| Fichier | Codec | Dimensions | Durée | Poids |
| --- | --- | --- | --- | --- |
| `masters/hero-avyor-desktop.mp4` | h264 | 1920×1080 | 7,29 s | 7,42 Mo |
| `web/hero-avyor-desktop.mp4` | h264 | 1920×1080 | 7,29 s | **2,91 Mo** |
| `web/hero-avyor-desktop.webm` | vp9 | 1920×1080 | 7,29 s | **2,10 Mo** |
| `posters/hero-avyor-desktop-poster.webp` | — | 1920×1080 | — | 73 Ko |
| `posters/hero-avyor-mobile-poster.webp` | — | 1080×1920 | — | 83 Ko |

Aucune piste audio : les exports web passent par `-an`.

## 11. Tests

`bun run typecheck`, `bun run lint`, `bun test tests` → **13 tests, 603 assertions, tout vert**. `bun scripts/check-production.ts` refuse mobile et accepte desktop sur rushes, durée, ratio, framerate, hachage et suivi.

Les invariants couverts : la timeline ne demande jamais à un rush plus d'images qu'il n'en a ; tous les rushes du montage sont paysage, 24 fps et natifs 16:9 ; les suivis restent dans le cadre et bougent réellement ; un rush trop court, non relu ou sans suivi est refusé ; le poster tombe sur un beat qui montre un écran.

## 12. Ce qui n'a pas été fait

- **Mobile 9:16** : aucun rush portrait ne couvre les beats du milieu. `production.json` garde ses entrées mobiles à `null` et l'export mobile est refusé — délibérément, plutôt que de livrer un paysage recadré.
- **Intégration au site** : le master n'a pas remplacé `/assets/hero-desktop.mp4`. Le site reste intact. À 2,91 Mo, l'intégration demande d'abord un arbitrage de compression face au budget du site.
- **Correction colorimétrique** entre rushes : non faite. Les trois plans viennent du même décor et se raccordent correctement à l'œil, mais aucune uniformisation n'a été mesurée.
- **Les cinq boucles consécutives** demandées n'ont pas été visionnées en continu ; la boucle a été vérifiée sur ses images de raccord (174 → 0).

## 13. Risques restants

1. Les rushes sont en **720p** agrandis vers 1080p (1,5×). Visible sur les zones fines.
2. `shot-03` ne dure que 2,04 s : le beat discovery est plus court que les deux autres, ce qui se sent légèrement au rythme.
3. Le suivi de `shot-03` ne modélise pas la rotation ; le téléphone pivote un peu en fin de plan. Aucun glissement n'a été constaté à la vérification, mais c'est la limite du modèle.
4. Le film dure **7,29 s**, pas les 12–15 s visées : c'est ce que trois rushes permettent honnêtement.
