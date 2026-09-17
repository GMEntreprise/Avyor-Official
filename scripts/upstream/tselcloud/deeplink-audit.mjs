#!/usr/bin/env node
/**
 * deeplink-audit.mjs — vérifie les liens partagés `/open/...` de bout en bout.
 *
 * POURQUOI un script à part : les tests Vitest couvrent les fonctions pures
 * (lecture d'adresse, composition du HTML). Ils ne peuvent pas répondre à la
 * seule question qui compte en production — « ce que la fonction Netlify
 * renvoie réellement porte-t-il les bonnes balises ? » — parce qu'elle met en
 * jeu le vrai `dist/`, la vraie coquille, les vraies données bibliques.
 *
 * Ce script bundle la fonction comme Netlify le fait (esbuild), sert `dist/`
 * en local, et l'interroge. Il attrape ce qu'aucun test unitaire ne voit :
 * une coquille absente, un `og:title` en double, un magasin proposé au
 * mauvais appareil, un jeton de contact qui fuite dans le contenu.
 *
 * Usage : `bun run build && bun run test:deeplinks`
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
const PORT = 4519;

if (!existsSync(join(DIST, "app-shell.html"))) {
  console.error(
    "\n✗ dist/app-shell.html absent.\n" +
      "  Lancer `bun run build` d'abord (le postbuild fige la coquille).\n",
  );
  process.exit(1);
}

// ── Bundle de la fonction, comme Netlify ────────────────────────────────
const workDir = await mkdtemp(join(tmpdir(), "connectstar-deeplink-"));
const bundle = join(workDir, "open-link.mjs");

await esbuild.build({
  entryPoints: [join(ROOT, "netlify/functions/open-link.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: bundle,
  external: ["@netlify/functions"],
  logLevel: "silent",
});

const { handler } = await import(bundle);

// ── `dist/` servi en local, pour les données bibliques ──────────────────
const server = createServer(async (req, res) => {
  try {
    const file = join(DIST, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": extname(file) === ".json" ? "application/json" : "text/plain",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(PORT, done));

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120.0.0.0 Mobile";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0";

const call = (path, userAgent = IPHONE) =>
  handler(
    {
      path,
      headers: {
        host: `localhost:${PORT}`,
        "x-forwarded-proto": "http",
        "user-agent": userAgent,
      },
    },
    {},
  );

const meta = (html, property) =>
  new RegExp(`<meta property="${property}" content="([^"]*)"`).exec(html)?.[1] ?? null;

/**
 * Ce qu'un visiteur SANS JavaScript voit. Le reste du document porte le
 * JSON-LD global du site, qui cite les deux magasins : chercher un magasin
 * dans tout le HTML testerait la coquille, pas la fonction.
 */
