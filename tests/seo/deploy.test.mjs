import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

test('un média au nom stable est revérifié à chaque chargement', () => {
  // Vercel applique ces en-têtes à toutes les réponses d’une adresse, erreurs
  // comprises. Avec un max-age positif, une 404 passagère reste figée dans le
  // navigateur : c’est ce qui a gardé le logo introuvable une fois le fichier
  // revenu. Un fichier empreinté ne court pas ce risque, son adresse n’étant
  // jamais réutilisée.
  const maxAge = (value) => Number((value.match(/max-age=(\d+)/) ?? [])[1] ?? NaN);
  const byExtension = new Map();
  for (const rule of config.headers) {
    const match = rule.source.match(/\.\(?([a-z0-9|]+)\)?$/);
    const header = rule.headers.find((h) => h.key === 'Cache-Control');
    if (match && header) for (const ext of match[1].split('|')) byExtension.set(ext, header.value);
  }
  const media = walk('dist/assets').filter((f) => !fingerprinted(f.split('/').pop()));
  assert.ok(media.length > 0, 'le build doit livrer des médias au nom stable');
  for (const file of media) {
    const value = byExtension.get(file.split('.').pop());
    assert.ok(value, `/assets/${file} n’a aucune règle de cache`);
    assert.equal(
      maxAge(value),
      0,
      `/assets/${file} : « ${value} » figerait une erreur passagère dans le navigateur`,
    );
    assert.doesNotMatch(value, /immutable/);
  }
});

/**
 * Files matched by .vercelignore, decided by git's own gitignore engine — the
 * same syntax Vercel applies. Comparing pattern strings is not enough: a bare
 * « brand/ » also matches public/assets/brand/, and that is how the logo was
 * never served while a string-based check still passed.
 */
const excludedBy = (paths) =>
  execFileSync(
    'git',
    [
      'ls-files',
      '--cached',
      '--others',
      '--ignored',
      '--exclude-from=.vercelignore',
      '--',
      ...paths,
    ],
    // tools/ alone lists ~19 000 files: well past the default 1 MB buffer.
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
    .split('\n')
    .filter(Boolean);

test('aucun fichier nécessaire au build n’est écarté du déploiement', () => {
  const inputs = [
    'public',
    'src',
    'scripts',
    'index.html',
    'package.json',
    'bun.lock',
    'tsconfig.json',
    'vite.config.ts',
    'vercel.json',
  ];
  assert.deepEqual(
    excludedBy(inputs),
    [],
    'ces fichiers seraient absents sur Vercel alors que le build en a besoin',
  );
});

test('chaque fichier servi par une page existe bien dans ce qui est déployé', () => {
  // Du point de vue du visiteur : tout ce qu’une page charge depuis /assets/
  // doit provenir d’un fichier que .vercelignore laisse passer.
  const referenced = new Set();
  for (const page of [
    'dist/index.html',
    ...readdirSync('dist')
      .filter((d) => existsSync(`dist/${d}/index.html`))
      .map((d) => `dist/${d}/index.html`),
  ]) {
    const html = readFileSync(page, 'utf8');
    for (const [, path] of html.matchAll(/(?:src|href|srcset|content)="(\/assets\/[^"\s,]+)/g))
      if (existsSync(`public${path}`)) referenced.add(`public${path}`);
  }
  assert.ok(referenced.size > 5, 'les pages doivent référencer des médias publics');
  const lost = excludedBy([...referenced]);
  assert.deepEqual(lost, [], `servi par une page mais écarté du déploiement : ${lost.join(', ')}`);
});

test('les dossiers lourds restent hors du déploiement', () => {
  for (const heavy of ['video', 'tools', 'brand', 'docs', 'SEO_BOOSTER'])
    assert.ok(excludedBy([heavy]).length > 0, `${heavy}/ devrait rester hors du déploiement`);
});

test('chaque motif d’exclusion est ancré à la racine', () => {
  // Un motif non ancré vise ce nom à toutes les profondeurs.
  const patterns = readFileSync('.vercelignore', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  for (const pattern of patterns)
    assert.ok(
      pattern.startsWith('/'),
      `« ${pattern} » n’est pas ancré : il viserait aussi des sous-dossiers`,
    );
});

test('les redirections françaises mènent à une vraie page et n’en masquent aucune', () => {
  const redirects = config.redirects ?? [];
  assert.ok(redirects.length > 0);
  const sources = redirects.map((r) => r.source);
  assert.equal(new Set(sources).size, sources.length, 'source de redirection en double');
  for (const { source, destination, permanent } of redirects) {
    assert.equal(
      permanent,
      true,
      `${source} doit être permanente pour transmettre le référencement`,
    );
    assert.match(source, /^\/[a-z0-9-]+\/$/, `${source} : forme attendue /mot/`);
    // Une redirection posée sur une vraie page la rendrait inaccessible.
    assert.ok(!existsSync(`dist${source}index.html`), `${source} masquerait une page existante`);
    assert.ok(
      existsSync(`dist${destination}index.html`),
      `${source} → ${destination} : destination absente`,
    );
    assert.ok(destination.endsWith('/'), `${destination} doit suivre la forme des canonicals`);
  }
});
