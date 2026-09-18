import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
test('le master AVYOR est conservé byte pour byte', () => {
  assert.deepEqual(
    readFileSync('brand/masters/avyor-logo.png'),
    readFileSync('public/assets/brand/logo.png'),
  );
});
test('le pack possède les dimensions requises et un vrai ICO multirésolution', async () => {
  for (const [f, size] of [
    ['favicon-16.png', 16],
    ['favicon-32.png', 32],
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['icon-maskable-512.png', 512],
  ]) {
    const m = await sharp('public/' + f).metadata();
    assert.equal(m.width, size);
    assert.equal(m.height, size);
  }
  const ico = readFileSync('public/favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
});
test('les exports respectent les hashes du manifeste et les captures gardent leur ratio', async () => {
  const manifest = JSON.parse(readFileSync('brand/manifest.json'));
  assert.ok(manifest.files.length >= 25);
  for (const f of manifest.files) {
    // Images imported by components live in src/ so Vite fingerprints them.
    const path = `${f.root ?? 'public'}/${f.file}`;
    assert.equal(
      createHash('sha256').update(readFileSync(path)).digest('hex'),
      f.sha256,
      `${path} ne correspond plus au manifeste`,
    );
    if (f.file.includes('/screens/')) {
      const m = await sharp(path).metadata();
      assert.ok(Math.abs(m.width / m.height - 1320 / 2868) < 0.001);
      assert.ok(m.width <= 1320);
    }
  }
});
test('le partage social est en 1200 × 630', async () => {
  const m = await sharp('public/og.png').metadata();
  assert.equal(m.width, 1200);
  assert.equal(m.height, 630);
});

test('le logo passe par Vite : un fichier manquant casse le build, pas la production', async () => {
  // Désigné par une adresse brute vers public/, le logo a pu manquer en
  // production sans que rien ne le signale. Importé, il est empreinté par
  // Vite : son absence fait échouer la construction, et une nouvelle version
  // reçoit une nouvelle adresse qu'aucun navigateur n'a en cache.
  const { readdirSync } = await import('node:fs');
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  for (const file of walk('src').filter((f) => /\.(tsx?|css)$/.test(f)))
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      // Une adresse absolue, entre guillemets. L'import relatif « ../assets/ »
      // est au contraire la forme attendue.
      /["'`]\/assets\/brand\//,
      `${file} désigne un logo par son adresse au lieu de l’importer`,
    );
  // Et l'ancienne copie publique ne doit pas revenir en doublon.
  for (const name of ['logo.webp', 'logo-mask.webp'])
    assert.equal(
      (await import('node:fs')).existsSync(`public/assets/brand/${name}`),
      false,
      `public/assets/brand/${name} ferait doublon avec la version importée`,
    );
});
