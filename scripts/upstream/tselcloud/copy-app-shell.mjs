#!/usr/bin/env node
/**
 * copy-app-shell.mjs — fige la coquille de l'application après le build.
 *
 * POURQUOI : `dist/index.html` ne reste pas la coquille vide produite par
 * Vite. Le prérendu (`scripts/prerender.mjs`) l'écrase EN DERNIER avec
 * l'accueil entièrement rendu — c'est voulu, c'est ce qui donne aux robots un
 * accueil complet sans JavaScript.
 *
 * Mais la fonction Netlify qui sert les liens partagés (`/open/...`) a besoin,
 * elle, d'une coquille NEUTRE : mêmes scripts et mêmes styles, racine React
 * vide. Servir l'accueil prérendu à sa place ferait apparaître l'accueil une
 * fraction de seconde avant que React n'affiche le contenu partagé.
 *
 * Ce script tourne en `postbuild`, donc avant le prérendu : il capture la
 * coquille au seul moment où elle est encore vierge.
 */
import { copyFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(ROOT, "dist/index.html");
const TARGET = resolve(ROOT, "dist/app-shell.html");

if (!existsSync(SOURCE)) {
  console.error("[app-shell] dist/index.html absent — build lancé ?");
  process.exit(1);
}

const html = await readFile(SOURCE, "utf8");

// Garde-fou : si la racine React n'est plus vide, c'est que ce script tourne
// APRÈS le prérendu. Figer l'accueil ici passerait inaperçu jusqu'à ce qu'un
// lien partagé affiche la page d'accueil à la place du contenu.
const root = /<div id="root">([\s\S]*?)<\/div>/i.exec(html);
if (root && root[1].trim() !== "") {
  console.error(
    "[app-shell] dist/index.html contient déjà du contenu rendu.\n" +
      "            Ce script doit tourner en postbuild, avant `prerender`.",
  );
  process.exit(1);
}

await copyFile(SOURCE, TARGET);
console.log("[app-shell] dist/app-shell.html écrit (coquille neutre).");
