#!/usr/bin/env bun
/**
 * Pack de marque TselCloud — génération reproductible.
 *
 *   bun run brand:build     écrit le pack
 *   bun run brand:check     vérifie sans rien écrire
 *
 * CE QUE CE SCRIPT NE FAIT PAS, ET C'EST VOLONTAIRE.
 *
 * **Il ne touche jamais aux masters.** Ils sont l'entrée, jamais la sortie.
 * Toute variante part d'eux, et non d'un export déjà compressé : recompresser
 * un JPEG ou un WebP avec perte pour en tirer une autre taille accumule les
 * artefacts sans que rien ne le signale.
 *
 * **Il n'agrandit rien en silence.** Le symbole mesure 751 × 615 : au-delà, il
 * n'y a pas plus de détail à produire, seulement de l'interpolation. Une taille
 * qui dépasse la résolution utile ARRÊTE la génération avec la taille en cause.
 * `allowUpscale` existe dans la configuration, et son emploi se voit.
 *
 * **Il ne vectorise pas.** Le logo est un rendu tridimensionnel : un PNG
 * encapsulé dans un SVG n'est pas un vecteur, et le présenter comme tel
 * promettrait un agrandissement illimité que ce fichier ne peut pas tenir.
 *
 * **Il n'écrase pas un pack valide par un pack partiel.** Tout est écrit dans
 * un dossier temporaire, et la publication n'a lieu qu'après succès complet.
 * Le nettoyage ne porte que sur les fichiers que ce script a produits — la
 * liste vient du manifeste précédent, jamais d'un effacement récursif.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import sharp from "sharp";

const ROOT = resolve(import.meta.dir, "..");
const CHECK = process.argv.includes("--check");

const config = JSON.parse(
  await readFile(join(ROOT, "brand/config/brand-assets.config.json"), "utf8"),
);

const failures = [];
const produced = [];

function fail(message) {
  failures.push(message);
}

/** Mesure un master, et refuse de continuer s'il manque ou n'a pas d'alpha. */
async function master(name) {
  const path = join(ROOT, config.masters[name]);
  if (!existsSync(path)) throw new Error(`Master absent : ${config.masters[name]}`);

  const meta = await sharp(path).metadata();
  if (meta.hasAlpha !== true) {
    fail(
      `${config.masters[name]} n'a pas de canal alpha : un logo sans transparence se détacherait par un rectangle.`,
    );
  }
  return { path, width: meta.width, height: meta.height };
}

const symbol = await master("symbol");
const wordmarkLight = await master("wordmarkLight");
const wordmarkDark = await master("wordmarkDark");

/**
 * Composition de la signature, relevée sur le logo validé.
 *
 * Le rapport symbole/nom et le décalage vertical du nom sont ceux du fichier
 * d'origine : les recalculer « à l'œil » changerait l'équilibre que le
 * fondateur a validé.
 */
const { gapRatio, wordmarkHeightRatio, wordmarkTopRatio } = config.signature;
const SIGNATURE = {
  width: symbol.width + Math.round(symbol.height * gapRatio) + wordmarkLight.width,
  height: Math.round(symbol.height * wordmarkTopRatio) + wordmarkLight.height,
};

/** Refuse un agrandissement : au-delà de la source, il n'y a pas de détail. */
function guard(what, asked, available) {
  if (asked <= available || config.allowUpscale === true) return;
  fail(
    `${what} : ${asked} px demandés pour ${available} px utiles. ` +
      `Agrandir n'ajoute aucun détail — corriger la taille, ou activer « allowUpscale » en connaissance de cause.`,
  );
}

const staging = join(ROOT, ".brand-staging");

/** `where` vaut "web" (dossier du pack) ou "root" (icônes servies à la racine). */
async function emit(where, relative, buffer, meta) {
  const path = join(staging, where, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buffer);

  // L'ICO est un CONTENEUR, pas une image : sharp ne le lit pas, et lui demander
  // ses dimensions n'aurait aucun sens. Il est vérifié par son propre en-tête.
  const measured =
    meta.container === true
      ? { format: "ico", width: undefined, height: undefined, hasAlpha: true }
      : await sharp(buffer).metadata();
  if (meta.width !== undefined && measured.width !== meta.width) {
    fail(`${relative} : largeur ${measured.width} au lieu de ${meta.width}`);
  }
  if (meta.height !== undefined && measured.height !== meta.height) {
    fail(`${relative} : hauteur ${measured.height} au lieu de ${meta.height}`);
  }
  if (meta.transparent === true && measured.hasAlpha !== true) {
    fail(`${relative} : transparence attendue, absente`);
  }

  produced.push({
    destination: where,
    fichier: relative,
    usage: meta.usage,
    format: measured.format,
    largeur: measured.width,
    hauteur: measured.height,
    poids: buffer.length,
    transparence: measured.hasAlpha === true,
    variante: meta.variant ?? null,
    source: meta.source,
    empreinte: createHash("sha256").update(buffer).digest("hex").slice(0, 16),
  });
}

