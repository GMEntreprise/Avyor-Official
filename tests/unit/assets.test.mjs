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
    assert.equal(
      createHash('sha256')
        .update(readFileSync('public/' + f.file))
        .digest('hex'),
      f.sha256,
    );
    if (f.file.includes('/screens/')) {
      const m = await sharp('public/' + f.file).metadata();
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
