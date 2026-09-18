# Prompt — icônes en volume (SVG), réutilisable sur n'importe quel site

Ce prompt a produit les icônes du manifeste et de la section 06 d'AVYOR : dessinées dans `src/components/Icons3D.tsx`, exportées en fichiers par `scripts/build-icons.tsx` vers `src/assets/icons/`. Copiez-le tel quel dans Claude Code, en remplaçant uniquement le bloc **À RENSEIGNER**.

---

```text
# ICÔNES EN VOLUME — SVG FAIT MAIN, FAMILLE COHÉRENTE

## À RENSEIGNER
- Projet : [React / Vue / HTML statique…]
- Fond sur lequel les icônes seront posées : [#0b1020]
- Couleur principale de la marque : [#7c5cff]
- Couleur secondaire (facultative) : [#4f7dff]
- Couleur de surface sombre (corps d'objets) : [#1d2247]
- Emplacement dans la page : [section, nombre d'icônes]
- Pour chaque icône : le texte exact qu'elle accompagne.

## OBJECTIF
Dessiner des icônes en trois dimensions, détaillées et propres, qui forment
une famille. Chacune doit dire exactement ce que dit son texte.

## 1. AVANT DE DESSINER
- Lire la section dans le code et à l'écran. Noter la taille actuelle des
  icônes, la mise en page et TOUTES les règles CSS responsives qui visent ces
  icônes ou leur conteneur. Une règle du type `.x svg { width: 16px }` ou une
  colonne de grille de 30 px écrasera les nouvelles icônes sur mobile.
- Pour chaque icône, choisir une métaphore concrète qui correspond à la
  fonction réelle du produit, pas une image générique. Exemples :
  « le contexte reste » (messages + étapes) → une fiche projet avec une frise
  d'étapes et une bulle de message accrochée ; « le paiement se suit » → un
  portefeuille avec la carte qui dépasse ; « vous gardez le contrôle » → un
  bouclier avec une coche en relief.
- Ne jamais dessiner de fausses données dans l'icône : pas de chiffre, de note
  ou de montant.

## 2. TECHNIQUE — IMPOSÉE
- SVG écrit à la main, un composant par icône. viewBox="0 0 120 120".
- AUCUNE image embarquée, AUCUNE ressource externe, AUCUN texte ni glyphe
  (une police s'affiche différemment d'un système à l'autre) : tout est tracé.
- AUCUN filtre de flou (feGaussianBlur) : les ombres sont des dégradés. Elles
  restent nettes à toute taille et ne coûtent rien à peindre.
- LIVRER EN FICHIERS .svg SERVIS COMME IMAGES, pas en SVG inline dans la
  page. Une icône est de l'illustration pure : inline, elle part dans le
  JavaScript que chaque visiteur télécharge et exécute, sur toutes les pages.
  En image, elle sort du bundle et se charge à l'approche de sa section.
  - Dessiner dans des composants (lisibles, commentés), puis les exporter en
    fichiers .svg par un script lancé avant chaque build ET chaque démarrage
    du serveur de développement, pour que les fichiers ne prennent jamais de
    retard sur le dessin.
  - Ajouter xmlns="http://www.w3.org/2000/svg" à l'export : sans lui, un SVG
    ne s'affiche pas en image.
  - <img src=… width height alt="" loading="lazy" decoding="async">.
  - Vite : fixer build.assetsInlineLimit à 0. Sinon, tout fichier de moins
    de 4 ko est replié dans le JavaScript — en URL encodée pour les SVG
    (data:image/svg+xml,…), pas en base64.
- Identifiants de dégradés uniques (React : useId(), nettoyé des caractères
  non alphanumériques). En image, chaque fichier est son propre document et
  les collisions disparaissent ; si une icône doit un jour être inline, deux
  icônes qui partagent un identifiant affichent silencieusement les couleurs
  l'une de l'autre.
- Décoratives : alt="" sur l'image (ou aria-hidden="true" et
  focusable="false" si inline). Le texte porte le sens.

## 3. MATIÈRE ET LUMIÈRE — COMMUNES À TOUTE LA FAMILLE
Une seule source de lumière, en haut à gauche, pour toutes les icônes.
Chaque objet est construit par couches, de l'arrière vers l'avant :

1. Ombre au sol : ellipse sous l'objet (ry ≈ 7,5), dégradé radial d'un
   presque-noir (#010208) : opacité 0,9 au centre, 0,35 à mi-rayon, 0 au bord.
   Elle doit être nettement plus sombre que le fond, sinon elle disparaît.
2. Épaisseur : la même forme, décalée de 4 à 5 px vers le bas, dans une teinte
   sombre de la couleur de l'objet. C'est elle qui donne le volume.
3. Face éclairée : la forme, dégradé linéaire en diagonale du haut gauche vers
   le bas droit, en trois arrêts : clair / couleur principale / couleur foncée.
4. Liseré spéculaire : la forme en contour (1 à 1,4 px), dégradé blanc qui
   s'éteint vers 30 à 45 % de la hauteur. C'est un reflet, pas un contour.
5. Zones creusées (cadran, panneau) : d'abord une « paroi » un peu plus grande,
   sombre en haut à gauche et claire en bas à droite, puis la face sombre
   légèrement plus petite par-dessus. Sans la paroi, le creux paraît plat.
6. Détails en relief (aiguille, coche, bouton, pastilles) : une copie sombre
   décalée de 1,5 à 2,6 px vers le bas, puis la pièce éclairée, puis un petit
   point ou trait blanc de reflet.
7. Brillance : un dégradé blanc de faible opacité (0,1 à 0,3), en biais,
   DÉCOUPÉ à la forme de la face (clipPath).

Palette : dériver tous les dégradés de la couleur principale, de la couleur
secondaire et de la surface sombre. Aucune couleur hors palette.

## 4. PIÈGES CONNUS — À VÉRIFIER UN PAR UN
- Brillance dessinée comme un rectangle arrondi : on voit un bloc gris posé
  sur l'objet. Toujours une bande en biais, découpée à la forme.
- Ombre au sol de la même couleur que le fond : invisible, l'objet flotte.
- Zone creusée sans paroi intérieure : elle a l'air collée à plat.
- Élément décoratif qui chevauche un détail (queue de bulle sur une ligne de
  texte) : raccourcir ou déplacer le détail.
- Pièce qui dépasse du bord de l'objet (languette, fermoir) : elle se lit
  comme un bloc séparé. La rabattre au ras du bord.
- Ordre des couches : un reflet ne doit jamais passer par-dessus une pièce en
  relief ; dessiner la brillance avant les détails.

## 5. PROCÉDÉ
1. Dessiner toute la famille.
2. La rendre en GRAND (≥ 280 px par icône) sur le vrai fond, à densité 2,
   et regarder l'image. Lister chaque défaut visible, avec la liste du §4.
3. Corriger, rendre à nouveau. Répéter jusqu'à n'avoir plus rien à reprocher.
4. Intégrer à la vraie taille : 88 à 104 px sur ordinateur. Sur téléphone,
   passer en liste — l'icône à 64-68 px à gauche, le texte à droite — plutôt
   que trois colonnes étroites.
5. Vérifier aux trois largeurs (ordinateur, tablette, 390 px) : taille réelle
   de chaque icône mesurée, aucun débordement horizontal.
6. Animation facultative : léger soulèvement au survol (−4 px), désactivé
   sous prefers-reduced-motion.

## 6. TESTS À ÉCRIRE
Sur le HTML construit, pas sur le code source :
- le bon nombre d'icônes, chacune avec alt="" et loading="lazy" ;
- chaque src est un fichier empreinté (/assets/nom-XXXXXXXX.svg), jamais
  une donnée data: ;
- dans chaque fichier : xmlns présent, aucune balise image, foreignObject,
  filter ou text, aucune ressource http, et chaque url(#…) mène à un
  identifiant du même fichier ;
- aucun JavaScript ni aucune page ne contient data:image/…[;,] ;
- le budget JavaScript est respecté.
Puis faire échouer chaque garde exprès (remettre assetsInlineLimit à 4096,
forcer un identifiant fixe) pour vérifier qu'elle attrape la régression.

## LIVRABLE
Les composants, leur intégration, les captures aux trois largeurs, et la liste
des défauts trouvés à la relecture avec leur correction.
```

---

## Référence : ce qui a été produit pour AVYOR

| Icône | Texte | Métaphore |
| --- | --- | --- |
| `DiscoverIcon` | Découvrir | boussole : lunette épaisse, cadran creusé, aiguille à facettes |
| `CreateIcon` | Créer | clap ouvert à bandes, bouton lecture en relief |
| `CollaborateIcon` | Collaborer | deux bulles superposées, lignes de texte et indicateur de saisie |
| `ContextIcon` | Le contexte reste | fiche projet, frise de trois étapes, bulle de message accrochée |
| `PaymentIcon` | Le paiement se suit | portefeuille surpiqué, carte de paiement, fermoir rabattu |
| `ControlIcon` | Vous gardez le contrôle | bouclier biseauté, panneau creusé, coche en relief |

Palette employée : violet `#7c5cff` (et ses teintes `#d7cbff`, `#8f72ff`, `#4a2fcf`), bleu `#5a7cf5` (`#9bb3ff`, `#2f40c4`), surface `#1d2247`, fond `#0b1020`, ombre `#010208`.
