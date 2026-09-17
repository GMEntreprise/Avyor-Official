#!/usr/bin/env node
/**
 * bible-seo-audit.mjs — les pages Bible sont-elles descriptibles ?
 *
 * POURQUOI : `/bible/LSG/PSA/92` servait le titre de la PAGE D'ACCUEIL. Le
 * site est une application monopage et seules les URLs du sitemap sont
 * prérendues — soit 38 pages Bible pour 1 190 chapitres en LSG. Tout le reste
 * arrivait aux moteurs avec les balises de `index.html`.
 *
 * Search Console (12/09/2026) le montrait sans ambiguïté : `psaumes 92 louis
 * segond`, 34 impressions, position 8,21, **zéro clic**.
 *
 * Ce contrôle interroge la fonction `bible-meta` comme Netlify l'exécutera, et
 * vérifie qu'une page Bible quelconque porte bien SON titre et SA description.
 *
 * Usage : `bun run build && bun run test:bible-seo`
 */
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PORT = 4731;

if (!existsSync(join(DIST, "app-shell.html"))) {
  console.error("\n✗ dist/app-shell.html absent — lancer `bun run build` d'abord.\n");
  process.exit(1);
}

const workDir = await mkdtemp(join(tmpdir(), "connectstar-bible-seo-"));
const bundle = join(workDir, "bible-meta.mjs");

