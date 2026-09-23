/**
 * Le contrat de liens profonds entre le site et l'application.
 *
 * Une seule source : les fichiers `.well-known`, les réécritures d'adresses,
 * les pages de repli et les tests lisent tous ce fichier. Un chemin ajouté ici
 * apparaît partout ; un chemin ajouté ailleurs ne servirait à rien, parce
 * qu'iOS et Android ne regardent que le fichier de vérification.
 *
 * Les valeurs d'identité viennent du dépôt de l'application (`eas.json`,
 * `app.config.ts`). Ne les devinez jamais : un identifiant inventé fait
 * échouer la vérification sans aucun message, ni sur le téléphone, ni dans les
 * journaux du site.
 */

/** Apple Team ID + identifiant de bundle, tels que déclarés par l'application. */
export const APPLE_APP_IDS = ['LV946H6FDU.com.shavod.avyor'] as const;

/** Nom de paquet Android, tel que déclaré par l'application. */
export const ANDROID_PACKAGE = 'com.shavod.avyor';

/**
 * Ce que l'application accepte comme identifiant, repris à l'identique de
 * `src/lib/links/config.ts` côté application : le site doit refuser ce que
 * l'application refuse, sinon une adresse s'ouvre ici et pas là-bas.
 */
export const ID_PATTERN = '[A-Za-z0-9][A-Za-z0-9._-]{0,127}';

export interface DeepLinkRoute {
  /** Le segment de tête : `/video/<id>`. */
  slug: string;
  /** `public` : la page peut décrire la ressource. `private` : elle ne montre rien. */
  visibility: 'public' | 'private';
}

/** Les ressources désignées par un identifiant. L'ordre est celui de l'application. */
export const DEEP_LINK_ROUTES: DeepLinkRoute[] = [
  { slug: 'video', visibility: 'public' },
  { slug: 'creator', visibility: 'public' },
  { slug: 'campaign', visibility: 'public' },
  { slug: 'collaboration', visibility: 'private' },
  { slug: 'messages', visibility: 'private' },
];

/**
 * Les retours d'authentification. Ils portent des jetons dans l'adresse :
 * aucune mesure d'audience, aucun aperçu de lien, et surtout **aucun effet de
 * bord** — un robot d'aperçu ouvre le lien avant son destinataire.
 */
export const AUTH_ROUTES = ['auth/confirm', 'auth/reset-password', 'auth/callback'] as const;

/** Toutes les pages de repli que le site doit servir, dans chaque langue. */
export const DEEP_LINK_SLUGS: string[] = [
  ...DEEP_LINK_ROUTES.map((route) => route.slug),
  ...AUTH_ROUTES,
];

export const isDeepLinkSlug = (slug: string) => DEEP_LINK_SLUGS.includes(slug);

/**
 * La page qui répond pour une adresse portant un identifiant.
 *
 * Le serveur sert `/messages/` pour `/messages/<id>/` ; sans cette
 * correspondance, le client reprendrait la page sur une adresse qu'il ne
 * reconnaît pas et afficherait « page introuvable » juste après l'affichage.
 * Rend le slug inchangé quand il ne s'agit pas d'un lien profond.
 */
export function deepLinkPageFor(slug: string): string {
  if (isDeepLinkSlug(slug)) return slug;
  const [head, ...rest] = slug.split('/');
  if (rest.length !== 1 || !DEEP_LINK_ROUTES.some((route) => route.slug === head)) return slug;
  return new RegExp(`^${ID_PATTERN}$`).test(rest[0]) ? head : slug;
}
export const isAuthSlug = (slug: string) => (AUTH_ROUTES as readonly string[]).includes(slug);
/** Vrai pour une collaboration ou une conversation : la page ne montre rien. */
export const isPrivateResource = (slug: string) =>
  DEEP_LINK_ROUTES.some((route) => route.slug === slug && route.visibility === 'private');

/**
 * Le fichier qu'iOS télécharge pour autoriser AVYOR à ouvrir ces adresses.
 *
 * Jamais `"/": "*"` : une page marketing ou un article doit rester une page
 * web. Chaque motif déclaré est aussi une vérification qu'iOS effectue.
 */
export function appleAppSiteAssociation() {
  return {
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [...APPLE_APP_IDS],
          components: [
            ...DEEP_LINK_ROUTES.map((route) => ({
              '/': `/${route.slug}/*`,
              // En ASCII : ce fichier est lu par iOS, pas par un humain.
              comment: `AVYOR ${route.slug}`,
            })),
            { '/': '/auth/*', comment: 'AVYOR account links' },
          ],
        },
      ],
    },
  };
}

/** Une empreinte de certificat Android : 32 octets en hexadécimal majuscule. */
export const FINGERPRINT_PATTERN = /^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/;

/**
 * Le fichier qu'Android télécharge. Il n'est écrit **que** si une empreinte
 * valide est fournie : un fichier présent avec une mauvaise empreinte échoue
 * en silence, ce qui est pire que pas de fichier du tout.
 *
 * L'empreinte attendue est celle de **Google Play App Signing** dès que
 * l'application passe par le Play Store, pas celle d'un build local.
 */
export function assetLinks(fingerprints: string[]) {
  const clean = fingerprints.map((value) => value.trim().toUpperCase()).filter(Boolean);
  for (const fingerprint of clean)
    if (!FINGERPRINT_PATTERN.test(fingerprint))
      throw new Error(
        `Empreinte Android invalide : « ${fingerprint} ». Attendu : 32 paires hexadécimales majuscules séparées par « : ».`,
      );
  if (!clean.length) return null;
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: clean,
      },
    },
  ];
}
