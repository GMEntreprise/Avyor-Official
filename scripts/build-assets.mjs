import sharp from 'sharp';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const root = process.cwd(),
  out = join(root, 'public'),
  master = join(root, 'brand/masters/avyor-logo.png');
await mkdir(join(out, 'assets/screens'), { recursive: true });
await mkdir(join(out, 'assets/media'), { recursive: true });
await mkdir(join(out, 'assets/brand'), { recursive: true });
const records = [];
async function emit(name, buffer, source) {
  const file = join(out, name);
  await writeFile(file + '.tmp', buffer);
  await rename(file + '.tmp', file);
  records.push({
    file: name,
    source,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  });
}
const meta = await sharp(master).metadata();
if (meta.width < 512 || !meta.hasAlpha) throw Error('Master RGBA de résolution insuffisante');
for (const size of [16, 32, 180, 192, 512])
  await emit(
    size === 180 ? 'apple-touch-icon.png' : size < 100 ? `favicon-${size}.png` : `icon-${size}.png`,
    await sharp(master).resize(size, size, { withoutEnlargement: true }).png().toBuffer(),
    'brand/masters/avyor-logo.png',
  );
await emit(
  'assets/brand/logo.webp',
  await sharp(master)
    .resize(256, 256, { withoutEnlargement: true })
    .webp({ lossless: true })
    .toBuffer(),
  'brand/masters/avyor-logo.png',
);
await emit('assets/brand/logo.png', await readFile(master), 'brand/masters/avyor-logo.png');
// The intro mask is the first thing painted, ahead of the hero poster: it needs
// the logo's alpha at display resolution, not the full 450 kB master.
await emit(
  'assets/brand/logo-mask.webp',
  await sharp(master)
    .resize(512, 512, { withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer(),
  'brand/masters/avyor-logo.png',
);
const logo = await sharp(master).resize(320, 320, { withoutEnlargement: true }).toBuffer();
await emit(
  'icon-maskable-512.png',
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0B1020' } })
    .composite([{ input: logo, left: 96, top: 96 }])
    .png()
    .toBuffer(),
  'brand/masters/avyor-logo.png',
);
const pngs = await Promise.all(
  [16, 32, 48].map((size) => sharp(master).resize(size, size).png().toBuffer()),
);
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((p, i) => {
  const n = 6 + 16 * i;
  header[n] = [16, 32, 48][i];
  header[n + 1] = header[n];
  header.writeUInt16LE(1, n + 4);
  header.writeUInt16LE(32, n + 6);
  header.writeUInt32LE(p.length, n + 8);
  header.writeUInt32LE(offset, n + 12);
  offset += p.length;
});
await emit('favicon.ico', Buffer.concat([header, ...pngs]), 'brand/masters/avyor-logo.png');
for (const scene of [
  '02-matching',
  '03-match-detail',
  '04-feed',
  '05-campaign',
  '06-collaboration',
  '07-payment',
  '08-portfolio',
]) {
  const source = `brand/sources/screens/${scene}.png`;
  for (const width of [396, 660])
    await emit(
      `assets/screens/${scene}-${width}.webp`,
      await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 88 })
        .toBuffer(),
      source,
    );
}
for (const name of [
  'nomad-essentials',
  'morning-glow-routine',
  'pulse-fitness-launch',
  'nova-tech-motion',
]) {
  const source = `brand/sources/media/${name}.png`;
  await emit(
    `assets/media/${name}.webp`,
    await sharp(source)
      .rotate()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer(),
    source,
  );
}
// A wide composition of supplied demo media. No invented app interface.
const tiles = await Promise.all(
  ['nomad-essentials', 'morning-glow-routine', 'pulse-fitness-launch'].map((name) =>
    sharp(`brand/sources/media/${name}.png`)
      .resize(480, 900, { fit: 'cover', withoutEnlargement: true })
      .toBuffer(),
  ),
);
const poster = await sharp({
  create: { width: 1440, height: 900, channels: 3, background: '#0B1020' },
})
  .composite(tiles.map((input, i) => ({ input, left: i * 480, top: 0 })))
  .webp({ quality: 84 })
  .toBuffer();
await emit('assets/hero-poster.webp', poster, 'Avyor/store-assets/demo-media');
const screen = await sharp('brand/sources/screens/04-feed.png')
  .resize({ height: 530, withoutEnlargement: true })
  .png()
  .toBuffer();
const mark = await sharp(master).resize(100, 100).png().toBuffer();
const type = Buffer.from(
  `<svg width="1200" height="630"><style>text{font-family:Arial,sans-serif;fill:#F5F6F9}</style><text x="80" y="240" font-size="76" font-weight="700">Le bon Creator.</text><text x="80" y="328" font-size="76" font-weight="700">La bonne campagne.</text><text x="80" y="410" font-size="25" fill="#B8BFCF">Creators et marques, connectés par la création.</text><text x="182" y="118" font-size="38" font-weight="700">AVYOR</text></svg>`,
);
await emit(
  'og.png',
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0B1020' } })
    .composite([
      { input: mark, left: 72, top: 40 },
      { input: screen, left: 880, top: 50 },
      { input: type },
    ])
    .png()
    .toBuffer(),
  'Master AVYOR + vraie capture feed + texte éditorial',
);
await emit(
  'site.webmanifest',
  Buffer.from(
    JSON.stringify(
      {
        name: 'AVYOR',
        short_name: 'AVYOR',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B1020',
        theme_color: '#0B1020',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      null,
      2,
    ),
  ),
  'Configuration AVYOR',
);
await writeFile(
  'brand/manifest.json',
  JSON.stringify(
    { master: { width: meta.width, height: meta.height, alpha: meta.hasAlpha }, files: records },
    null,
    2,
  ),
);
console.log(`${records.length} assets générés, master intact.`);