/** La signature complète, composée à la largeur demandée. */
async function signature(width, theme) {
  const scale = width / SIGNATURE.width;
  const height = Math.round(SIGNATURE.height * scale);
  const symbolWidth = Math.round(symbol.width * scale);
  const symbolHeight = Math.round(symbol.height * scale);
  const wordmark = theme === "dark" ? wordmarkDark : wordmarkLight;
  const wordmarkWidth = Math.round(wordmark.width * scale);
  const wordmarkHeight = Math.round(wordmark.height * scale);
  const left = symbolWidth + Math.round(symbolHeight * gapRatio);
  const top = Math.round(symbolHeight * wordmarkTopRatio);

  const [symbolBuffer, wordmarkBuffer] = await Promise.all([
    sharp(symbol.path).resize(symbolWidth, symbolHeight).png().toBuffer(),
    sharp(wordmark.path).resize(wordmarkWidth, wordmarkHeight).png().toBuffer(),
  ]);

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([
    { input: symbolBuffer, left: 0, top: 0 },
    { input: wordmarkBuffer, left, top },
  ]);
}

/** Le symbole seul, carré, à la taille demandée. */
function symbolSquare(size) {
  return sharp(symbol.path).resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
}

/** Le symbole sur un fond uni, avec sa marge — pour tout usage carré opaque. */
async function plated(size, background, inset) {
  const inner = Math.round(size * inset);
  const buffer = await symbolSquare(inner).png().toBuffer();

  /*
   * APLATI : un fond opaque n'a pas à porter un canal alpha inutilisé — c'est
   * un quart de données pour rien, et iOS pose du noir là où il en trouve un.
   */
  return (
    sharp({
      create: { width: size, height: size, channels: 4, background },
    })
      .composite([{ input: buffer, gravity: "center" }])
      .flatten({ background })
      // `flatten` peint le fond mais LAISSE le canal : il faut le retirer.
      .removeAlpha()
  );
}

/** Sans perte : ces exports portent le NOM, et les lettres ne supportent pas les franges. */
const WEBP_TEXT = { lossless: true, effort: 6 };
/** Avec perte : dégradés seuls, aucune lettre. L'alpha reste intact. */
const WEBP_PHOTO = { quality: 92, alphaQuality: 100, effort: 6 };
const PNG = { compressionLevel: 9 };

const PEARL = { r: 244, g: 248, b: 255, alpha: 1 };
const NIGHT = { r: 20, g: 33, b: 58, alpha: 1 };

// ---- Signature horizontale ------------------------------------------------
for (const width of config.outputs.signatureWidths) {
  guard(`signature ${width}px`, width, SIGNATURE.width);

  for (const theme of ["light", "dark"]) {
    const base = await signature(width, theme);
    const height = Math.round((SIGNATURE.height * width) / SIGNATURE.width);
    const common = {
      width,
      height,
      transparent: true,
      usage: `Signature horizontale, fond ${theme === "dark" ? "sombre" : "clair"}`,
      variant: theme,
      source: theme === "dark" ? config.masters.wordmarkDark : config.masters.wordmarkLight,
    };

    await emit(
      "web",
      `tselcloud-logo-${theme}-${width}.png`,
      await base.clone().png(PNG).toBuffer(),
      common,
    );
    // Le nom est du TEXTE : la compression sans perte évite les franges autour
    // des lettres, qu'une compression avec perte produit à ces tailles.
    await emit(
      "web",
      `tselcloud-logo-${theme}-${width}.webp`,
      await base.clone().webp(WEBP_TEXT).toBuffer(),
      common,
    );
  }
}

// ---- Symbole seul ---------------------------------------------------------
for (const size of config.outputs.symbolSizes) {
  guard(`symbole ${size}px`, size, symbol.height);

  const meta = {
    width: size,
    height: size,
    transparent: true,
    usage: "Symbole seul",
    source: config.masters.symbol,
  };
  await emit(
    "web",
    `tselcloud-symbol-${size}.png`,
    await symbolSquare(size).png(PNG).toBuffer(),
    meta,
  );
  /*
   * AVEC PERTE ICI, SANS PERTE POUR LA SIGNATURE, et la raison est le TEXTE.
   *
   * Le symbole est un rendu en dégradés : à qualité 92, comparé au sans-perte
   * à 512 px, l'écart n'est pas visible — 30 Ko contre 110. La signature, elle,
   * porte le nom : une compression avec perte y sème des franges autour des
   * lettres, et c'est précisément ce qu'on regarde.
   */
  await emit(
    "web",
    `tselcloud-symbol-${size}.webp`,
    await symbolSquare(size).webp(WEBP_PHOTO).toBuffer(),
    meta,
  );
}

