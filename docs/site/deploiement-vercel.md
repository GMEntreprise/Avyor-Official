# AVYOR — mise en ligne sur Vercel

Tout est déjà configuré dans `vercel.json`. Aucun réglage n'est à saisir dans l'interface : Vercel lit ce fichier.

## 1. Mettre le dépôt sur GitHub

Le remote est déjà en place et le dépôt distant est vide :

```
git push -u origin main
```

## 2. Importer le projet dans Vercel

Sur vercel.com : **Add New → Project → Import** le dépôt `GMEntreprise/Avyor-Official`.

Laissez tout par défaut. Vercel applique `vercel.json` :

| Réglage | Valeur, déjà écrite |
| --- | --- |
| Framework | aucun, build maison |
| Install | `bun install --frozen-lockfile` |
| Build | `node scripts/vercel-build.mjs` |
| Sortie | `dist` |
| Barre oblique finale | conservée, comme les canonicals |

**Aucune variable d'environnement n'est à créer.** Le domaine canonique est déclaré dans `scripts/vercel-build.mjs` (`PRODUCTION_ORIGIN = 'https://avyor.app'`) et repris dans `.env.production`. Un déploiement de production publie donc ce domaine, et rien d'autre.

Cela n'a pas toujours été le cas : l'URL se déduisait de `VERCEL_PROJECT_PRODUCTION_URL`, et le site en ligne a publié pendant des semaines `canonical=avyor-official.vercel.app` avec `noindex` sur chaque page. Un site qui ne sera jamais indexé a exactement la même apparence qu'un site qui va l'être : seule une vérification le dit (`bun run deeplinks:check`).

## 3. Ce que donne le premier déploiement

Le site est en ligne sur `…vercel.app`, **volontairement non indexable** : chaque page porte `noindex,follow` et le sitemap est vide.

C'est voulu. Sans cela, Google indexerait l'adresse `vercel.app`, qui ferait ensuite concurrence à votre vrai domaine sur les mêmes pages.

Le script **refuse de construire** un site indexable sur un domaine `vercel.app`. Ce n'est pas une option à contourner.

## 4. Quand le domaine change

1. Vercel → **Settings → Domains → Add**, puis suivez les enregistrements DNS indiqués.
2. Attendez que le domaine soit marqué comme production.
3. Mettez à jour **les deux endroits** : `PRODUCTION_ORIGIN` dans `scripts/vercel-build.mjs` et `VITE_SITE_URL` dans `.env.production`. Un test échoue s'ils divergent.
4. Redéployez, puis `bun run deeplinks:check` pour lire ce que le domaine répond vraiment.

Si Vercel annonce un autre domaine de production que celui déclaré, le build le signale sans échouer : c'est le signe que la constante est périmée.

