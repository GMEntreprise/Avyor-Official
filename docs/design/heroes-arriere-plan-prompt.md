# Prompt — refaire les arrière-plans des Heroes Creators et Marques

## 1. Ce qui ne va pas aujourd'hui, mesuré

Luminance moyenne des fichiers actuels, sur 255, avant même le voile appliqué par le CSS :

| Fichier | Bande du titre (0-46 %) | Bande du sujet (46-68 %) | Pixels clairs (> 90) |
| --- | --- | --- | --- |
| `creators-desktop.webp` | **10** | 45 | 10 % |
| `brands-desktop.webp` | **14** | 33 | 10 % |

Puis `.page-hero-surface::after` pose un voile navy de **95 % à gauche, 82 % au tiers, 28 % aux trois quarts**. Une image déjà sombre passe sous un voile épais : la scène s'éteint complètement.

Le contraste du texte, lui, est de **20:1** — très au-delà des 4,5:1 nécessaires. **Le problème n'est donc pas la lisibilité du titre, mais le fait que l'image ne montre plus rien.** On ne comprend pas ce qu'on regarde.

Autre défaut, propre au Hero Creators : **le logo et le mot AVYOR sont incrustés dans l'image générée**. C'est exactement l'artefact qui a dû être corrigé sur les rushes du film, où le mot-symbole mutait d'une image à l'autre.

## 2. Contraintes communes

### Fichiers attendus

Les noms sont imposés par `src/config/page-heroes.ts`, dans `src/assets/heroes/` :

| Fichier | Format | Durée | Poids visé |
| --- | --- | --- | --- |
| `<page>-desktop.mp4` | 1600 × 900, 24 fps, H.264, yuv420p, **sans audio** | 10 s, bouclée | ≤ 520 Ko |
| `<page>-desktop.webp` | 1600 × 900, une image du film | — | ≤ 90 Ko |
| `<page>-mobile.mp4` | 480 × 854, 24 fps, H.264, yuv420p, sans audio | 10 s, bouclée | ≤ 200 Ko |
| `<page>-mobile.webp` | 480 × 854 | — | ≤ 50 Ko |

`<page>` vaut `creators` ou `brands`. Le poster doit être **une image du film**, pas un rendu séparé, sinon l'affiche et la vidéo montrent deux instants différents.

### Zones de l'image, mesurées sur la page

**Sur ordinateur**, largeur de l'image de gauche à droite :

- **0 à 46 %** : le titre. Doit rester calme et sombre, mais **pas noir** : c'est là que l'image paraît vide aujourd'hui. Une profondeur, une lumière rasante, une texture suffisent.
- **46 à 68 %** : **c'est ici que la scène doit se lire.** Le sujet vit dans cette bande.
- **68 à 100 %** : recouvert par la maquette du téléphone. Ne rien y placer d'important.

**Sur mobile**, l'arrière-plan est presque entièrement couvert : le texte occupe 10 à 47 % de la hauteur, le téléphone 47 à 96 %. **N'y cherchez pas une scène lisible : il faut une ambiance** — lumière, matière, profondeur. Recadrer bêtement le plan large donnerait un sujet coupé.

### Cibles de luminance, à vérifier sur le fichier livré

Mesurées sur le fichier, avant le voile CSS :

- bande du titre (0-46 %) : moyenne entre **18 et 40** — aujourd'hui 10, donc trop noire ; au-delà de 40, le titre perdrait en confort ;
- bande du sujet (46-68 %) : moyenne entre **75 et 115** — aujourd'hui 33 à 45 ;
- **moins de 2 % de pixels au-dessus de 235** : aucune lumière brûlée, qui accrocherait l'œil plus que le titre ;
- après voile, contraste du blanc sur la zone du titre : **au moins 7:1**.

### Interdits

- **Aucun logo ni mot AVYOR dans l'image.** Les modèles déforment le texte d'une image à l'autre. L'identité est portée par la marque du site, pas par le décor.
- **Aucune interface d'application lisible** dans le fond : le téléphone à droite porte les vrais écrans AVYOR. Deux interfaces se contrediraient.
- **Aucun texte, chiffre, note, pourcentage ou nom de marque lisible.** Rien qui ressemble à une donnée : le site s'interdit les chiffres inventés.
- Aucun visage net dans la bande 68-100 % : il entrerait en concurrence avec le téléphone.
- Pas de mouvement rapide : c'est un fond derrière un titre. Une lente respiration, rien de plus.

