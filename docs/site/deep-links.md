# Liens profonds — côté site

Objectif : qu'une adresse `https://avyor.app/video/<id>` ouvre **l'application** quand elle est
installée, et **une vraie page web** quand elle ne l'est pas. Jamais une page blanche, jamais une
redirection vers `avyor://` qui échoue sans rien dire.

L'application déclare déjà `avyor.app` et sait lire les liens entrants. Tout ce qui suit est du
côté du site.

## Une seule source

`src/config/deep-links.ts` porte le contrat : identifiants d'application, chemins, visibilité de
chaque ressource, forme d'un identifiant. En dépendent :

| Ce qui en découle | Où |
| --- | --- |
| `/.well-known/apple-app-site-association.json` | écrit au build par `scripts/prerender.mjs`, servi **sans extension** par une réécriture |
| `/.well-known/assetlinks.json` | idem, **seulement** si une empreinte est fournie |
| Réécritures d'adresses | `vercel.json` (`rewrites`), vérifiées par un test |
| Pages de repli | `src/content/locales/<lang>.ts`, une par ressource et par langue |
| Aperçus de lien supprimés | `scripts/prerender.mjs` (`social: false`) |
| Résolution côté client | `deepLinkPageFor()`, utilisée par `App` |

**Ne modifiez jamais un identifiant d'application au jugé.** Un Team ID ou une empreinte inventés
font échouer la vérification **sans aucun message** : ni sur le téléphone, ni dans les journaux du
site. Les valeurs viennent du dépôt de l'application (`eas.json`) et de Play Console.

## Les deux fichiers de vérification

```
https://avyor.app/.well-known/apple-app-site-association
https://avyor.app/.well-known/assetlinks.json
```

Contraintes, toutes obligatoires : **200**, `application/json`, **aucune redirection**, aucune
authentification, HTTPS valide.

**Premier piège, évité d'avance** : `vercel.json` déclare `trailingSlash: true`, donc toute adresse
sans extension est redirigée en 308 (`/creators` → `/creators/`). Une redirection sur le fichier
Apple suffirait à tout casser, puisque **Apple n'en suit aucune**. Vérifié sur le domaine réel avant
d'écrire quoi que ce soit : `/.well-known/…` **n'est pas** concerné — le chemin contient un point,
et la règle de Vercel ne vise que les segments qui n'en ont pas.

**Deuxième piège, découvert en production** : Vercel déduit le type d'un fichier statique de son
extension et **ignore un `content-type` déclaré dans `headers`** — le `cache-control` de la même
règle, lui, était bien appliqué. Le fichier, sans extension, partait donc en
`application/octet-stream`, et iOS l'ignorait sans un mot. Il est désormais **stocké avec
l'extension `.json`** et servi à l'adresse sans extension par une **réécriture**. Le fichier sans
extension ne doit pas exister : le système de fichiers passe avant les réécritures et reprendrait la
main avec le mauvais type. Un test le vérifie, `bun run deeplinks:check` le reconfirme sur le
domaine réel.

**Troisième piège, même origine** : `/video/abc` est d'abord redirigé en 308 vers `/video/abc/`,
donc une réécriture qui ne connaît que la forme **sans** barre oblique n'est jamais atteinte — la
page de repli répondait 404 en production alors qu'elle fonctionnait en local. Les deux formes sont
déclarées, et la vérification teste les deux.

### Android : l'empreinte n'est pas dans le dépôt

`assetlinks.json` n'est écrit que si `AVYOR_ANDROID_SHA256` est définie (plusieurs empreintes
séparées par des virgules). Sans elle, le build le dit et n'écrit rien : **un fichier présent avec
une mauvaise empreinte échoue en silence**, ce qui est pire que pas de fichier.

L'empreinte attendue est celle de **Google Play App Signing** dès que l'application passe par le
Play Store — Play Console ▸ Configuration ▸ Intégrité de l'app. Celle d'un build local ne
correspond pas, et la vérification échoue sans message utile.

À définir dans Vercel ▸ Settings ▸ Environment Variables (production), puis redéployer.