Deux variables restent prioritaires quand elles sont posées : `VITE_SITE_URL` (publier sous un autre domaine) et `VITE_SITE_INDEXABLE` (`false` pour retarder l'indexation, `true` pour une répétition). Sans elles, un déploiement de production est indexable et une préproduction ne l'est pas.

### Après la bascule

- Les pages passent en `index,follow`, sauf `/privacy/`, `/terms/` et `/legal/` qui restent `noindex` tant que les informations d'éditeur manquent.
- Le sitemap contient les pages du site dans les cinq langues, plus les pages News publiées (70 URL au dernier build).
- Vérifiez `https://votre-domaine/robots.txt` et `/sitemap.xml`, puis déclarez le sitemap dans la Search Console.

## 5. Quand les applications sortent

Ajoutez dans Vercel, en *Production* :

```
VITE_APPLE_APP_URL  = https://apps.apple.com/…/idXXXXXXXXX
VITE_GOOGLE_PLAY_URL = https://play.google.com/store/apps/details?id=…
```

Le filtre de `src/lib/store-url.ts` n'accepte que ces deux domaines en HTTPS. Une URL qui ne passe pas le filtre est **ignorée** : la plateforme reste « Bientôt disponible » plutôt que d'exposer un lien douteux. Navbar, hero, page de téléchargement, footer et données structurées suivent ensuite tout seuls.

## 6. Mesure d'audience et de rapidité

Vercel Web Analytics et Speed Insights sont installés. Deux choses à savoir.

**Il faut les activer dans Vercel**, sinon rien ne remonte : Settings → Analytics, puis Settings → Speed Insights, bouton *Enable*. Sans activation, les chemins `/_vercel/insights/script.js` et `/_vercel/speed-insights/script.js` répondent 404.

**Ils ne partent que depuis le déploiement de production.** `scripts/vercel-build.mjs` n'active la mesure que si `VERCEL_ENV` vaut `production`. Ailleurs — prévisualisations, serveur local, tests — les scripts viennent d'un chemin que seul Vercel sert : ce ne serait qu'une erreur de plus dans la console du visiteur, et des chiffres faussés.

Le chargement est différé jusqu'à ce que le navigateur soit disponible : la mesure ne prend jamais de bande passante à la page qu'elle mesure. Les indicateurs de rapidité sont lus depuis l'historique du navigateur, arriver tard ne fait donc rien perdre.

Les deux outils fonctionnent **sans cookie**. Ils sont déclarés dans la politique de confidentialité, et **un test échoue si un outil de mesure est installé sans y être mentionné**. La base juridique de cette mesure reste à trancher : c'est un TODO signalé dans la page.

### Ce qu'il ne faut pas faire

Les recettes toutes faites pour projets React ajoutent une réécriture attrape-tout :

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Elle existe pour les sites dont une seule page HTML existe. **Ici, chaque route est pré-rendue** : l'accès direct fonctionne déjà. Cette règle servirait l'accueil, avec un statut 200, à la place de la page 404 — pour chaque adresse inventée, y compris celles que testent les robots. Un test la refuse.

## 7. En-têtes servis

Ils vivent dans `vercel.json`, pas dans `dist/_headers` — **ce dernier n'est lu que par Netlify et Cloudflare, Vercel l'ignore**. Un test échoue si un en-tête déclaré dans l'un manque à l'autre.

Sur toutes les réponses : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

Le cache distingue deux familles, et c'est important :

| Fichiers | Cache navigateur | Pourquoi |
| --- | --- | --- |
| `.js`, `.css`, `.woff2` sous `/assets/` | un an, immuable | leur nom contient une empreinte : il change à chaque modification, et une adresse n'est jamais réutilisée |
| `.mp4`, `.webm`, `.webp`, `.png`, `.svg` | `max-age=0, must-revalidate` | leur nom est stable ; le navigateur revérifie à chaque chargement, ce qui coûte une simple requête conditionnelle (réponse 304) |

**Vercel applique ces en-têtes à toutes les réponses d'une adresse, y compris aux erreurs.** Une première version donnait une semaine de cache aux médias : quand le logo a manqué, les navigateurs ont reçu une 404 avec la consigne de la garder une semaine, et ont continué à l'afficher alors que le fichier était revenu. Avec `max-age=0`, une erreur passagère disparaît au chargement suivant.

Le réseau de Vercel garde quand même ces fichiers en cache à la périphérie, et vide ce cache à chaque déploiement : les performances n'en souffrent pas.

Un test échoue si un fichier au nom stable reçoit un `max-age` positif.

## 8. `.env.production`

Ce fichier contient encore l'URL de l'ancienne prévisualisation. **Il est sans effet sur Vercel** : une variable d'environnement a la priorité, ce qui a été vérifié. Il ne sert plus qu'aux constructions locales, et peut être supprimé une fois le domaine en place.

## 9. Ce qui n'est pas expédié

`.vercelignore` écarte `/video/`, `/tools/`, `/brand/`, `/docs/`, `/tests/`, `/SEO_BOOSTER/` et les rapports. Seuls `src/`, `public/`, `scripts/`, `index.html` et les fichiers de configuration partent.

**Chaque motif commence par `/`, et c'est indispensable.** Vercel applique la syntaxe gitignore : un motif non ancré vise tout dossier de ce nom à n'importe quelle profondeur. La première version écrivait `brand/` pour le dossier racine des masters — le motif excluait aussi `public/assets/brand/`, et **le logo n'a jamais été servi en production**.

Les tests appliquent désormais le moteur gitignore de git lui-même, et non une comparaison de chaînes : ils vérifient qu'aucun fichier dont le build ou une page a besoin n'est écarté.

## 10. Points non vérifiés

Le comportement réel des en-têtes et des redirections de barre oblique **n'a pas pu être testé sans déployer**. Après la première mise en ligne, contrôlez :

```
curl -sI https://votre-domaine/ | grep -i "x-frame\|referrer\|permissions"
curl -sI https://votre-domaine/creators | grep -i "location"        # doit rediriger vers /creators/
curl -sI https://votre-domaine/assets/<un .js>  | grep -i cache
curl -sI https://votre-domaine/assets/hero-poster.webp | grep -i cache
curl -s  -o /dev/null -w "%{http_code}\n" https://votre-domaine/page-inexistante/
```

Attendu : les quatre en-têtes présents, une redirection 308 vers l'adresse avec barre oblique, `immutable` sur le `.js`, `max-age=0, must-revalidate` sur l'image, et un vrai 404.
