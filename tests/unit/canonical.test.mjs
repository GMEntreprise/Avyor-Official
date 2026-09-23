import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

/*
 * Le domaine canonique du site.
 *
 * Il a déjà été faux en production : le site en ligne publiait
 * `canonical=avyor-official.vercel.app` et `noindex` sur chaque page, parce que
 * deux variables d'environnement n'avaient jamais été posées. Personne ne le
 * voyait — un site qui se porte bien a exactement la même apparence.
 */
const DOMAIN = 'https://avyor.app';
const build = readFileSync('scripts/vercel-build.mjs', 'utf8');
const env = readFileSync('.env.production', 'utf8');

/** La décision du script de build, sans construire le site. */
function decide(vars) {
  const output = execFileSync('node', ['scripts/vercel-build.mjs', '--dry-run'], {
    env: { ...process.env, VITE_SITE_URL: '', VITE_SITE_INDEXABLE: '', VERCEL_ENV: '', ...vars },
    encoding: 'utf8',
  });
  return {
    origin: /Canonical origin\s*:\s*(\S+)/.exec(output)?.[1],
    indexable: /Indexable\s*:\s*yes/.test(output),
  };
}

test('le domaine est déclaré une fois, et les deux endroits sont d’accord', () => {
  assert.match(build, new RegExp(`const PRODUCTION_ORIGIN = '${DOMAIN}';`));
  assert.match(env, new RegExp(`^VITE_SITE_URL=${DOMAIN}$`, 'm'));
  // Un domaine périmé traînait ici et publiait des canonicals vers un autre
  // site. La garde, elle, a le droit de nommer vercel.app : elle le refuse.
  assert.doesNotMatch(
    build + env,
    /https:\/\/[\w.-]*(vercel\.app|chatgpt\.site)/,
    'aucune adresse de déploiement ne sert de domaine',
  );
});

test('un build de production est indexable, sur le vrai domaine', () => {
  const production = decide({ VERCEL_ENV: 'production' });
  assert.equal(production.origin, DOMAIN);
  assert.equal(production.indexable, true, 'le site réel doit pouvoir être indexé');
});

test('une préproduction ne s’indexe pas', () => {
  const preview = decide({
    VERCEL_ENV: 'preview',
    VERCEL_PROJECT_PRODUCTION_URL: 'avyor-official.vercel.app',
  });
  assert.equal(preview.indexable, false, 'une copie ne concurrence pas le site');
  assert.equal(preview.origin, DOMAIN, 'elle renvoie vers le vrai domaine');
});

test('une décision explicite reste prioritaire, dans les deux sens', () => {
  assert.equal(decide({ VERCEL_ENV: 'production', VITE_SITE_INDEXABLE: 'false' }).indexable, false);
  assert.equal(decide({ VITE_SITE_INDEXABLE: 'true' }).indexable, true);
  assert.equal(decide({ VITE_SITE_URL: 'https://autre-site.fr' }).origin, 'https://autre-site.fr');
});

test('indexer une adresse de déploiement reste refusé', () => {
  // Sinon une copie du site entre en concurrence avec lui dans les résultats.
  assert.throws(
    () =>
      decide({
        VERCEL_ENV: 'production',
        VITE_SITE_URL: 'https://avyor-official.vercel.app',
        VITE_SITE_INDEXABLE: 'true',
      }),
    /Command failed/,
  );
});

test('le HTML construit ne porte aucun autre domaine', () => {
  const home = readFileSync('dist/index.html', 'utf8');
  assert.match(home, /<link rel="canonical" href="https:\/\/avyor\.app\/">/);
  assert.doesNotMatch(home, /vercel\.app|chatgpt\.site/);
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/avyor\.app\/sitemap\.xml/);
});

test('un seul hôte sert le site : les miroirs redirigent vers lui', () => {
  /*
   * `www.avyor.app` et l'adresse de déploiement répondaient 200 : trois hôtes
   * servaient les mêmes pages. Un moteur y voit des copies, et une propriété
   * Search Console déclarée sur le mauvais hôte ne trouve jamais le sitemap de
   * l'autre.
   */
  const miroirs = vercel.redirects.filter((rule) => rule.has?.some((c) => c.type === 'host'));
  assert.ok(miroirs.length >= 2, 'www et l’adresse de déploiement doivent rediriger');
  for (const rule of miroirs) {
    const host = rule.has.find((c) => c.type === 'host').value;
    assert.equal(rule.permanent, true, `${host} : la redirection doit être permanente`);
    assert.equal(rule.destination, `${DOMAIN}/:path*`, host);
    assert.equal(rule.source, '/:path*', host);
    // Une boucle serait invisible ici et fatale en ligne.
    assert.notEqual(`https://${host}`, DOMAIN, 'un hôte ne peut pas rediriger vers lui-même');
  }
  // Elles passent avant tout le reste : une redirection d'adresse interne ne
  // doit pas s'appliquer avant que l'hôte soit le bon.
  const premiers = vercel.redirects.slice(0, miroirs.length);
  assert.deepEqual(premiers, miroirs, 'les miroirs sont déclarés en premier');
});
