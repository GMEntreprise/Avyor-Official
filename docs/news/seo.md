# Référencement de l’espace News

Tout ce qui suit est vérifié sur le **HTML réellement servi**, pas sur le code source : `tests/seo/news-html.test.mjs` lit le site construit par `scripts/news-fixture-site.mjs`.

## Rendu et exploration

Chaque page News est un fichier HTML complet, produit au build : titre, description, canonical, Open Graph, données structurées et **le texte entier de l’article** sont dans la réponse. Un robot de partage ou un client sans JavaScript reçoit l’article. Un test le vérifie en désactivant JavaScript dans le navigateur.

Le JavaScript ne sert qu’à ce qui suit la lecture : recherche, filtres, sommaire actif. Les vues de lecture sont chargées **à la demande**, uniquement sur les routes News.

## Métadonnées

| Élément | Règle |
| --- | --- |
| `title`, `meta description` | propres à l’article, uniques dans leur langue |
| `link rel=canonical` | absolue, sur le domaine réel, dérivée de la route |
| Open Graph | `og:type=article`, `og:locale`, titre, description, URL, image absolue avec son texte alternatif |
| `article:published_time` / `modified_time` | dates réelles de l’article |
| Twitter | `summary_large_image` |
| Flux | `<link rel="alternate" type="application/rss+xml">` sur toutes les pages News |
| Doublons | une seule balise de chaque : un test compte `title`, `canonical`, `description`, `og:title` |

L’image de partage est une vraie URL servie par le site (vérifiée sur disque par le test), en 1200 × 630 pour les articles livrés.

## Données structurées

`BlogPosting` + `BreadcrumbList`. Les champs reprennent ce qui est **visible** : `headline` est le `h1`, `datePublished` est la date affichée dans la signature, l’auteur affiché est l’auteur déclaré — une équipe éditoriale est une `Organization`, jamais une personne inventée. `NewsArticle` n’est pas utilisé : ces contenus sont des guides.

Pas de `FAQPage` : la documentation Google consultée le 18 septembre 2026 indique que les résultats enrichis FAQ ne sont plus affichés pour la quasi-totalité des sites. Une FAQ reste utile quand elle répond à de vraies questions — sans promesse d’enrichissement. Aucune note, aucun avis, aucun prix n’est déclaré.

## Sitemap, pagination et politique d’URL

- Le sitemap contient les articles publiés et indexables, avec leur `lastmod` (date de modification éditoriale), plus chaque page de liste. Jamais un brouillon, une ancienne adresse, un résultat de recherche ou une combinaison de filtres.
- **Chaque page de liste a sa propre canonical** : `/news/page/2/` ne se déclare pas copie de `/news/`. Des liens `rel="prev"` / `rel="next"` relient la série.
- **Recherche et filtres vivent dans la chaîne de requête** et ne sont pas des documents distincts : le serveur renvoie la page de liste, dont la canonical est elle-même. Aucune URL indexable ne se multiplie.
- Un article dépublié disparaît de la liste, de la recherche, du flux et du sitemap, et son adresse répond **404** — la vraie, avec la page utile du site. Une adresse renommée répond **308** vers la nouvelle, sans chaîne ni boucle.

## Langues

Les quatre articles existent dans les cinq langues. Chacun déclare ses quatre traductions, et chacune le déclare en retour ; un test compare les vingt articles dans les deux sens, parce qu’une chaîne non réciproque est ignorée par Google. Les adresses sont propres à chaque langue (`/news/brief-ugc-quoi-preciser/`, `/en/news/ugc-brief-what-to-specify/`, `/he/news/brif-ugc-ma-lefaret/`…) : le slug suit la langue, jamais une traduction automatique de l’adresse française.

Les `hreflang` d’un article ne sont écrits que pour des **traductions réelles, publiées et réciproques** : si l’article français désigne l’anglais et que l’anglais ne désigne pas le français en retour, aucun lien n’est déclaré. Un article sans traduction n’a aucun `hreflang`. La page de liste déclare ses langues seulement pour celles qui ont au moins un article.

Une langue sans article publié n’a ni page News, ni lien dans la navigation, ni entrée de sitemap : pas de page vide en attente de contenu.

## Flux

Un flux RSS 2.0 par langue (`/news/feed.xml`, `/en/news/feed.xml`) : XML échappé, `guid` stable (l’identifiant de l’article, jamais son adresse), dates RFC 822, uniquement des publications de cette langue. Déclaré dans le `<head>` des pages News.

## Maillage

Chaque article mène à une action réelle du site et, quand c’est pertinent, à trois articles publiés de la même langue — les choix de l’éditeur d’abord, puis la même thématique. **Aucun remplissage** : un article sans voisin pertinent n’affiche pas de bloc. L’accueil expose les trois dernières publications de sa langue, et `llms.txt` liste les articles pour les lecteurs automatiques.

Un test interdit tout lien interne qui ferait changer de langue par accident.

## Mesures de performance

Mesures **de laboratoire** (Lighthouse, mobile simulé, serveur local), reproductibles avec `node scripts/measure.mjs <url> <fichier>` — les rapports bruts ne sont pas versionnés — elles comparent des versions, elles ne décrivent pas l’expérience réelle. Seules des données de terrain (Search Console, mesure côté visiteurs) le feraient, et elles n’existent pas encore pour ce site.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/news/` | 0,94 | 1,00 | 1,00 | 1,00 | 2,8 s | 0 | 10 ms |
| `/news/<article>/` | 0,94 | 1,00 | 1,00 | 1,00 | 2,8 s | 0 | 0 ms |
| `/` (accueil, pour comparaison) | 0,85 | 1,00 | 1,00 | 0,69¹ | 4,1 s | 0 | 10 ms |

¹ L’accueil est mesuré sur le build local, qui porte `noindex` tant que le site vit sur un domaine `vercel.app` : Lighthouse pénalise ce point.

Les pages News sont plus rapides que l’accueil : pas de vidéo, pas d’animation d’entrée, une image de couverture dimensionnée et prioritaire, les images suivantes différées. `CLS = 0` : toutes les images portent leurs dimensions.

## Ce qui reste à faire, et par qui

- **Search Console** : vérification du domaine, envoi du sitemap, inspection d’URL. Ces actions demandent l’accès au compte ; **elles n’ont pas été réalisées ici**.
- **Mesure de terrain** : aucun outil de RUM n’est branché. Les événements éditoriaux (`news_article_view`, `news_toc`, `news_cta`) sont émis mais ne partent vers aucun service ; leur branchement pose une question de consentement à trancher.
- **Indexation** : le site reste `noindex` tant qu’il est servi depuis un domaine `vercel.app` (règle du projet). Rien ne sera indexé avant la mise en service du vrai domaine.
- Ni position, ni indexation, ni citation par un assistant ne peuvent être garanties. `llms.txt` ne remplace pas le référencement.