// ---- Avatars et Open Graph ------------------------------------------------
for (const size of config.outputs.avatars) {
  guard(`avatar ${size}px`, Math.round(size * 0.72), symbol.width);
  const avatar = await plated(size, PEARL, 0.72);
  const meta = {
    width: size,
    height: size,
    usage: "Avatar carré, fond clair",
    variant: "light",
    source: config.masters.symbol,
  };

  await emit(
    "web",
    `tselcloud-avatar-light-${size}.png`,
    await avatar.clone().png(PNG).toBuffer(),
    meta,
  );
  await emit(
    "web",
    `tselcloud-avatar-light-${size}.webp`,
    await avatar.clone().webp(WEBP_PHOTO).toBuffer(),
    meta,
  );
}

{
  const { width, height, logoWidth } = config.outputs.openGraph;
  guard("Open Graph", logoWidth, SIGNATURE.width);

  for (const [theme, background] of [
    ["light", PEARL],
    ["dark", NIGHT],
  ]) {
    const logo = await (await signature(logoWidth, theme)).png().toBuffer();
    const canvas = sharp({ create: { width, height, channels: 4, background } })
      .composite([{ input: logo, gravity: "center" }])
      .flatten({ background })
      .removeAlpha();

    await emit("web", `tselcloud-og-${theme}.png`, await canvas.png().toBuffer(), {
      width,
      height,
      usage: "Partage social — aucune promesse, aucun chiffre, le logo seul",
      variant: theme,
      source: config.masters.symbol,
    });
  }
}

// ---- Marques de tiers -----------------------------------------------------
/*
 * ELLES NE SONT NI REDESSINÉES, NI DÉTOURÉES, NI RECOLORÉES. Une marque
 * appartient à son éditeur : on la réduit, on l'encode, et c'est tout.
 *
 * Celle de ConnectStar est OPAQUE — l'œuvre porte son propre fond bleu. Elle
 * s'emploie donc comme une tuile, avec ses angles arrondis par la mise en page,
 * et non comme un symbole posé sur nos surfaces. Lui inventer une transparence
 * reviendrait à la modifier.
 */
for (const partner of config.partners ?? []) {
  const path = join(ROOT, partner.source);
  if (!existsSync(path)) throw new Error(`Marque partenaire absente : ${partner.source}`);

  const meta = await sharp(path).metadata();

  for (const size of partner.sizes) {
    guard(`${partner.name} ${size}px`, size, Math.min(meta.width, meta.height));

    const square = sharp(path).resize(size, size, { fit: "cover" });
    const common = {
      width: size,
      height: size,
      usage: `Marque ${partner.name} — reprise telle quelle`,
      source: partner.source,
    };

    await emit(
      "web",
      `${partner.id}-logo-${size}.png`,
      await square.clone().png(PNG).toBuffer(),
      common,
    );
    await emit(
      "web",
      `${partner.id}-logo-${size}.webp`,
      await square.clone().webp(WEBP_PHOTO).toBuffer(),
      common,
    );
  }
}

// ---- Favicons et icônes d'application -------------------------------------
const icoParts = [];
for (const size of config.outputs.favicons) {
  const buffer = await symbolSquare(size).png().toBuffer();
  icoParts.push({ size, buffer });

  if (size !== 48) {
    await emit("root", `favicon-${size}.png`, buffer, {
      width: size,
      height: size,
      transparent: true,
      usage: "Favicon PNG",
      source: config.masters.symbol,
    });
  }
}

/**
 * ICO assemblé à la main.
 *
 * Le format est un simple conteneur : un en-tête, une entrée par image, puis
 * les images elles-mêmes. Les PNG y sont acceptés depuis vingt ans. Ajouter une
 * dépendance pour écrire quarante octets d'en-tête coûterait plus cher que de
 * les écrire.
 *
 * Le fichier servi jusqu'ici était un PNG de 256 px renommé « .ico » : les
 * navigateurs le tolèrent, les outils qui lisent l'en-tête, non.
 */
function buildIco(parts) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(parts.length, 4);

  let offset = 6 + parts.length * 16;
  const entries = [];
  for (const { size, buffer } of parts) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...parts.map((part) => part.buffer)]);
}

/**
 * Relit l'ICO produit comme le ferait un outil tiers.
 *
 * « Le fichier existe » n'est pas « le fichier est valide » : celui qui était
 * servi jusqu'ici existait, pesait 20 Ko, et n'était pas un ICO du tout.
 */