## 3. Deux mondes, pas deux fois la même pièce

Les arrière-plans actuels montrent la même chose : une pièce sombre avec des gens dedans. Rien ne distingue la page Creators de la page Marques.

La direction retenue les oppose : **Creators la nuit**, intime, on fabrique. **Marques le jour**, ouvert, on choisit. Dans les deux cas, la lumière vient des vignettes du feed elles-mêmes — c'est ce qui rattache les deux pages entre elles, et ce qui les détache de l'existant.

## 4. Creators — la nuit, on fabrique

### Intention

*Voici des créateurs, et voici leur travail.* Un créateur de dos, petit dans le cadre, éclairé par un mur de vignettes verticales qui défilent lentement. Le feed AVYOR suggéré **par la lumière**, jamais par une interface. Son travail existe au milieu de celui des autres.

### Prompt — ordinateur, 16:9

```text
Cinematic wide shot, 16:9, night. A single content creator seen from behind
over the shoulder at three quarters, standing at a small table slightly right
of centre, adjusting a phone clipped to a tripod. Only their shoulder, the rim
of their hair and their hands catch a warm practical light.

The room is lit almost entirely by a tall wall of vertical video panels facing
them — a feed rendered purely as light. Panels of different heights, softly out
of focus, drifting slowly upward at different speeds. Inside them, glimpses of
people creating: hands folding fabric, steam rising from a cup, someone walking
in morning light, a skincare gesture. Human and warm, never sharp enough to
read a face. No screens, no interface, no buttons, no text.

Left third of the frame: depth, not emptiness. The studio recedes into dark
blue, one soft violet light grazes a textured wall, faint dust hangs in the
air. Dark, but you can see into it — never crushed black.

Deep navy ambience, violet and cyan spill from the panels, warm amber on skin.
Anamorphic feel, shallow depth of field, gentle film grain. Calm, intimate,
premium documentary. Extremely slow motion: the panels drift, the creator
barely shifts his weight.
```

### Prompt — mobile, 9:16

L'arrière-plan y est couvert à 90 % : on cherche une ambiance, pas une scène.

```text
Vertical 9:16, night. A close, intimate view of the same studio. In the lower
third, a warm rim of light on a creator's shoulder and hands. Above and behind,
a tall wall of vertical panels of light drifting slowly upward, deeply out of
focus, holding blurred glimpses of people creating.

Navy depth, violet and cyan glow, one warm amber accent. No face in focus, no
screens, no interface, no text. Heavy bokeh, soft grain. Extremely slow drift.
Atmosphere, not a scene.
```

**Négatif, pour les deux :** `text, letters, words, logo, watermark, signage, user interface, app screen, buttons, icons, numbers, percentages, charts, sharp faces, portrait, crowd, blown highlights, pure black, harsh contrast, centered subject, fast motion, lens flare, neon sign`

### Points de vigilance

- Les vignettes restent **des rectangles verticaux de lumière**, jamais des captures d'application.
- Le créateur n'est pas au centre exact : il entrerait en conflit avec le titre.
- Le mur ne doit pas former une grille régulière, sinon on lit une interface.
- Aucun visage net : ce sont des présences, pas des portraits.

## 5. Marques — le jour, on choisit

### Intention

Côté marque, on ne fabrique pas, **on choisit**. Une seule personne — la version actuelle en a deux, dont aucune n'est lisible — le geste de comparer deux vignettes, et de l'air autour. Le jour, pour trancher franchement avec la page Creators.

### Prompt — ordinateur, 16:9

