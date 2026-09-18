# Compte rendu de validation — espace News

Exécuté le 18 septembre 2026, sur ce poste. Tout ce qui suit a été vérifié en lançant les commandes ; ce qui ne l’a pas été est dit comme tel.

## Suite complète

```
bun run test:all
```

| Étape | Résultat |
| --- | --- |
| `typecheck` (TypeScript strict) | aucune erreur |
| `lint` (ESLint) | aucune erreur |
| `test` — unitaires | **140 tests, 0 échec** |
| `build` | 60 pages statiques + 404, 0 article publié |
| `test:seo` — HTML construit | **114 tests, 0 échec** (dont 17 sur le site de test News) |
| `test:e2e` — Playwright, desktop et mobile | **118 tests, 12 ignorés** (un seul passage nécessaire), 0 échec |

Budget : `jsGzip` 138 648 octets (plafond 143 360) · `jsGzipPerLocale` 159 996 (168 960) · `cssGzip` 14 888 (25 600). Les vues de lecture News sont chargées à la demande : une page hors News ne les télécharge pas.

## Ce que couvrent les tests

**Modèle et contenu** (`tests/unit/news-model.test.mjs`, `news-build.test.mjs`) : ancres avec accents, titres identiques, titres composés de segments mis en forme, ancre conservée après retouche de titre, titre coupé en deux, sommaire identique au rendu, temps de lecture, liens sûrs, blocs et marques inconnus refusés, image sans texte alternatif refusée, marqueur « à compléter » bloquant, date de publication future refusée, recherche insensible à la casse et aux accents, pagination sur l’ensemble du corpus, article mis en avant non répété, traduction réciproque uniquement, flux RSS échappé.

**Stockage** (`news-store.test.mjs`) : brouillon invisible côté public, mise en forme intacte après enregistrement et relecture, révision périmée refusée, deux enregistrements simultanés (un seul passe, fichier jamais corrompu), publication refusée si incomplète ou si une image manque, modification d’un article en ligne sans fuite, unicité du slug par langue y compris entre deux publications simultanées, historique des adresses sans chaîne ni boucle, adresse d’un autre article refusée, dépublication et archivage, duplication en brouillon, redirections idempotentes, envoi d’image vérifié sur ses octets.

**API d’administration** (`news-api.test.mjs`) : lecture et écriture refusées sans jeton, requête d’un autre site refusée, nom d’hôte détourné refusé, lien `javascript:` refusé avant toute écriture, conflit de révision, ancres posées à l’enregistrement, corps de requête démesuré refusé, fichier non-image refusé.

**Articles livrés** (`news-articles.test.mjs`) : les quatre sont publiables en l’état, adresses et titres SEO uniques, sommaire et outil de décision présents, réponse centrale en gras dès l’introduction, aucune formule creuse, aucun chiffre inventé (le seul montant cité est le seuil légal, sourcé), faits produit conformes à l’application, source officielle datée dès qu’une règle est citée.

**HTML construit** (`tests/seo/news-html.test.mjs`) : brouillon absent de tout fichier servi, métadonnées conformes à l’affichage, données structurées cohérentes avec le visible, `hreflang` réciproques, ancres du sommaire menant à de vraies sections, HTML sémantique sans script ni attribut événementiel, données d’hydratation sans champ interne, pagination avec canonical propre, filtres limités à ce qui est alimenté, sitemap avec dates, flux par langue, index de recherche complet, absence de News dans les langues sans article, dernières publications sur l’accueil, redirection d’une adresse renommée.

**Parcours public** (`tests/e2e/news.spec.ts`) : ouverture directe et rechargement, lecture sans JavaScript, vraie 404, redirection 308, sommaire qui déplace le focus et met l’adresse à jour sous l’en-tête, sommaire collant, ouverture directe sur une ancre, sommaire repliable au clavier sur mobile, recherche sur tout le corpus sans accents ni casse, filtre qui revient en première page et survit au rechargement et au retour arrière, absence de résultat, erreur de chargement rattrapable, dernière recherche gagnante, pagination en vraies adresses, thématique cliquable sans ouvrir la carte, navigation au clavier, accessibilité (axe, WCAG 2.1 AA) et absence de débordement de 320 à 1440 px, tableau large défilant dans son cadre.

**Parcours d’administration** (`tests/e2e/news-admin.spec.ts`) : créer → mettre en forme (gras, italique, les deux, liste, lien au clavier) → enregistrer → recharger (mise en forme intacte) → prévisualiser (mêmes ancres) → vérifier qu’un brouillon répond 404 → publier → reconstruire le site → lire **sans session** → naviguer par le sommaire → retrouver l’article par la recherche sur son contenu → modifier sans publier (la version en ligne ne bouge pas) → changer l’adresse (308 de l’ancienne, ancre publiée conservée) → dépublier (404, sitemap nettoyé, section retirée). Mutation refusée sans la session de l’admin.

