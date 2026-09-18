# Heroes Creators, Marques et Produit

18 septembre 2026.

## Périmètre et direction artistique

Trois fonds dédiés reprennent le principe de l'accueil : une photographie animée par un mouvement de caméra lent, en boucle. Ce sont des images générées avec imagegen, animées ensuite par FFmpeg, pas des scènes Runway avec mouvement des personnages.

- `/creators/` : le Creator de référence prépare un tournage produit, avec smartphone sur support et céramique sans marque.
- `/brands/` : deux professionnels préparent une campagne autour de matières, d'images de storyboard et d'un ordinateur.
- `/features/` (Produit) : smartphone posé sur le bureau, outils de création, éclairage AVYOR.

Chaque décor comporte le symbole et le nom AVYOR, à partir du logo officiel fourni. Les personnes sont fictives. Aucun témoignage, client ou résultat commercial n'est attribué à ces images.

Les trois originaux 1672 × 941 et les prompts exacts sont dans `brand/sources/page-heroes/`. Aucun agrandissement artificiel des sources. Les écrans fonctionnels restent les composants `Device` existants, avec leur légende de démonstration.

## Préservé

L'accueil, son Hero, l'intro, les textes, les captures de l'app, les CTA, la navbar, le footer et les autres routes. La section Film reste en sommeil. Le cadre sombre, Manrope et les tokens existants sont réutilisés. Les téléphones du premier plan sont alignés à droite sur grand écran pour dégager les scènes.

## Intégration

`src/components/PageHero.tsx` enveloppe le contenu existant des trois pages. `src/config/page-heroes.ts` associe chaque route à ses quatre exports importés par Vite : poster et vidéo, desktop et mobile. Les noms empreintés empêchent une ancienne image de persister en cache.

Le HTML contient immédiatement un `<picture>` décoratif avec poster mobile adapté. La vidéo, sans son, sans source au rendu serveur, commence après le chargement de la page et un délai de 900 ms. Le poster reste visible tant qu'aucune frame vidéo n'est prête. Un refus d'autoplay ou une erreur réseau laisse le contenu lisible.

La lecture s'arrête hors écran et lorsque l'onglet est masqué. Une pause demandée par l'utilisateur est conservée au retour. `prefers-reduced-motion` est suivi par un abonnement `matchMedia`, y compris si la préférence change pendant la lecture : arrêt et retrait de la source. Les écouteurs, l'observateur et le timer sont nettoyés. L'économie de données conserve le poster, avec lecture manuelle possible.

Sur mobile, la hauteur du fond est limitée à 900 px et se fond dans le navy pour éviter un recadrage excessif sur les pages longues. La commande lecture/pause reste accessible en haut du Hero. Elle est utilisable au clavier et possède un libellé français explicite ; aucune information ne repose sur la vidéo.

## Exports et poids

Régénération : `node scripts/build-page-heroes.mjs` (Sharp + FFmpeg avec libx264). Aucun ajout de dépendance runtime.

Les six vidéos ont été vérifiées avec ffprobe : H.264, 24 images/s, dix secondes, aucun flux audio. Desktop : 1600 × 900. Mobile : 480 × 854. Déplacement périodique sinusoïdal pour une boucle continue, `faststart` activé.

| Page | Poster desktop | Vidéo desktop | Poster mobile | Vidéo mobile |
| --- | ---: | ---: | ---: | ---: |
| Creators | 84 802 o | 492 408 o | 49 406 o | 186 144 o |
| Marques | 73 552 o | 462 977 o | 31 170 o | 156 983 o |
| Produit | 68 670 o | 479 588 o | 38 336 o | 199 806 o |

Mesures reproductibles dans `avyor-page-hero-exports.json`. Les premiers encodages plus petits ont été remplacés par ces versions plus nettes. Une route ne télécharge que son propre média et le format adapté, ce que vérifient les tests réseau.

Le budget global passe : JS initial gzip 142 183 o sur 143 360 o autorisés ; CSS gzip 11 938 o sur 25 600 o. La marge JS est faible : éviter d'ajouter une bibliothèque pour ces fonds. Aucune nouvelle mesure terrain LCP/CLS/INP n'est revendiquée.

## Validation

RED : test exigeant le fond dédié Creators, échoué avant intégration. Second RED : activer reduced-motion pendant la lecture révélait que le seul hook Motion ne stoppait pas le média ; corrigé par l'abonnement direct à la préférence.

GREEN et vérifications :

- `bun run typecheck`, `bun run lint` : succès.
- `bun run test` : 42 tests unitaires réussis.
- Build Vite + SSR + prerender, aussi via le wrapper Sites `build-site.mjs` : succès.
- `bun run test:seo` : 38 tests sur le HTML construit réussis.
- `bun run budget` : succès.
- Playwright : lecture/pause clavier, sources propres à chaque route, absence d'erreur JavaScript, reduced-motion initial et dynamique, économie de données, panne vidéo, pause hors écran, absence de replay après pause manuelle, rendu sans JavaScript.
- 24 nouveaux scénarios Hero réussis (12 sur desktop, 12 sur mobile). Sur la suite complète de 68 scénarios : 62 réussis, 5 ignorés selon le viewport et un délai dépassé sur une capture mobile préexistante de l'accueil ; ce dernier scénario a réussi au recontrôle ciblé en 4 secondes. Total : 63 scénarios validés, 5 ignorés.
- Responsive : 320, 375, 390, 430, 768, 1024, 1280 et 1440 px, sans débordement horizontal.
- Captures avant/après desktop et mobile inspectées dans `docs/site/screenshots/` (artefacts locaux ignorés par Git).

Une exécution intermédiaire a perdu son serveur pendant une reconstruction du build ; les tests ont été relancés après stabilisation. Le délai intermittent du test de capture de l'accueil reste à surveiller ; aucun code de l'accueil n'a été modifié pour le contourner.

## Livraison

Intégration locale prête pour le pipeline Vercel existant. Le projet référencé par l'ancien `.openai/hosting.json` n'est plus accessible via Sites (`project_not_found`) : aucun nouveau site n'a été créé et aucun déploiement public n'a été déclenché. La configuration d'hébergement existante est conservée.