```text
Cinematic wide shot, 16:9, cool overcast daylight. A single brand marketer
standing at a wide, uncluttered table slightly right of centre, seen at three
quarters, one hand lifted mid-gesture as if setting one vertical frame beside
another — comparing, choosing.

Around them, a loose arrangement of vertical panels of light floating at
slightly different depths and angles, like frames held up for comparison.
Softly out of focus, each holding a blurred glimpse of someone at work. No
screens, no interface, no buttons, no text, no charts.

Left third of the frame: an airy office receding. A tall window out of frame
casts soft light across a textured concrete wall, and deep shadow gathers
toward the left edge. Open, calm, generous empty space.

Desaturated navy-leaning daylight, cool blue and violet inside the panels, a
single warm accent on skin. Shallow depth of field, soft grain, no flare.
Considered, editorial, premium. Extremely slow motion: the panels settle, the
hand barely moves.
```

### Prompt — mobile, 9:16

```text
Vertical 9:16, cool overcast daylight. A close view of the same office. In the
lower third, a hand entering frame beside a floating vertical panel of light.
Above, more panels drifting at different depths, deeply out of focus, and a
textured concrete wall receding into soft shadow.

Desaturated navy-leaning daylight, cool blue and violet glow, one warm accent.
No face, no screens, no interface, no text. Heavy bokeh, soft grain. Extremely
slow drift. Atmosphere, not a scene.
```

**Négatif, pour les deux :** `text, letters, words, logo, watermark, signage, user interface, app screen, laptop screen, buttons, icons, numbers, percentages, charts, graphs, two people, meeting, conversation, dark unlit face, night, clutter, paperwork, blown highlights, pure black, fast motion, lens flare`

### Points de vigilance

- **Une personne, pas deux.**
- Le geste doit se comprendre sans un mot : la main qui compare.
- Garder du vide : c'est ce qui manque le plus aujourd'hui.
- Jour ne veut pas dire clair partout : le bord gauche reste dans l'ombre, pour le titre.

## 6. Réglages de génération

- Format : **16:9** pour l'ordinateur, **9:16** généré à part — ne jamais recadrer le plan large, le sujet serait coupé.
- Générer **trois variantes** de chaque et comparer sur la page, pas dans le générateur.
- Garder la même famille de lumière entre les deux pages : c'est le feed qui éclaire. Seule l'heure change.
- Si le modèle glisse un logo, un écran ou du texte malgré le négatif : régénérer plutôt que retoucher.

## 7. Intégration

1. Placer les sources générées hors du site, par exemple `video/source/heroes/`, **sans jamais les modifier**.
2. Produire les quatre fichiers par page aux formats du tableau. Exemple :

   ```bash
   # Desktop : 1600x900, 10 s, sans audio
   ffmpeg -y -i source.mp4 -an -t 10 -vf "scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,fps=24" \
     -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart creators-desktop.mp4
   # Mobile : recadrage vertical pensé, pas un centrage aveugle
   ffmpeg -y -i source-mobile.mp4 -an -t 10 -vf "scale=480:854:force_original_aspect_ratio=increase,crop=480:854,fps=24" \
     -c:v libx264 -preset slow -crf 31 -pix_fmt yuv420p -movflags +faststart creators-mobile.mp4
   # Poster : une image du film lui-même
   ffmpeg -y -ss 2.0 -i creators-desktop.mp4 -frames:v 1 poster.png
   ```

   Convertir le poster en WebP avec `sharp` : ni l'ffmpeg embarqué ni celui du système n'ont d'encodeur WebP ici.

3. Déposer les fichiers dans `src/assets/heroes/`. Les noms sont imposés : ne rien renommer, `src/config/page-heroes.ts` les importe.
4. **Alléger le voile** de `.page-hero-surface::after` dans `src/styles.css`. Il a été calibré pour des images très sombres. Point de départ à ajuster en mesurant : `0,88` à 5 %, `0,55` à 38 %, `0,12` à 75 %.

## 8. Vérification

Avant de committer :

- mesurer les trois bandes de luminance et le contraste du titre après voile, et les comparer aux cibles du §2 ;
- regarder la page à 1440, 1024 et 390 px : le sujet se lit-il sur ordinateur, l'ambiance tient-elle sur mobile ;
- vérifier la boucle sur **cinq tours** : aucun saut d'exposition ni de position ;
- parcourir le film image par image à la recherche de texte ou de logo apparus par accident ;
- `bun run test:all` et `bun run budget`.

Ne déclarez validé que ce qui a été réellement regardé.
