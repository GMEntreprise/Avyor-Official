#!/usr/bin/env node
/**
 * generate.mjs — l'image de couverture de chaque article.
 *
 * POURQUOI : les treize articles du blog partageaient la MÊME image générique.
 * Rien ne distinguait une vignette d'une autre, et `og:image` par article était
 * désactivé faute de fichiers (cf. `docs/actualites-refonte/IMAGE-PROMPTS.md`).
 *
 * Les couvertures éditoriales sélectionnées dans blog-covers.json sont
 * protégées et vérifiées ici. Les autres sont dessinées en SVG et rendues
 * par Chrome. Aucun appel de génération d'images pendant le build.
 *
 * Trois formats par article, chacun pour un usage réel :
 *
 *   hero  1600×900  WebP   en-tête de l'article
 *   card   800×600  WebP   vignette des listes
 *   og    1200×630  JPEG   aperçus sociaux — JAMAIS WebP : WhatsApp et
 *                          iMessage ne le rendent pas (cf. docs/DEEPLINKS.md)
 *
 * CHROME N'EST OUVERT QUE S'IL Y A QUELQUE CHOSE À DESSINER. Les images sont
 * versionnées : en conditions normales, ce script n'a rien à produire. Il
 * ouvrait pourtant Chrome à chaque build — et le 12/09/2026 il a cassé le
 * déploiement Netlify, dont le cache ne contenait pas la version de Chrome
 * attendue par `puppeteer@25.3.0` :
 *
 *     Error: Could not find Chrome (ver. 150.0.7871.24)
 *
 * Quand il y a réellement une image à produire, Chrome est installé à la
 * demande — le même repli que `scripts/prerender.mjs`.
 *
 * Usage :
 *   bun run blog:images            régénère ce qui manque
 *   bun run blog:images --force    régénère les motifs, jamais les illustrations sélectionnées
 */
import { execSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";

import { MOTIFS } from "./motifs.mjs";
import { pageFor } from "./template.mjs";
import editorialCovers from "../../src/data/blog-covers.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = path.join(ROOT, "public/assets/blog");
const BLOG_SOURCE = path.join(ROOT, "src/data/blog.ts");

const FORCE = process.argv.includes("--force");

const LAUNCH_OPTS = {
  headless: "new",
  args: ["--no-sandbox", "--force-color-profile=srgb"],
};

/**
 * Chrome, installé à la demande.
 *
 * Même repli que `scripts/prerender.mjs` : le cache de build peut ne pas
 * contenir la version que `puppeteer` attend, et un `bun install` servi depuis
 * ce cache ne déclenche pas le téléchargement.
 */
async function launchBrowser() {
  try {
    return await puppeteer.launch(LAUNCH_OPTS);
  } catch {
    console.log("[blog:images] Chrome absent → installation (une fois, mise en cache)…");
    execSync("bunx puppeteer browsers install chrome", { stdio: "inherit", cwd: ROOT });
    return await puppeteer.launch(LAUNCH_OPTS);
  }
}

/** Les trois formats, et ce à quoi ils servent. */
const FORMATS = [
  { name: "hero", width: 1600, height: 900, type: "webp", quality: 84 },
  { name: "card", width: 800, height: 600, type: "webp", quality: 84 },
  // L'aperçu social reste en JPEG, lisible par tous les générateurs.
  { name: "og", width: 1200, height: 630, type: "jpeg", quality: 88 },
];

/**
 * Articles publiés, lus dans la source.
 *
 * Lecture textuelle plutôt qu'import : `blog.ts` tire des données générées et
 * des types, et ce script doit pouvoir tourner sans construire le projet.
 */
async function readPosts() {
  const source = await readFile(BLOG_SOURCE, "utf8");
  const pattern = /slug:\s*"([^"]+)"[\s\S]{0,600}?category:\s*"([^"]+)"/g;
  const posts = [];
  let match;
  while ((match = pattern.exec(source)) !== null) {
    posts.push({ slug: match[1], category: match[2] });
  }
  return posts;
}

async function main() {
  const posts = await readPosts();
  if (posts.length === 0) {
    console.error("[blog:images] aucun article trouvé dans src/data/blog.ts");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  // ── Décider AVANT d'ouvrir Chrome ────────────────────────────────────────
  //
  // Les images sont versionnées : en conditions normales il n'y a rien à
  // dessiner. Ouvrir un navigateur pour ne rien faire coûtait une minute de
  // build et, surtout, cassait le déploiement quand le cache ne contenait pas
  // la bonne version de Chrome.
  let skipped = 0;
  const withoutMotif = [];
  const aDessiner = [];

  for (const post of posts) {
    // Les illustrations sélectionnées sont exportées à part. On ne les
    // remplace JAMAIS par un motif, même avec `--force` ; un fichier manquant
    // doit faire échouer le build explicitement.
    if (editorialCovers[post.slug]) {
      for (const format of FORMATS) {
        const extension = format.type === "jpeg" ? "jpg" : format.type;
        const file = path.join(
          OUT_DIR,
          editorialCovers[post.slug].collection,
          `${post.slug}-${format.name}.${extension}`,
        );
        if (!existsSync(file)) throw new Error(`Missing editorial cover: ${file}`);
        skipped += 1;
      }
      continue;
    }
    if (!MOTIFS[post.slug]) withoutMotif.push(post);

    for (const format of FORMATS) {
      const extension = format.type === "jpeg" ? "jpg" : format.type;
      const file = path.join(OUT_DIR, `${post.slug}-${format.name}.${extension}`);

      if (!FORCE && existsSync(file)) {
        skipped += 1;
        continue;
      }
      aDessiner.push({ post, format, file });
    }
  }

  let written = 0;

  if (aDessiner.length > 0) {
    const browser = await launchBrowser();
    try {
      const page = await browser.newPage();

      for (const { post, format, file } of aDessiner) {
        await page.setViewport({
          width: format.width,
          height: format.height,
          // Le rendu est vectoriel : inutile de doubler la définition, le
          // trait reste net et le fichier reste léger.
          deviceScaleFactor: 1,
        });
        await page.setContent(pageFor(post.slug, post.category, format.width, format.height), {
          waitUntil: "load",
        });

        const buffer = await page.screenshot({
          type: format.type,
          quality: format.quality,
        });
        await writeFile(file, buffer);
        written += 1;
      }
    } finally {
      await browser.close();
    }
  }

  console.log(
    `[blog:images] ${posts.length} articles — ${written} image(s) écrite(s)` +
      (skipped ? `, ${skipped} déjà présente(s)` : "") +
      (aDessiner.length === 0 ? " — Chrome non lancé" : ""),
  );

  if (withoutMotif.length) {
    // Ces articles ont une image, mais celle de leur catégorie : signalé, pas
    // bloquant. Un article publié par l'automatisation ne doit pas attendre
    // qu'un motif lui soit dessiné pour exister.
    console.log(`[blog:images] ${withoutMotif.length} article(s) sur un motif de catégorie :`);
    for (const post of withoutMotif) console.log(`    ${post.slug} (${post.category})`);
  }
}

await main();
