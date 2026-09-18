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

## 3. Creators — « on voit les créateurs »

### Intention

L'arrière-plan doit dire : *voici des créateurs, et voici leur travail.* Plutôt qu'une personne seule dans le noir, **un mur de vidéos verticales**, doucement défilant, où l'on distingue des gens en train de créer — le feed AVYOR suggéré par la lumière, jamais par une interface.

Au premier plan, décalé dans la bande centrale, **un créateur de dos ou de trois quarts**, en train de filmer ou de régler son téléphone. On le voit travailler, on voit derrière lui ce que d'autres créent.

### Prompt de génération

À coller dans le modèle d'image ou de vidéo. En anglais : les modèles y répondent mieux.

```text
Cinematic wide shot, 16:9. A content creator seen from behind at three
quarters, slightly right of centre, filming a small product on a table with a
phone on a tripod. Warm practical light on their shoulder and hands.

Behind them, filling the middle and right of the frame, a large soft wall of
vertical video panels — a video feed suggested purely as light, gently drifting
upward. Each panel glows softly: people cooking, applying skincare, walking
outdoors, holding products. Faces are out of focus and partly cropped, read as
atmosphere rather than portraits. No interface, no buttons, no text anywhere.

The left third of the frame is quiet: empty studio depth, a soft violet rim of
light grazing a wall, visible texture, never pure black.

Deep navy blue ambience, violet and cool blue accents from the panels, warm skin
tones on the creator. Shallow depth of field, soft film grain, no lens flare.
Calm, premium, documentary feel. Very slow motion: the panels drift, the creator
barely moves.
```

**Négatif :** `text, letters, words, logo, watermark, user interface, app screen, buttons, icons, numbers, percentages, charts, harsh highlights, blown highlights, pure black background, crowded composition, fast motion, lens flare, centered subject`

### Points de vigilance

- Les panneaux du feed doivent rester **des rectangles verticaux de lumière**, pas des captures d'application.
- Le créateur ne doit pas être au centre exact : il entrerait en conflit avec le titre.
- Le mur de panneaux ne doit pas former de grille trop régulière, sinon on lit une interface.

## 4. Marques — « on choisit un regard »

### Intention

Côté marque, le sujet n'est pas de créer mais de **choisir**. L'arrière-plan doit montrer quelqu'un qui **regarde le travail des créateurs** : moins de personnages que la version actuelle, mieux éclairés, un geste lisible.

Le défaut d'aujourd'hui est une scène à deux personnes dans le noir, où l'on ne distingue ni les visages ni ce qu'ils font. **Une seule personne, une seule action claire**, et de l'air autour.

### Prompt de génération

```text
Cinematic wide shot, 16:9. A brand marketer at a clean desk, seen from three
quarters, slightly right of centre, leaning in to look at vertical video
thumbnails floating in front of them as soft panels of light. One hand raised
mid-gesture, as if choosing one.

The panels are suggested as glowing vertical rectangles only: no interface, no
buttons, no text, no charts. A few show blurred people at work; they read as
atmosphere.

The left third of the frame is quiet and uncluttered: depth of an office, a
soft violet light grazing a wall, visible texture, never pure black. Keep
generous empty space around the subject.

Deep navy ambience, cool violet and blue light from the panels, one warm desk
lamp for skin tones. Shallow depth of field, soft grain. Calm, considered,
premium. Very slow motion: the panels drift slightly, the person barely moves.
```

**Négatif :** `text, letters, words, logo, watermark, user interface, app screen, buttons, icons, numbers, percentages, charts, graphs, crowd, two people talking, dark unlit faces, blown highlights, pure black background, fast motion, lens flare`

### Points de vigilance

- **Une personne, pas deux.** La version actuelle en a deux, et aucune n'est lisible.
- Le geste doit se comprendre sans texte : la main qui choisit.
- Garder du vide : c'est ce qui manque le plus aujourd'hui.

## 5. Intégration

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

## 6. Vérification

Avant de committer :

- mesurer les trois bandes de luminance et le contraste du titre après voile, et les comparer aux cibles du §2 ;
- regarder la page à 1440, 1024 et 390 px : le sujet se lit-il sur ordinateur, l'ambiance tient-elle sur mobile ;
- vérifier la boucle sur **cinq tours** : aucun saut d'exposition ni de position ;
- parcourir le film image par image à la recherche de texte ou de logo apparus par accident ;
- `bun run test:all` et `bun run budget`.

Ne déclarez validé que ce qui a été réellement regardé.
