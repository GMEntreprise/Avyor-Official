import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { load } from 'cheerio';

const config = JSON.parse(readFileSync('vercel.json', 'utf8'));

/** Vite fingerprints a file by inserting an 8-character hash before the extension. */
const fingerprinted = (name) => /-[A-Za-z0-9_-]{8}\.[a-z0-9]+$/.test(name);

function walk(dir, prefix = '') {
  return readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    return statSync(path).isDirectory() ? walk(path, `${prefix}${entry}/`) : [`${prefix}${entry}`];
  });
}

test('la configuration pointe vers ce que le build produit réellement', () => {
  assert.equal(config.outputDirectory, 'dist');
  assert.ok(existsSync('dist/index.html'));
  const script = config.buildCommand.replace(/^node\s+/, '');
  assert.ok(existsSync(script), `commande de build introuvable : ${script}`);
});

test('les URL canoniques et le réglage de barre oblique disent la même chose', () => {
  const canonical = load(readFileSync('dist/creators/index.html', 'utf8'))(
    'link[rel="canonical"]',
  ).attr('href');
  const endsWithSlash = new URL(canonical).pathname.endsWith('/');
  assert.equal(
    config.trailingSlash,
    endsWithSlash,
    'trailingSlash doit suivre la forme des canonicals, sinon chaque page redirige',
  );
});

test('les en-têtes de sécurité de Netlify sont bien repris pour Vercel', () => {
  // `dist/_headers` n'est lu que par Netlify et Cloudflare : Vercel l'ignore.
  // Sans ce test, une entrée ajoutée là disparaîtrait en silence à la mise en ligne.
  const declared = [...readFileSync('dist/_headers', 'utf8').matchAll(/^ {2}([\w-]+):/gm)].map(
    (m) => m[1],
  );
  const served = new Set(config.headers.flatMap((rule) => rule.headers.map((h) => h.key)));
  for (const key of declared)
    assert.ok(served.has(key), `${key} est déclaré dans _headers mais absent de vercel.json`);
});

test('aucun fichier au nom stable n’est mis en cache immuable', () => {
  // Le piège : /assets/ mélange les fichiers empreintés par Vite et les médias
  // au nom fixe. Un an d’immuable sur un média, et le remplacer ne changerait
  // rien pour les visiteurs déjà venus.
  const immutable = config.headers.filter((rule) =>
    rule.headers.some((h) => h.key === 'Cache-Control' && h.value.includes('immutable')),
  );
  const extensions = immutable
    .map((rule) => {
      const match = rule.source.match(/\.\(?([a-z0-9|]+)\)?$/);
      assert.ok(match, `règle immuable sans extension explicite : ${rule.source}`);
      assert.match(rule.source, /^\/assets\//, 'l’immuable ne doit viser que /assets/');
      return match[1].split('|');
    })
    .flat();

  for (const file of walk('dist/assets')) {
    const extension = file.split('.').pop();
    if (!extensions.includes(extension)) continue;
    assert.ok(
      fingerprinted(file.split('/').pop()),
      `/assets/${file} serait immuable un an alors que son nom ne change jamais`,
    );
  }
});

test('tout média livré est couvert par une règle de cache révalidable', () => {
  const revalidating = config.headers
    .filter((rule) =>
      rule.headers.some((h) => h.key === 'Cache-Control' && !h.value.includes('immutable')),
    )
    .flatMap((rule) => {
      const match = rule.source.match(/\.\(?([a-z0-9|]+)\)?$/);
      return match ? match[1].split('|') : [];
    });
  const media = walk('dist/assets').filter((f) => !fingerprinted(f.split('/').pop()));
  assert.ok(media.length > 0, 'le build doit livrer des médias au nom stable');
  for (const file of media)
    assert.ok(
      revalidating.includes(file.split('.').pop()),
      `/assets/${file} n’a aucune règle de cache : il serait servi sans consigne`,
    );
});

test('le déploiement n’expédie pas ce dont le build n’a pas besoin', () => {
  const ignored = readFileSync('.vercelignore', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  for (const heavy of ['video/', 'tools/', 'brand/', 'docs/'])
    assert.ok(ignored.includes(heavy), `${heavy} devrait rester hors du déploiement`);
  // Et ce qui est nécessaire ne doit surtout pas y être.
  for (const needed of ['src/', 'public/', 'scripts/', 'index.html', 'package.json'])
    assert.ok(!ignored.includes(needed), `${needed} est indispensable au build`);
});