await esbuild.build({
  entryPoints: [join(ROOT, "netlify/functions/bible-meta.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: bundle,
  external: ["@netlify/functions"],
  logLevel: "silent",
});

const { handler } = await import(bundle);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const server = createServer(async (request, response) => {
  try {
    const file = join(DIST, decodeURIComponent(new URL(request.url, "http://x").pathname));
    if (!file.startsWith(DIST)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "text/plain" });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(PORT, done));

const call = (path) =>
  handler({ path, headers: { host: `localhost:${PORT}`, "x-forwarded-proto": "http" } }, {});

const titleOf = (html) => /<title>([^<]*)<\/title>/.exec(html ?? "")?.[1] ?? "";
const metaOf = (html, name, attribute = "name") =>
  new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`).exec(html ?? "")?.[1] ?? "";

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${ok ? "" : ` — ${detail}`}`);
  if (!ok) failures += 1;
};

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  AUDIT SEO DES PAGES BIBLE                                 ║");
console.log("╚════════════════════════════════════════════════════════════╝");

/** Les pages que Search Console montre vues et jamais cliquées. */
const DEMANDEES = [
  ["/bible/LSG/PSA/92", "Psaumes 92"],
  ["/bible/LSG/PSA/98", "Psaumes 98"],
  ["/bible/LSG/JHN/3/18", "Jean 3:18"],
  ["/bible/LSG/ROM/8/31", "Romains 8:31"],
  ["/bible/LSG/PRO/3/3", "Proverbes 3:3"],
  ["/bible/LSG/ISA/41/13", "Ésaïe 41:13"],
  ["/bible/LSG/2CO/12/9", "2 Corinthiens 12:9"],
];

console.log("\n■ Chaque page porte SA référence, pas celle de l'accueil");
for (const [path, reference] of DEMANDEES) {
  const response = await call(path);
  const title = titleOf(response.body);
  const ok =
    response.statusCode === 200 &&
    title.includes(reference) &&
    // Le symptôme d'origine : le titre de la page d'accueil sur une page Bible.
    !title.includes("Messagerie Chrétienne Gratuite");
  check(`${path.padEnd(26)} ${reference}`, ok, `titre = « ${title.slice(0, 54)} »`);
}

console.log("\n■ La description commence par le texte du passage");
for (const [path] of DEMANDEES.slice(0, 4)) {
  const description = metaOf((await call(path)).body, "description");
  // C'est ce que la personne est venue lire, et ce qui décide du clic.
  check(
    path.padEnd(26),
    description.length > 40 && !description.startsWith("ConnectStar est"),
    `« ${description.slice(0, 50)} »`,
  );
}

console.log("\n■ Canonical, aperçu social, application");
{
  const response = await call("/bible/LSG/PSA/92");
  check(
    "canonical propre à la page",
    (response.body ?? "").includes(
      'rel="canonical" href="https://connectstar.app/bible/LSG/PSA/92"',
    ),
  );
  check("un seul <title>", ((response.body ?? "").match(/<title>/g) ?? []).length === 1);
  check(
    "og:title porte la référence",
    metaOf(response.body, "og:title", "property").includes("Psaumes 92"),
  );
  check("og:image en JPEG", metaOf(response.body, "og:image", "property").endsWith(".jpg"));
  check(
    "les scripts du build sont conservés",
    /<script[^>]+src="\/assets\/index-/.test(response.body ?? ""),
  );
  check("la racine React reste vide", /<div id="root"><\/div>/.test(response.body ?? ""));
}

// Netlify NE POURSUIT PAS vers la règle suivante quand une fonction répond :
// sa réponse EST la réponse. La fonction doit donc trancher elle-même entre
// une page réelle et une adresse morte — un 404 sur `/bible/LSG/MRK` casserait
// 58 livres sur 66.
console.log("\n■ Pages réelles sans passage à citer → 200");
for (const path of ["/bible", "/bible/LSG/PSA", "/bible/LSG/MRK", "/bible/BRH/GEN"]) {
  const response = await call(path);
  check(`${path.padEnd(26)}`, response.statusCode === 200, response.statusCode);
}

console.log("\n■ Les 66 livres répondent ET se décrivent");
{
  const { BIBLE_BOOKS, BOOK_ORDER } = await import("../src/constants/bibleBooks.ts");
  const muets = [];
  const echecs = [];
  for (const book of BOOK_ORDER) {
    const response = await call(`/bible/LSG/${book}`);
    if (response.statusCode !== 200) {
      echecs.push(`${book}=${response.statusCode}`);
      continue;
    }
    // `/bible/LSG/LUK` — 9 impressions au 12/09/2026 — arrivait aux moteurs
    // avec le titre de l'accueil et AUCUNE description.
    const title = titleOf(response.body);
    const description = metaOf(response.body, "description");
    if (!title.includes(BIBLE_BOOKS[book].nameLong) || description.length < 60) {
      muets.push(book);
    }
  }
  check(`${BOOK_ORDER.length} pages de livre répondent`, echecs.length === 0, echecs.join(" "));
  check(`${BOOK_ORDER.length} pages de livre décrites`, muets.length === 0, muets.join(" "));
}

console.log("\n■ Un verset court reste un extrait complet");
for (const [path, reference] of [
  ["/bible/LSG/JHN/14/4", "Jean 14:4"],
  ["/bible/LSG/JHN/3/15", "Jean 3:15"],
]) {
  // « Vous savez où je vais » fait 50 caractères ; Google en affiche 155.
  const description = metaOf((await call(path)).body, "description");
  check(
    path.padEnd(26),
    description.length > 100 && description.includes(reference),
    `${description.length} car. — « ${description.slice(0, 60)} »`,
  );
}

console.log("\n■ Adresses mortes → 404");
for (const path of [
  "/bible/XXX/PSA/92",
  "/bible/LSG/JUD/9",
  "/bible/LSG/MAT/29",
  "/bible/LSG/PSA/92/1/2",
  "/bible/LSG/PSA/0",
  "/bible/LSG/INCONNU/1",
]) {
  const response = await call(path);
  check(`${path.padEnd(26)}`, response.statusCode === 404, response.statusCode);
}

// Une adresse peut être valide dans une édition et absente d'une autre : le
// nombre de chapitres et la liste des livres dépendent de la VERSION.
console.log("\n■ Ce qu'une édition ne contient pas → 404");
for (const path of [
  "/bible/BRH/PSA/23",
  "/bible/BRH/ISA/53",
  "/bible/BRH/PSA",
  "/bible/JND/MAL/4",
  "/bible/NBS/NAM/1",
]) {
  const response = await call(path);
  check(`${path.padEnd(26)}`, response.statusCode === 404, response.statusCode);
}

console.log("\n■ Ce qu'une édition contient en propre → 200");
for (const [path, reference] of [
  ["/bible/NCL/DAN/13", "Daniel 13"],
  ["/bible/NCL/EST/16", "Esther 16"],
  ["/bible/JND/JOL/4", "Joël 4"],
  ["/bible/BRH/GEN/1", "Genèse 1"],
]) {
  const response = await call(path);
  check(
    `${path.padEnd(26)}`,
    response.statusCode === 200 && titleOf(response.body).includes(reference),
    `${response.statusCode} — ${titleOf(response.body).slice(0, 46)}`,
  );
}

console.log("\n■ Le nom de l'édition n'est ni inventé ni redoublé");
for (const [path, attendu] of [
  ["/bible/NCL/JHN/3", "Sainte Bible néo-Crampon Libre"],
  ["/bible/FC/JHN/3", "Bible en français courant"],
  ["/bible/BRH/MAT/1", "Bible des Racines Hébraïques"],
]) {
  const title = titleOf((await call(path)).body);
  check(
    `${path.padEnd(26)}`,
    title.includes(attendu) && !/Bible\s+Bible/.test(title),
    `titre = « ${title.slice(0, 58)} »`,
  );
}

console.log("\n■ Toutes les versions servies");
for (const version of ["LSG", "JND", "KJV", "S21", "BRH"]) {
  const response = await call(`/bible/${version}/JHN/3`);
  check(
    `${version.padEnd(26)}`,
    response.statusCode === 200 && titleOf(response.body).includes("Jean 3"),
    titleOf(response.body).slice(0, 50),
  );
}

server.close();
await rm(workDir, { recursive: true, force: true });

console.log(
  failures
    ? `\n✗ ${failures} vérification(s) en échec\n`
    : "\n✓ Pages Bible : toutes les vérifications passent\n",
);
process.exit(failures ? 1 : 0);