const noscriptOf = (html) => /<noscript>([\s\S]*?)<\/noscript>/.exec(html)?.[1] ?? "";

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${ok ? "" : ` — ${detail}`}`);
  if (!ok) failures += 1;
};

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  AUDIT DES LIENS PARTAGÉS  /open/...                       ║");
console.log("╚════════════════════════════════════════════════════════════╝");

console.log("\n■ Un verset partagé");
{
  const response = await call("/open/bible/LSG/matthieu/6/33");
  check("statut 200", response.statusCode === 200, response.statusCode);
  check(
    "og:title porte la référence",
    meta(response.body, "og:title")?.startsWith("Matthieu 6:33"),
  );
  check(
    "og:description cite le VRAI verset servi",
    (meta(response.body, "og:description") ?? "").includes("Cherchez premièrement le royaume"),
  );
  check(
    "og:url absolu, canonique, sans www",
    meta(response.body, "og:url") === "https://connectstar.app/open/bible/LSG/matthieu/6/33",
  );
  const image = meta(response.body, "og:image") ?? "";
  check(
    "og:image absolu, https, format lisible par les aperçus",
    image.startsWith("https://connectstar.app/") && /\.(jpg|png)$/.test(image),
    image,
  );
  check("un seul og:title", (response.body.match(/property="og:title"/g) ?? []).length === 1);
  check("un seul <title>", (response.body.match(/<title>/g) ?? []).length === 1);
  check("noindex", response.body.includes('name="robots" content="noindex, nofollow"'));
  check("charge utile déposée pour React", /<script id="open-payload"/.test(response.body));
  check("scripts du build conservés", /<script[^>]+src="\/assets\/index-/.test(response.body));
  check(
    "racine React vide — l'accueil ne clignote pas",
    /<div id="root"><\/div>/.test(response.body),
  );
  check("lisible sans JavaScript", noscriptOf(response.body).includes("Matthieu 6:33"));
}

console.log("\n■ Une plage de versets, et sa forme canonique");
{
  const range = await call("/open/bible/LSG/psaumes/23/1-6");
  check("statut 200", range.statusCode === 200, range.statusCode);
  check("la description couvre la plage", (meta(range.body, "og:description") ?? "").length > 80);

  const single = await call("/open/bible/LSG/psaumes/23/1-1");
  check("plage d'un seul verset → 301", single.statusCode === 301, single.statusCode);
  check(
    "vers la forme courte",
    single.headers.Location === "/open/bible/LSG/psaumes/23/1",
    single.headers.Location,
  );
}

console.log("\n■ Le magasin de l'appareil DU VISITEUR");
{
  const onIphone = await call("/open/journey/roots", IPHONE);
  check(
    "iPhone : App Store",
    noscriptOf(onIphone.body).includes("apps.apple.com/app/id6753124006"),
  );
  check("iPhone : pas de Google Play", !noscriptOf(onIphone.body).includes("play.google.com"));

  const onAndroid = await call("/open/journey/roots", ANDROID);
  check("Android : Google Play", noscriptOf(onAndroid.body).includes("play.google.com"));
  check("Android : pas d'App Store", !noscriptOf(onAndroid.body).includes("apps.apple.com"));

  const onDesktop = await call("/open/journey/roots", DESKTOP);
  const visible = noscriptOf(onDesktop.body);
  check(
    "Ordinateur : les deux, on ne devine pas",
    visible.includes("apps.apple.com") && visible.includes("play.google.com"),
  );

  check(
    "aucun titre inventé pour un contenu que le site n'a pas",
    !(meta(onIphone.body, "og:title") ?? "").includes("roots") &&
      !(meta(onIphone.body, "og:description") ?? "").includes("roots"),
  );
}

console.log("\n■ Une carte de contact");
{
  const token = "a1b2c3d4e5f6".repeat(4);
  const response = await call(`/open/contact/${token}`);
  check("statut 200", response.statusCode === 200, response.statusCode);
  check("aucun jeton dans le contenu affiché", !noscriptOf(response.body).includes(token));
  check(
    "aucun profil annoncé",
    !/(nom|photo|prénom|téléphone)/i.test(noscriptOf(response.body).replace(/<[^>]+>/g, " ")),
  );
  check(
    "le jeton reste confiné à l'adresse",
    response.body
      .split("\n")
      .filter((line) => line.includes(token))
      .every((line) => /canonical|og:url|open-payload/.test(line)),
  );
  check(
    "jamais mis en cache par un intermédiaire",
    response.headers["Cache-Control"] === "private, no-store",
    response.headers["Cache-Control"],
  );
}

console.log("\n■ Les adresses que l'application ne construit pas");
for (const [path, label] of [
  ["/open/passion/", "identifiant vide"],
  ["/open/inconnu/1", "type inconnu"],
  ["/open/bible/LSG/jude/9", "chapitre hors du livre"],
  ["/open/bible/LSG/matthiew/6", "livre inconnu"],
  ["/open/contact/abc", "jeton mal formé"],
]) {
  const response = await call(path);
  check(`${label} → 404`, response.statusCode === 404, response.statusCode);
}

console.log("\n■ Les onze routes de l'application répondent");
for (const path of [
  "/open",
  "/open/security",
  "/open/bible/LSG/matthieu/6",
  "/open/bible/LSG/matthieu/6/33",
  "/open/bible/LSG/psaumes/23/1-6",
  "/open/passion/42",
  "/open/journey/roots",
  "/open/soaking/melodie-01",
  "/open/prayer-chain/abc",
  "/open/intercession/grp-1",
  `/open/contact/${"f".repeat(48)}`,
]) {
  const response = await call(path);
  const hasTitle = (meta(response.body, "og:title") ?? "").length > 0;
  check(`${path}`, response.statusCode === 200 && hasTitle, response.statusCode);
}

console.log("\n■ Interdits");
{
  const response = await call("/open/bible/LSG/matthieu/6/33");
  check("aucun schéma personnalisé dans la page", !response.body.includes("connectstar://"));
  check("aucune adresse www", !response.body.includes("www.connectstar.app"));
}

server.close();
await rm(workDir, { recursive: true, force: true });

console.log(
  failures
    ? `\n✗ ${failures} vérification(s) en échec\n`
    : "\n✓ Liens partagés : toutes les vérifications passent\n",
);
process.exit(failures ? 1 : 0);
