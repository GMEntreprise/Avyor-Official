# AVYOR Hero — analyse des 5 rushes Runway

18 septembre 2026. Mesures faites avec `ffprobe` sur les fichiers de `video/source/runway/`, et inspection image par image. Catalogue : `video/source/runway/manifest.json`. Les sources n'ont pas été modifiées.

## Ce que le pipeline attend

`tools/avyor-video` est déjà construit et testé. Ses contraintes, lues dans le code et non supposées :

- `src/config/timing.ts` : **24 fps**, `SHOT_FRAMES = 72` (3,00 s par plan), 5 plans, `DURATION = 336` (14,00 s).
- `scripts/check-production.ts` refuse l'export si un rush : dure moins de 3,00 s, n'est pas en 24 fps, n'a pas exactement le bon ratio (16:9 desktop, 9:16 mobile), ou dont le hash ne correspond plus à la relecture.
- `src/lib/validate-production.ts` exige, pour les plans qui portent une UI, un **tracking d'écran normalisé couvrant tout le clip**.
- Il faut donc **5 rushes 16:9 et 5 rushes 9:16**, soit dix.

## Les rushes livrés

| ID | Beat | Orientation | Dimensions | fps | Frames | Durée | Poids |
| --- | --- | --- | --- | --- | --- | --- | --- |
| shot-01 | prepare | **portrait** | 720×1280 | 24 | 97 | 4,04 s | 1,7 Mo |
| shot-02 | recording | paysage | 1280×720 | 24 | 73 | 3,04 s | 1,2 Mo |
| shot-03 | discovery | paysage | 1280×720 | 24 | **49** | **2,04 s** | 0,6 Mo |
| shot-04 | collaboration | paysage | 1280×720 | 24 | 73 | 3,04 s | 1,0 Mo |
| shot-05 | final | **portrait** | 720×1280 | 24 | 73 | 3,04 s | 1,1 Mo |

Tous en h264, yuv420p, 24 fps — le framerate attendu, aucune conversion nécessaire.

## Contenu, stabilité et aptitude au compositing

| ID | Contenu | Écran du téléphone | Compositing | Logo mural |
| --- | --- | --- | --- | --- |
| shot-01 | Réglage du téléphone sur trépied, Creator debout | Visible, noir, ~17 % de l'image, tenu par le trépied donc peu mobile | **Cas A** — plausible | **Net et stable** |
| shot-02 | Repositionnement du produit sur le socle | Petit, à droite, ~13 % | Marginal, écran trop petit pour être lisible | **Morphing net** |
| shot-03 | Gros plan main + smartphone, écran quasi frontal | **~38 % de l'image**, le plus grand | **Meilleur candidat**, mais le téléphone dérive et pivote → tracking requis | Stable à l'œil |
| shot-04 | Rapprochement caméra sur le téléphone monté | Frontal, noir, ~24 % | Bon candidat, mouvement de caméra régulier | Partiellement hors champ |
| shot-05 | Le Creator saisit son téléphone et le regarde | **Écran tourné vers lui**, on voit le dos | **Inutilisable** pour montrer l'UI | Flou en fin de plan |

Les écrans noirs ne sont pas un défaut : c'est la surface prévue pour les vrais écrans AVYOR.

## Trois blocages, aucun contournable sans votre décision

### 1. Orientations mixtes — 3 paysage, 2 portrait

Le pipeline demande cinq rushes par format. Nous avons **3 rushes 16:9** (shot-02, 03, 04) et **2 rushes 9:16** (shot-01, 05).

Il manque donc **2 plans en paysage** et **3 plans en portrait**. Recadrer un 16:9 en 9:16 supprime 68 % de la largeur ; l'inverse impose de fabriquer de la matière absente. Aucun des deux ne donne un résultat de niveau lancement produit.

### 2. Un rush plus court que le plan qu'il doit remplir

`shot-03` fait **2,04 s (49 images)** alors que `SHOT_FRAMES` vaut 72. `check-production.ts` le refuse explicitement : « clip shorter than planned duration ». C'est précisément le plan qui contient le meilleur écran pour le compositing.

### 3. Le mot-symbole AVYOR se déforme dans les rushes

Sur `shot-02`, le texte « AVYOR » au mur mute d'une image à l'autre : « AVY », puis un V brisé, puis « A YOR ». Le **symbole** (l'arc et ses filaments) reste, lui, reconnaissable et stable.

C'est l'artefact que la consigne §20 interdit d'accepter. Le texte est le seul élément touché, ce qui ouvre trois issues : le recadrer hors champ, le couvrir par le vrai asset AVYOR, ou ne garder du plan que la portion où il est hors cadre ou flou.

## Définition des plans, mesurée

Les rushes sont en **720p**. Les compositions visent 1920×1080 et 1080×1920, soit un agrandissement de **1,5×**. Le projet s'interdit l'agrandissement pour les images fixes ; la même règle mérite d'être tranchée ici.

## Ce qui est prêt

- Le catalogue `manifest.json` donne un identifiant stable, un beat et un hash SHA-256 à chaque rush, sans toucher aux sources.
- `production.json` reste à **cinq entrées nulles par format** : aucun rush n'a été déclaré relu, donc aucun export de production n'est possible. C'est le comportement voulu.
- Le reste du pipeline — timeline, compositions, tracking, posters, exports, tests — est déjà en place et vert.

## Ce qui n'a pas été fait, et pourquoi

Aucun trim n'a été sélectionné, aucun montage produit, aucune UI composée. Choisir des trims sur une couverture incomplète reviendrait à figer un montage que les rushes manquants obligeront à refaire. Les options sont présentées séparément ; la décision appartient à l'éditeur.