## Les chemins, et ce que montre chaque page

| Adresse | Visibilité | Ce que la page web affiche |
| --- | --- | --- |
| `/video/<id>`, `/creator/<id>`, `/campaign/<id>` | publique | ce que contient ce type de page dans l'application, et les deux boutons de téléchargement |
| `/collaboration/<id>`, `/messages/<id>` | **privée** | rien de la ressource, et la raison : connaître l'adresse ne donne aucun accès |
| `/auth/confirm`, `/auth/reset-password`, `/auth/callback` | technique | où terminer l'opération ; **aucun formulaire, aucun effet** |

Le site n'a pas accès aux données de l'application, et pour une conversation ou une collaboration,
il ne doit pas y accéder : la frontière reste la RLS côté application. Une page qui afficherait un
titre de collaboration deviendrait une porte dérobée. **Aucun contenu n'est inventé** : la page dit
ce que contient ce type de ressource, jamais ce que contient celle-ci.

Un identifiant que l'application refuserait (`[A-Za-z0-9][A-Za-z0-9._-]*`) ne sert aucune page :
il répond **404**.

## Ce qui n'est jamais fait, et pourquoi

- **Aucun aperçu de lien** (Open Graph, Twitter) sur une ressource privée ni sur `/auth/` : un
  aperçu se déplie dans une conversation de groupe, devant des gens qui n'ont rien à voir avec elle.
- **Aucun effet sur un `GET`.** Les robots d'aperçu de WhatsApp, Discord, Slack et iMessage ouvrent
  le lien **avant** son destinataire. Une page qui consommerait un jeton de confirmation le
  consommerait à leur place. Les pages d'authentification sont des fichiers statiques : il n'y a
  rien à déclencher.
- **Aucune mesure d'audience sur `/auth/`** : ces adresses portent des jetons, et une bibliothèque
  de mesure envoie l'adresse entière. La garde est dans `src/entry-client.tsx`, et un test la vérifie.
- **Aucune redirection automatique vers `avyor://`.** Si l'application est installée, le lien
  universel l'a déjà ouverte ; sinon, le schéma échoue sans message. Un lien partagé reste une page.
- **Aucun `"/": "*"`** dans le fichier Apple : une page marketing ou un article doit rester une
  page web.
- **Aucune adresse de repli dans le sitemap ni dans `llms.txt`**, et toutes portent `noindex`. Une
  même page servie sous une infinité d'adresses ne s'indexe pas : ce serait un tapis de pages
  identiques. Les rendre indexables demanderait une source de données publique et un rendu par
  ressource — c'est une autre décision, pas un réglage.

## Vérifier

```bash
bun run test            # le contrat, les réécritures, les gardes
bun run test:seo        # les fichiers et les pages réellement construits
bun run test:e2e        # le parcours complet, réécritures comprises
bun run deeplinks:check # le domaine réel : codes, types, redirections
```

`deeplinks:check` est le seul qui prouve ce qu'aucun test local ne peut prouver : ce que
l'hébergeur répond vraiment. À lancer **après chaque déploiement** qui touche à ces fichiers.

### Ce qu'un test en barre d'adresse ne prouve pas

Un lien universel se teste en **cliquant un vrai lien** — dans Messages, Mail, Notes. Taper
l'adresse dans Safari ne déclenche pas le mécanisme et donne un faux négatif. Même chose sur
Android : depuis Gmail, Messages ou Chrome.

## Ce qui reste à faire ailleurs

1. **Vercel** : définir `AVYOR_ANDROID_SHA256`, puis redéployer.
2. **Apple Developer** ▸ Membership : vérifier une fois le Team ID `LV946H6FDU`, puis ne plus y toucher.
3. **Application** : un **build natif neuf** est nécessaire pour qu'`associatedDomains` soit pris en
   compte — un rechargement JavaScript ne l'applique pas.
4. **Domaine** : `avyor.app` est canonique. Si `www.avyor.app` est servi un jour, il redirige en 301,
   ou bien l'application doit déclarer les deux domaines (donc un nouveau build natif).