## Vérification par mutation

Un test qui passe du premier coup ne prouve rien tant qu’on ne l’a pas vu échouer. Trois défauts ont été introduits volontairement, puis annulés :

| Défaut introduit | Attrapé par |
| --- | --- |
| Le build lit aussi `content/news-drafts/` | 5 tests SEO, dont « un brouillon n’apparaît dans aucun fichier servi » |
| Les ancres ne sont plus dédoublonnées | 1 test unitaire + 1 test SEO (`#exemple` / `#exemple-2`) |
| Une plateforme non publiée redevient un lien (règle du site) | 2 tests SEO |

## Défauts trouvés et corrigés pendant la validation

1. **L’éditeur défaisait des frappes rapides.** L’état React avait un rendu de retard sur l’éditeur, et l’effet de synchronisation réécrivait le document sous le curseur : deux « Entrée » en fin de liste ajoutaient des éléments au lieu d’en sortir. La synchronisation ne se fait plus que lorsqu’une version arrive du serveur, en conservant la sélection.
2. **« Entrée » supprimait le mot venant d’être lié.** Après le dialogue du lien, l’éditeur ne voyait pas le focus revenir : son état de sélection restait sur le mot lié pendant que le curseur visible avançait. La sélection est maintenant capturée avant le dialogue, restaurée après, et le curseur laissé juste après le lien.
3. **Le sommaire latéral n’apparaissait pas.** Un élément collant ne peut coller que dans la hauteur de son parent ; celui-ci était réduit à son contenu.
4. **La barre d’outils de l’éditeur recouvrait le texte** : `overflow: hidden` transformait son conteneur en zone de défilement, la barre collait 120 px trop bas.
5. **Le titre d’article n’était pas aligné sur son texte**, et la ligne de lecture atteignait ~100 caractères. En-tête, couverture et corps partagent désormais une colonne ; mesuré : **62 caractères par ligne, 18 px, interligne 1,70, contraste 13,7:1**.
6. **Contraste insuffisant** sur le bouton de recherche (blanc sur violet clair, 4,34:1) : remplacé par le violet foncé de la marque.
7. **Titres identiques répétés** en fin de document juridique (`Contact` / `Contact`) — corrigé dans les cinq langues.
8. **Un test ancien s’appuyait sur un comportement impossible en production** : `/marques/` est une redirection déclarée, elle ne montre jamais la page 404. La prévisualisation locale applique désormais les redirections de `vercel.json`, ce qui a révélé l’écart.

## Contrôles visuels

Captures dans [`captures/`](captures/) : liste, article, article avec sommaire, article sur mobile (sommaire replié ouvert), liste de l’admin, édition, aperçu. Contrôles effectués à 320, 375, 768 et 1440 px (aucun débordement horizontal), au clavier (focus visible sur les cartes, sommaire utilisable, panneau de l’admin atteignable) et avec `prefers-reduced-motion`.

## Limites réelles

- **Rien n’est publié.** Les quatre articles sont des brouillons ; l’espace News n’apparaît donc pas encore sur le site en ligne. C’est voulu : la publication est une décision éditoriale.
- **Le site public n’a pas été déployé** dans le cadre de ce travail, et **aucune vérification Search Console n’a été faite** : elle demande l’accès au compte.
- Les mesures de performance sont des mesures de laboratoire, sur un serveur local.
- Les brouillons ne sont ni sauvegardés hors de ce poste, ni partagés entre machines — conséquence directe du dépôt public.
- L’admin suppose un seul rédacteur à la fois sur une machine. Les conflits sont détectés (révisions), mais il n’y a pas d’édition simultanée.
- Les événements de mesure sont émis mais ne partent vers aucun outil ; le consentement reste à trancher au branchement.
- Le benchmark de Collabstr n’a pas pu être fait : le site refuse les lectures automatisées.

## Prochaines décisions utiles

1. Relire les quatre articles, puis publier ceux qui conviennent (un clic, puis un commit).
2. Décider si les articles seront traduits : la mécanique `hreflang` est prête et n’attend que de vraies traductions.
3. Brancher — ou non — les trois événements éditoriaux à un outil de mesure, en tranchant la question du consentement.
4. Après la mise en service du domaine : vérification Search Console, envoi du sitemap, inspection d’une URL d’article.
