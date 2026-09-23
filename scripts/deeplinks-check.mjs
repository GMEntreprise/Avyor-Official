/**
 * Vérifie, sur le domaine réel, ce qu'aucun test local ne peut prouver.
 *
 *   bun run deeplinks:check                  → https://avyor.app
 *   bun run deeplinks:check https://autre.fr → un autre domaine
 *
 * Ce que le build garantit : les fichiers existent et disent la bonne chose.
 * Ce que seul un déploiement montre : le code de réponse, le type de contenu,
 * l'absence de redirection, et la façon dont l'hébergeur traite une adresse
 * sans extension. Trois choses qui font échouer la vérification en silence :
 * iOS et Android n'écrivent rien nulle part quand elles ne sont pas tenues.
 */
import { appleAppSiteAssociation, DEEP_LINK_ROUTES, AUTH_ROUTES } from '../src/config/deep-links.ts';

const origin = (process.argv[2] ?? 'https://avyor.app').replace(/\/$/, '');
let failures = 0;

const ok = (label, detail = '') => console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ''}`);
const ko = (label, detail) => {
  failures++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
};

/** Une seule requête, sans suivre les redirections : c'est ce que fait Apple. */
async function fetchRaw(path) {
  const response = await fetch(origin + path, { redirect: 'manual' });
  return {
    status: response.status,
    type: response.headers.get('content-type') ?? '',
    location: response.headers.get('location') ?? '',
    body: await response.text().catch(() => ''),
  };
}

console.log(`\nVérification des liens profonds sur ${origin}\n`);

/* ------------------------------------------------------ Les deux fichiers */

console.log('Fichiers de vérification');
{
  const path = '/.well-known/apple-app-site-association';
  const r = await fetchRaw(path);
  if (r.status !== 200) ko(path, `${r.status}${r.location ? ` → ${r.location}` : ''}`);
  else if (r.location) ko(path, `redirection vers ${r.location} : Apple n’en suit aucune`);
  else if (!/application\/json/.test(r.type)) ko(path, `content-type ${r.type || 'absent'}`);
  else {
    try {
      const served = JSON.parse(r.body);
      const expected = appleAppSiteAssociation();
      if (JSON.stringify(served) !== JSON.stringify(expected))
        ko(path, 'le contenu servi diffère du contrat du dépôt (déploiement en retard ?)');
      else ok(path, '200, application/json, conforme');
    } catch {
      ko(path, 'réponse illisible : ce n’est pas du JSON');
    }
  }
}
{
  const path = '/.well-known/assetlinks.json';
  const r = await fetchRaw(path);
  if (r.status === 404)
    ko(path, 'absent : définissez AVYOR_ANDROID_SHA256 (Play Console ▸ Intégrité de l’app)');
  else if (r.status !== 200) ko(path, `${r.status}${r.location ? ` → ${r.location}` : ''}`);
  else if (!/application\/json/.test(r.type)) ko(path, `content-type ${r.type || 'absent'}`);
  else {
    const fingerprints = JSON.parse(r.body).flatMap(
      (e) => e.target?.sha256_cert_fingerprints ?? [],
    );
    const wrong = fingerprints.filter((f) => !/^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/.test(f));
    if (wrong.length) ko(path, `empreinte mal formée : ${wrong[0]}`);
    else ok(path, `200, ${fingerprints.length} empreinte(s)`);
  }
}

/* ------------------------------------------------------- Les vraies pages */

console.log('\nPages de repli');
for (const route of DEEP_LINK_ROUTES) {
  const path = `/${route.slug}/a1b2c3d4/`;
  const r = await fetchRaw(path);
  if (r.status !== 200) ko(path, `${r.status}${r.location ? ` → ${r.location}` : ''}`);
  else if (!/<h1/.test(r.body)) ko(path, 'page sans titre : repli vide');
  else if (route.visibility === 'private' && /property="og:/.test(r.body))
    ko(path, 'aperçu de lien sur une ressource privée');
  else ok(path, route.visibility === 'private' ? '200, sans aperçu' : '200');
}
for (const slug of AUTH_ROUTES) {
  const path = `/${slug}/`;
  const r = await fetchRaw(path);
  if (r.status !== 200) ko(path, `${r.status}${r.location ? ` → ${r.location}` : ''}`);
  else if (/<form/.test(r.body)) ko(path, 'formulaire : une page d’authentification n’agit pas');
  else ok(path, '200');
}
{
  // Ce que l'application refuse, le site doit le refuser.
  const path = '/video/%20espace/';
  const r = await fetchRaw(path);
  if (r.status === 404) ok(path, '404, comme attendu');
  else ko(path, `${r.status} : un identifiant invalide ne doit pas servir une page`);
}

/* ------------------------------------------- Les pages que l'app ouvre déjà */

console.log('\nPages ouvertes depuis l’application');
for (const path of ['/privacy/', '/terms/', '/legal/', '/faq/']) {
  const r = await fetchRaw(path);
  if (r.status === 200) ok(path, '200');
  else ko(path, `${r.status}${r.location ? ` → ${r.location}` : ''}`);
}

/* ------------------------------------------------------------ Indexation */

console.log('\nRéférencement du domaine');
{
  const r = await fetchRaw('/');
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(r.body)?.[1] ?? '';
  const robots = /<meta name="robots" content="([^"]+)"/.exec(r.body)?.[1] ?? '';
  const verification = /name="google-site-verification"/.test(r.body);
  if (canonical.startsWith(origin)) ok('canonical', canonical);
  else ko('canonical', `${canonical || 'absente'} — attendu sur ${origin}`);
  if (/noindex/.test(robots))
    ko('robots', `${robots} — le site ne sera pas indexé (VITE_SITE_INDEXABLE)`);
  else ok('robots', robots || 'index par défaut');
  if (verification) ok('google-site-verification', 'présente sur l’accueil');
  else ko('google-site-verification', 'absente : la propriété Search Console retombera');
  const sitemap = await fetchRaw('/sitemap.xml');
  const declared = /<loc>([^<]+)<\/loc>/.exec(sitemap.body)?.[1] ?? '';
  if (sitemap.status !== 200) ko('/sitemap.xml', String(sitemap.status));
  else if (declared && !declared.startsWith(origin)) ko('/sitemap.xml', `pointe vers ${declared}`);
  else ok('/sitemap.xml', `${(sitemap.body.match(/<loc>/g) ?? []).length} adresse(s)`);
}

console.log(
  failures
    ? `\n${failures} point(s) à corriger. Un Universal Link se teste ensuite en cliquant un vrai lien (Messages, Mail), pas en tapant l’adresse dans Safari.\n`
    : '\nTout est en place. Dernière étape, sur un téléphone : cliquer un vrai lien depuis Messages ou Mail — taper l’adresse dans le navigateur ne déclenche pas le mécanisme.\n',
);
process.exit(failures ? 1 : 0);
