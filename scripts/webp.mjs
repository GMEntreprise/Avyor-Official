#!/usr/bin/env node
/**
 * webp.mjs — conversion WebP propre, portable, sans dépendance au projet.
 *
 * Seule dépendance : sharp.   npm i -D sharp   (ou bun add -d sharp)
 * Aucun TypeScript, aucun chemin en dur : copiable tel quel dans n'importe
 * quel projet.
 *
 * À POSER DANS LE PROJET (par exemple scripts/webp.mjs) : Node résout `sharp`
 * depuis le node_modules du dossier où vit le fichier. Lancé depuis ailleurs,
 * il ne le trouvera pas.
 *
 *   node webp.mjs public                 convertit (idempotent)
 *   node webp.mjs public --check         échoue si un original n'a pas son WebP
 *   node webp.mjs public --dry-run       montre sans écrire
 *   node webp.mjs public --force         reconvertit même si à jour
 *   node webp.mjs public --delete-source supprime l'original, après conversion
 *   node webp.mjs public --quality 82 --max-edge 1800
 *
 * Règles tenues : le ratio d'origine est conservé, une image n'est jamais
 * agrandie, l'orientation EXIF est appliquée puis effacée, et l'écriture passe
 * par un fichier temporaire — une interruption ne laisse pas de WebP tronqué.
 */
import { readdir, rename, rm, stat } from 'node:fs/promises';
import { basename, extname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';

const SOURCES = new Set(['.jpg', '.jpeg', '.png', '.jfif', '.tif', '.tiff', '.avif']);
const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.output', '.cache']);

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? Number(argv[i + 1]) : fallback;
};
const dirs = argv.filter(
  (a, i) => !a.startsWith('--') && !argv[i - 1]?.match(/^--(quality|max-edge)$/),
);

const check = flag('check');
const dryRun = flag('dry-run');
const force = flag('force');
const deleteSource = flag('delete-source');
const quality = value('quality', 87);
const maxEdge = value('max-edge', 2400);

if (dirs.length === 0) {
  console.error('Usage : node webp.mjs <dossier…> [--check|--dry-run|--force|--delete-source]');
  process.exit(2);
}

/** Un nom qui voyage mal : accents, espaces, parenthèses. Ces chemins
 *  produisent des 404 selon le serveur statique ou le CDN. */
const risky = (name) => /[^\w.-]/.test(name);

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.error(`✗ dossier introuvable : ${dir}`);
    process.exitCode = 2;
    return [];
  }
  const out = await Promise.all(
    entries.map((e) => {
      const p = join(dir, e.name);
      if (e.isDirectory()) return IGNORED.has(e.name) ? [] : walk(p);
      return SOURCES.has(extname(e.name).toLowerCase()) ? [p] : [];
    }),
  );
  return out.flat();
}

const webpOf = (p) => p.replace(/\.[^.]+$/, '.webp');
/** Le plus court des deux : un dossier hors projet ne s'affiche pas en ../../.. */
const show = (p) => {
  const r = relative(process.cwd(), p);
  return r.startsWith('..') || r.length > p.length ? p : r;
};
/** Gain lisible, y compris quand la conversion fait grossir le fichier. */
const gainOf = (avant, apres) => {
  const pct = (1 - apres / avant) * 100;
  return pct >= 0 ? `-${pct.toFixed(1)}%` : `+${(-pct).toFixed(1)}% PLUS GROS`;
};
const human = (b) =>
  b < 1024
    ? `${b} B`
    : b < 1024 ** 2
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1024 ** 2).toFixed(2)} MB`;

const sources = (await Promise.all(dirs.map((d) => walk(resolve(d))))).flat();

// ---------- mode vérification : pour la CI et les hooks ----------
if (check) {
  const missing = [];
  for (const s of sources) {
    try {
      await stat(webpOf(s));
    } catch {
      missing.push(s);
    }
  }
  const names = sources.map(webpOf).filter((p) => risky(basename(p)));
  if (missing.length) {
    console.error(`✗ ${missing.length} image(s) sans WebP correspondant :`);
    for (const p of missing) console.error(`   ${show(p)}`);
  }
  for (const p of names) console.warn(`⚠ nom risqué (accents/espaces) : ${show(p)}`);
  if (!missing.length) console.log(`✓ ${sources.length} original(aux) ont leur WebP.`);
  process.exit(missing.length ? 1 : 0);
}

// ---------- mode conversion ----------
const grossis = [];
let converted = 0,
  skipped = 0,
  failed = 0,
  avant = 0,
  après = 0;

for (const source of sources) {
  const dest = webpOf(source);
  const src = await stat(source);
  const existing = await stat(dest).catch(() => null);
  const rel = show(source);

  // Déjà à jour : on ne refait pas le travail. C'est ce qui rend le script
  // sûr à lancer à chaque build.
  if (!force && existing && existing.mtimeMs >= src.mtimeMs) {
    skipped += 1;
    avant += src.size;
    après += existing.size;
    continue;
  }
  if (dryRun) {
    console.log(`○ ${rel} → ${basename(dest)}`);
    continue;
  }

  const tmp = `${dest}.${process.pid}.tmp`;
  try {
    const out = await sharp(source)
      .rotate() // applique l'orientation EXIF, puis la retire
      .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(tmp);
    await rename(tmp, dest);
    if (deleteSource && source !== dest) await rm(source);
    converted += 1;
    avant += src.size;
    après += out.size;
    if (out.size > src.size) grossis.push(rel);
    console.log(
      `✓ ${rel}  ${human(src.size)} → ${human(out.size)} (${gainOf(src.size, out.size)})`,
    );
  } catch (e) {
    await rm(tmp, { force: true });
    failed += 1;
    console.error(`✗ ${rel} : ${e.message}`);
  }
}

const risqués = sources.map(webpOf).filter((p) => risky(basename(p)));
for (const p of risqués) console.warn(`⚠ nom risqué (accents/espaces) : ${show(p)}`);

console.log(
  `\n${converted} converti(s), ${skipped} déjà à jour, ${failed} échec(s)` +
    (avant ? `  —  ${human(avant)} → ${human(après)} (${gainOf(avant, après)})` : ''),
);
if (grossis.length)
  console.warn(
    `\n⚠ ${grossis.length} fichier(s) plus lourds en WebP qu'à l'origine — souvent de très petites images ou des aplats.\n` +
      `   Le WebP est conservé (format unique), mais baissez --quality pour ceux-là si le poids compte :\n` +
      grossis.map((f) => `   ${f}`).join('\n'),
  );
if (failed) process.exitCode = 1;