function verifyIco(buffer, expected) {
  if (buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    fail("favicon.ico : en-tête ICO invalide");
    return;
  }

  const count = buffer.readUInt16LE(4);
  if (count !== expected.length) {
    fail(`favicon.ico : ${count} image(s) déclarée(s) pour ${expected.length} attendue(s)`);
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const entry = 6 + index * 16;
    const declared = buffer.readUInt8(entry) === 0 ? 256 : buffer.readUInt8(entry);
    const length = buffer.readUInt32LE(entry + 8);
    const offset = buffer.readUInt32LE(entry + 12);

    if (declared !== expected[index]) {
      fail(`favicon.ico : image ${index} déclarée à ${declared} px au lieu de ${expected[index]}`);
    }
    if (offset + length > buffer.length) {
      fail(`favicon.ico : image ${index} déborde du fichier`);
    }
    // Chaque charge utile doit être un PNG : c'est ce que déclare l'en-tête.
    if (buffer.readUInt32BE(offset) !== 0x89504e47) {
      fail(`favicon.ico : image ${index} n'est pas un PNG`);
    }
  }
}

{
  const ico = buildIco(icoParts);
  verifyIco(ico, config.outputs.favicons);

  await emit("root", "favicon.ico", ico, {
    container: true,
    usage: `Favicon ICO — ${config.outputs.favicons.join(", ")} px`,
    source: config.masters.symbol,
  });
}

await emit(
  "root",
  "apple-touch-icon.png",
  await (await plated(config.outputs.appleTouch, PEARL, 0.74)).png().toBuffer(),
  {
    width: config.outputs.appleTouch,
    height: config.outputs.appleTouch,
    usage: "Icône iOS — fond opaque, iOS ne gère pas la transparence ici",
    variant: "light",
    source: config.masters.symbol,
  },
);

for (const size of config.outputs.appIcons) {
  await emit(
    "root",
    `app-icon-${size}.png`,
    await (await plated(size, PEARL, 0.74)).png(PNG).toBuffer(),
    {
      width: size,
      height: size,
      usage: "Icône d'application",
      variant: "light",
      source: config.masters.symbol,
    },
  );
}

/*
 * Version « maskable » : le fond couvre tout le carré, et l'essentiel tient
 * dans la zone sûre — un disque de 80 % centré. Les systèmes rognent les
 * angles, et un symbole à pleine largeur y perdrait ses bords.
 */
await emit(
  "root",
  `app-icon-maskable-${config.outputs.maskable}.png`,
  await (await plated(config.outputs.maskable, PEARL, 0.56)).png(PNG).toBuffer(),
  {
    width: config.outputs.maskable,
    height: config.outputs.maskable,
    usage: "Icône maskable — essentiel dans la zone sûre de 80 %",
    variant: "light",
    source: config.masters.symbol,
  },
);

// ---- Publication ----------------------------------------------------------
if (failures.length > 0) {
  await rm(staging, { recursive: true, force: true });
  console.error("\nPack NON généré :\n");
  for (const message of failures) console.error(`  ✗ ${message}`);
  process.exit(1);
}

const manifest = {
  genere: new Date().toISOString().slice(0, 10),
  source: "brand/source/tselcloud-logo-source.png",
  note: "« light » = destiné à un fond CLAIR. « dark » = destiné à un fond SOMBRE.",
  signature: { largeurMaximaleUtile: SIGNATURE.width, hauteurMaximaleUtile: SIGNATURE.height },
  symbole: { largeurMaximaleUtile: symbol.width, hauteurMaximaleUtile: symbol.height },
  fichiers: [...produced].sort((a, b) => a.fichier.localeCompare(b.fichier)),
};

if (CHECK) {
  await rm(staging, { recursive: true, force: true });
  console.log(
    `Vérification : ${produced.length} fichiers produisibles, aucun agrandissement, aucune dimension fausse.`,
  );
  process.exit(0);
}

// Les fichiers du pack précédent sont retirés par leur NOM, lu dans l'ancien
// manifeste. Un effacement récursif du dossier de sortie emporterait ce qu'un
// autre outil y aurait déposé.
const manifestPath = join(ROOT, config.manifest);
const destination = { web: join(ROOT, config.outDir), root: join(ROOT, config.rootIcons) };

if (existsSync(manifestPath)) {
  const previous = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const item of previous.fichiers ?? []) {
    const folder = destination[item.destination];
    if (folder === undefined) continue;
    await rm(join(folder, item.fichier), { force: true });
  }
}

for (const [where, folder] of Object.entries(destination)) {
  const from = join(staging, where);
  if (!existsSync(from)) continue;
  await mkdir(folder, { recursive: true });
  for (const name of await readdir(from)) {
    await rename(join(from, name), join(folder, name));
  }
}
await rm(staging, { recursive: true, force: true });

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const total = produced.reduce((sum, item) => sum + item.poids, 0);
console.log(`Pack de marque : ${produced.length} fichiers, ${Math.round(total / 1024)} Ko.`);
console.log(`Manifeste : ${config.manifest}`);
