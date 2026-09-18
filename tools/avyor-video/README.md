# AVYOR video
Projet Remotion isolé, créé avec le générateur officiel (4.0.526). Aucun import dans le site.

## Démarrage
```sh
bun install
bun run assets:sync
bun run video:studio
```
Studio : port 3008. Compositions Animatics-images : aperçus à partir des images fixes. Compositions Production-Runway-required : vrais clips requis.

## Exports disponibles maintenant
```sh
bun run video:preview:desktop
bun run video:preview:mobile
bun run video:poster
bun run video:measure
```
Les animatiques de 14 secondes prévisualisent le montage et les captures de l'app. Elles ne simulent pas les gestes du personnage.

## Passer aux clips Runway
1. Générer chaque plan séparément à partir du PNG associé, selon `../../docs/video/runway-prompts.json`.
2. Déposer les clips 3 secondes / 24 fps dans `../../video/source/runway/desktop/` et `mobile/`, nommés `shot-01-v01.mp4`, etc.
3. Renseigner les cinq entrées de chaque format dans `production.json`. Une entrée ressemble à :
```json
{
  "file": "footage/desktop/shot-01-v01.mp4",
  "sha256": "SHA256_REEL_DU_FICHIER",
  "reviewed": true
}
```
4. Les plans 03 et 04 doivent aussi contenir `screenTrack` : tableau de `{frame, corners}`, avec coins haut-gauche, haut-droite, bas-droite, bas-gauche. Coordonnées normalisées 0..1, au minimum frames 0 et 71. Ajouter les points nécessaires en fonction du mouvement réel. Ne pas reprendre les coins des images fixes comme tracking des vidéos.
5. La validation humaine doit couvrir visage, mains, exposition, géométrie du téléphone, absence d'UI générée et stabilité de l'enseigne AVYOR. Mettre `reviewed: true` après contrôle.
6. `bun run assets:sync && bun run video:check`, puis :
```sh
bun run video:render:desktop
bun run video:render:mobile
```
Ces commandes refusent l'export si les médias, le hash, le format, la durée, le fps ou le tracking manquent. Masters H.264 CRF16, versions web MP4 CRF23 et WebM VP9 CRF32 via FFmpeg embarqué Remotion. Mesurer et contrôler les sorties avant intégration.

## Références
Captures inchangées provenant de `brand/sources/screens`, avec données de démonstration. Leur usage public doit conserver le contexte de démonstration prévu par le site ; aucune statistique du film n'est une preuve de résultat réel. Le fichier officiel du logo est disponible dans `public/brand` ; les enseignes des images sont des rendus générés à partir de ce fichier.

## Vérification
```sh
bun run typecheck
bun run lint
bun test
bun run build
bun scripts/validate-exports.ts
```
Tout mouvement vient des frames. Pas de timer, animation CSS ni dépendance au temps mural.
`AVYOR_VIDEO_BROWSER` permet de choisir un Chromium installé. Sinon le Chromium Playwright du site est réutilisé s'il existe, puis le navigateur géré par Remotion.
