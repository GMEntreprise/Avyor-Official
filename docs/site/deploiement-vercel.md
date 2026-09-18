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

**Aucune variable d'environnement n'est à créer pour le premier déploiement.** Le script déduit l'URL canonique de `VERCEL_PROJECT_PRODUCTION_URL`, fournie par Vercel.

## 3. Ce que donne le premier déploiement

Le site est en ligne sur `…vercel.app`, **volontairement non indexable** : chaque page porte `noindex,follow` et le sitemap est vide.

C'est voulu. Sans cela, Google indexerait l'adresse `vercel.app`, qui ferait ensuite concurrence à votre vrai domaine sur les mêmes pages.

Le script **refuse de construire** un site indexable sur un domaine `vercel.app`. Ce n'est pas une option à contourner.

## 4. Quand le domaine est acheté

1. Vercel → **Settings → Domains → Add**, puis suivez les enregistrements DNS indiqués.
2. Attendez que le domaine soit marqué comme production.
3. Vercel → **Settings → Environment Variables**, ajoutez pour *Production* :

   ```
   VITE_SITE_INDEXABLE = true
   ```

4. Redéployez.

Les canonicals suivent tout seuls : `VERCEL_PROJECT_PRODUCTION_URL` devient votre domaine dès qu'il est attaché. Rien à changer dans le code.

Pour forcer une URL différente de celle de Vercel, ajoutez `VITE_SITE_URL` ; elle prend le pas.

### Après la bascule

- Les pages passent en `index,follow`, sauf `/privacy/`, `/terms/` et `/legal/` qui restent `noindex` tant que les informations d'éditeur manquent.
- Le sitemap contient **9 URL**.
- Vérifiez `https://votre-domaine/robots.txt` et `/sitemap.xml`, puis déclarez le sitemap dans la Search Console.

## 5. Quand les applications sortent

Ajoutez dans Vercel, en *Production* :

```
VITE_APPLE_APP_URL  = https://apps.apple.com/…/idXXXXXXXXX
VITE_GOOGLE_PLAY_URL = https://play.google.com/store/apps/details?id=…
```

Le filtre de `src/lib/store-url.ts` n'accepte que ces deux domaines en HTTPS. Une URL qui ne passe pas le filtre est **ignorée** : la plateforme reste « Bientôt disponible » plutôt que d'exposer un lien douteux. Navbar, hero, page de téléchargement, footer et données structurées suivent ensuite tout seuls.

## 6. En-têtes servis

Ils vivent dans `vercel.json`, pas dans `dist/_headers` — **ce dernier n'est lu que par Netlify et Cloudflare, Vercel l'ignore**. Un test échoue si un en-tête déclaré dans l'un manque à l'autre.

Sur toutes les réponses : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

Le cache distingue deux familles, et c'est important :

| Fichiers | Cache | Pourquoi |
| --- | --- | --- |
| `.js`, `.css`, `.woff2` sous `/assets/` | un an, immuable | leur nom contient une empreinte : il change à chaque modification |
| `.mp4`, `.webm`, `.webp`, `.png`, `.svg` | une semaine, révalidable | leur nom est stable ; un an d'immuable rendrait toute mise à jour invisible pour les visiteurs déjà venus |

Un test vérifie qu'aucun fichier au nom stable ne se retrouve en immuable.

## 7. `.env.production`

Ce fichier contient encore l'URL de l'ancienne prévisualisation. **Il est sans effet sur Vercel** : une variable d'environnement a la priorité, ce qui a été vérifié. Il ne sert plus qu'aux constructions locales, et peut être supprimé une fois le domaine en place.

## 8. Ce qui n'est pas expédié

`.vercelignore` écarte `video/`, `tools/`, `brand/`, `docs/`, `tests/`, `SEO_BOOSTER/` et les rapports. Vérifié : le build aboutit sans eux. Seuls `src/`, `public/`, `scripts/`, `index.html` et les fichiers de configuration partent.

## 9. Points non vérifiés

Le comportement réel des en-têtes et des redirections de barre oblique **n'a pas pu être testé sans déployer**. Après la première mise en ligne, contrôlez :

```
curl -sI https://votre-domaine/ | grep -i "x-frame\|referrer\|permissions"
curl -sI https://votre-domaine/creators | grep -i "location"        # doit rediriger vers /creators/
curl -sI https://votre-domaine/assets/<un .js>  | grep -i cache
curl -sI https://votre-domaine/assets/hero-poster.webp | grep -i cache
curl -s  -o /dev/null -w "%{http_code}\n" https://votre-domaine/page-inexistante/
```

Attendu : les quatre en-têtes présents, une redirection 308 vers l'adresse avec barre oblique, `immutable` sur le `.js` et `max-age=604800` sur l'image, et un vrai 404.
