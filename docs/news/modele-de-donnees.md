# Modèle de données, états et permissions

Une seule source : les fichiers JSON de `content/`. L’admin les écrit, le build les lit. Rien n’est dupliqué dans un autre magasin, et rien de calculable n’est stocké.

## Un article

`src/news/types.ts` fait foi. Un fichier par article, nommé par son identifiant.

| Groupe | Champs |
| --- | --- |
| Identité | `id` (12 caractères, tiré par l’éditeur), `locale`, `title`, `slug`, `slugHistory` |
| Éditorial | `excerpt`, `body` (document ProseMirror), `author` (organisation ou personne réelle), `type`, `audience`, `theme`, `featured` |
| Publication | `status` (`draft` / `published` / `archived`), `publishedAt`, `updatedAt` (modification éditoriale publique), `createdAt` |
| Média | `cover` : `src`, `width`, `height`, `alt`, `caption` |
| SEO | `seo` : `title`, `description`, `image` facultative, `noindex` |
| Relations | `related` (identifiants), `translations` (langue → identifiant) |
| Fiabilité | `revision`, `basedOnRevision` (pour un brouillon d’article en ligne), `slugHistory` |

**Jamais stockés** : le sommaire et le temps de lecture, recalculés depuis le contenu (`tableOfContents`, `readingMinutes`) — un sommaire enregistré finirait par mentir. **Stockées, en revanche** : les ancres des titres, parce qu’une adresse partagée doit survivre à une retouche de titre.

## Les deux dossiers

```
content/news/          version publiée · commitée · déployée · lue par le build
content/news-drafts/   brouillons et modifications en attente · jamais commitées
```

Le dépôt GitHub est public. Un brouillon commité serait lisible avant sa publication : `noindex` n’est pas une protection d’accès, et un fichier public non plus. Les brouillons restent donc sur le poste de l’éditeur, exclus par `.gitignore` et par `.vercelignore` (Vercel lit ce dernier lors d’un déploiement depuis la CLI). **Conséquence assumée** : un brouillon n’est ni sauvegardé, ni partagé entre deux machines.

## Cycle de vie

| Action | Effet sur les fichiers | Effet public (au déploiement suivant) |
| --- | --- | --- |
| Créer | écrit un brouillon | aucun |
| Enregistrer | remplace le brouillon, `revision + 1` | aucun |
| Publier | écrit la version publiée, supprime le brouillon, met à jour les redirections | page en ligne, sitemap, flux, recherche |
| Publier une modification | remplace la version publiée, conserve `publishedAt`, met à jour `updatedAt` | page mise à jour |
| Changer le slug puis publier | ancien slug versé dans `slugHistory`, redirection permanente écrite dans `vercel.json` | 308 de l’ancienne adresse vers la nouvelle |
| Dépublier / Archiver | supprime la version publiée, conserve le contenu en brouillon | 404, retrait du sitemap, du flux et de la recherche |

Une modification d’un article en ligne **ne touche jamais la version publiée** avant publication : les deux vivent dans deux fichiers distincts. Un test de bout en bout le vérifie en construisant réellement le site entre les deux étapes.

## Écritures concurrentes et double soumission

- Toutes les mutations passent par une file d’exécution : elles ne s’entrelacent jamais (`exclusive()` dans `store.server.ts`).
- Chaque enregistrement annonce la révision dont il part. Si elle n’est plus à jour — deuxième onglet, double clic — le serveur répond **409** et n’écrit rien. L’admin propose alors de recharger la dernière version.
- Les fichiers sont écrits dans un fichier temporaire puis renommés : jamais un demi-fichier.
- La création est idempotente : l’identifiant vient de l’éditeur, une seconde soumission renvoie l’article déjà créé.
- L’unicité d’un slug est vérifiée **dans la file**, contre les slugs publiés *et* contre les anciennes adresses encore redirigées. Le build refait la vérification sur l’ensemble du corpus : un fichier modifié à la main ne peut pas mettre deux articles à la même adresse.

## Permissions

L’API d’administration n’existe que sur le serveur de développement (`vite.config.ts`, `apply: 'serve'`). Elle refuse toute requête qui ne vient pas de la page d’admin :

- un mot de passe, demandé une fois par session de navigateur. Le serveur le tient de `AVYOR_ADMIN_PASSWORD` (dans `.env.local`, jamais commité) ; **sans lui, l’admin ne s’ouvre pas du tout**. Les essais sont comparés en temps constant, ralentis, et la porte se ferme une minute après cinq échecs ;
- un jeton de session tiré au démarrage du serveur, remis **en échange du mot de passe** et jamais écrit dans la page — un autre site ne peut ni le lire (même origine) ni envoyer l’en-tête qui le porte sans une requête préalable que l’API n’accorde jamais ;
- l’en-tête `Host` doit désigner cette machine (contre le rebinding DNS) ;
- l’`Origin`, s’il est envoyé, doit être ce serveur.

Le site déployé n’a **aucune** route de mutation : c’est un ensemble de fichiers. La seule autre façon de changer un article est un commit dans le dépôt, soumis aux permissions GitHub.

Les envois d’images sont vérifiés sur leurs octets, pas sur leur extension : seuls de vrais PNG, JPEG ou WebP passent, taille limitée à 8 Mo, réencodage en WebP (les métadonnées, géolocalisation comprise, disparaissent), nom dérivé de l’empreinte du contenu.

## Propagation

Publier écrit un fichier ; **la mise en ligne, c’est le déploiement**. Aucune invalidation de cache n’est à faire : chaque build produit des fichiers dont les noms empreintés changent avec leur contenu, et `vercel.json` interdit tout cache long sur les médias au nom stable. Le délai réel est celui de Vercel (une à deux minutes en général, à confirmer sur le tableau de bord). Le test de bout en bout reproduit exactement cette chaîne : publier → reconstruire → servir → lire.

## Migrations

Aucune : il n’existait pas de contenu News avant. Le format d’un article est celui de l’éditeur (ProseMirror), donc aucune conversion n’a lieu à l’enregistrement ni au rendu. Si un champ devait changer plus tard, les fichiers sont versionnés dans git — une migration se ferait par script, avec les fichiers d’origine comme sauvegarde.
