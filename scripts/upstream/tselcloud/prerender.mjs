#!/usr/bin/env node
/**
 * prerender.mjs — prérendu statique post-build des URLs du sitemap.
 * -------------------------------------------------------------------------
 * POURQUOI : le site est une SPA (React) servie via le fallback
 * `/* → /index.html`. Google exécute le JS, mais GPTBot, ClaudeBot,
 * PerplexityBot et en partie Bingbot NE L'EXÉCUTENT PAS : sans prérendu,
 * toutes les URLs leur servent le même shell vide avec les meta de la home.
 *
 * CE QUE FAIT CE SCRIPT :
 *   1. sert `dist/` en local (fallback SPA identique à la prod) ;
 *   2. ouvre chaque URL du sitemap dans Chrome headless (puppeteer),
 *      en émulant `prefers-reduced-motion` (pas d'intro 7 s, pas de posters,
 *      états d'animation finaux) et en bloquant Google Analytics
 *      (sinon chaque build enverrait ~65 fausses pageviews) ;
 *   3. nettoie le DOM : overlay d'intro retiré, meta statiques d'index.html
 *      dédoublonnées quand react-helmet (`data-rh`) fournit la version page ;
 *   4. écrit `dist/<route>/index.html` — Netlify sert le fichier statique
 *      avant le fallback SPA (redirect 200 non forcé), et React reprend la
 *      main au chargement (les <script> du build restent dans la page).
 *
 * Sûr par conception : ne touche que `dist/` (jamais `public/`), la home
 * (`dist/index.html`, aussi fallback des routes inconnues) est écrite en
 * DERNIER, et tout échec laisse simplement la SPA telle quelle.
 *
 * Usage : `bun run prerender` (après `bun run build`).
 * Netlify : `bun run build && bun run prerender` (best-effort, voir netlify.toml).
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SITEMAP = resolve(ROOT, "public/sitemap.xml");
const BASE = "https://connectstar.app";
const PORT = 4517;
const CONCURRENCY = 4;
const PAGE_TIMEOUT_MS = 30_000;

/** Domaines analytics à bloquer pendant le prérendu (pas de fausses pageviews). */
const BLOCKED_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "analytics.google.com",
  "doubleclick.net",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".glb": "model/gltf-binary",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/** Serveur statique minimal avec fallback SPA — équivalent local du `_redirects` prod. */
function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      let filePath = join(DIST, decodeURIComponent(url.pathname));
      if (!filePath.startsWith(DIST)) {
        res.writeHead(403).end();
        return;
      }
      if (!existsSync(filePath) || extname(filePath) === "") {
        filePath = join(DIST, "index.html"); // fallback SPA
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(PORT, () => ok(server)));
}

/** Routes à prérendre = les <loc> du sitemap (source unique, déjà maintenue). */
async function loadRoutes() {
  const xml = await readFile(SITEMAP, "utf8");
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim().replace(BASE, "") || "/")
    .filter((r) => r.startsWith("/"));
  return [...new Set(routes)];
}

/**
 * Chrome headless : réutilise l'install en cache, la télécharge sinon.
 * Flags anti-throttling INDISPENSABLES : react-helmet-async flush les meta
 * via requestAnimationFrame, et Chrome gèle rAF dans les onglets en
 * arrière-plan — avec plusieurs onglets concurrents, les pages snapshotées
 * en arrière-plan garderaient les meta statiques d'index.html.
 */
const LAUNCH_OPTS = {
  headless: true,
  args: [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
  ],
};

async function launchBrowser(puppeteer) {
  try {
    return await puppeteer.launch(LAUNCH_OPTS);
  } catch {
    console.log("[prerender] Chrome absent → installation (une fois, mise en cache)…");
    execSync("bunx puppeteer browsers install chrome", { stdio: "inherit", cwd: ROOT });
    return await puppeteer.launch(LAUNCH_OPTS);
  }
}

async function snapshot(page, route) {
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  // Toutes les URL canoniques du sitemap représentent aujourd'hui la version
  // française. Le navigateur headless ne doit donc pas choisir l'anglais de
  // son environnement et produire un corps EN sous des meta/canonicals FR.
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("i18nextLng", "fr");
    } catch {}
  });
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const host = new URL(req.url()).hostname;
    if (BLOCKED_HOSTS.some((h) => host.endsWith(h))) req.abort();
    else req.continue();
  });

  await page.goto(`http://localhost:${PORT}${route}`, {
    waitUntil: "networkidle2",
    timeout: PAGE_TIMEOUT_MS,
  });
  // Contenu réellement monté (Suspense résolu) — pas seulement le shell.
  await page.waitForFunction(
    () => (document.querySelector("#main-content")?.children.length ?? 0) > 0,
    { timeout: PAGE_TIMEOUT_MS },
  );
  // Meta réellement flushées : react-helmet-async écrit ses tags (data-rh)
  // via requestAnimationFrame — attendre leur présence, pas juste le DOM.
  await page.waitForFunction(() => document.head.querySelectorAll("[data-rh]").length > 0, {
    timeout: PAGE_TIMEOUT_MS,
  });
  // Laisse les derniers rendus asynchrones se poser.
  await new Promise((ok) => setTimeout(ok, 400));

  return page.evaluate(() => {
    // 1. Overlay d'intro : décoratif, inutile dans le HTML statique.
    document.querySelector("[data-intro-overlay]")?.remove();

    // 2. Déduplication : quand react-helmet (data-rh) a émis la version page
    //    d'un tag, retirer le doublon statique d'index.html (sinon les
    //    crawlers voient deux title/canonical/og:* contradictoires).
    const dedupe = (selector) => {
      const managed = document.head.querySelectorAll(`${selector}[data-rh]`);
      if (managed.length === 0) return;
      document.head.querySelectorAll(`${selector}:not([data-rh])`).forEach((el) => el.remove());
    };
    dedupe("title");
    dedupe('meta[name="description"]');
    dedupe('meta[name="keywords"]');
    dedupe('meta[name="robots"]');
    dedupe('link[rel="canonical"]');
    for (const p of [
      "og:site_name",
      "og:type",
      "og:title",
      "og:description",
      "og:url",
      "og:locale",
      "og:locale:alternate",
      "og:image",
      "og:image:secure_url",
      "og:image:type",
      "og:image:width",
      "og:image:height",
      "og:image:alt",
    ]) {
      dedupe(`meta[property="${p}"]`);
    }
    for (const n of [
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:image:alt",
    ]) {
      dedupe(`meta[name="${n}"]`);
    }

    return "<!doctype html>\n" + document.documentElement.outerHTML;
  });
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("[prerender] dist/index.html introuvable — lancer `bun run build` d'abord.");
    process.exit(1);
  }
  const { default: puppeteer } = await import("puppeteer");
  const routes = await loadRoutes();
  console.log(`[prerender] ${routes.length} URLs (sitemap) → snapshots statiques…`);

  const server = await serveDist();
  const browser = await launchBrowser(puppeteer);
  const failed = [];
  let homeHtml = null; // écrite en dernier (elle sert aussi de fallback SPA)
  let done = 0;

  const queue = [...routes];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length > 0) {
        const route = queue.shift();
        const page = await browser.newPage();
        try {
          const html = await snapshot(page, route);
          if (route === "/") {
            homeHtml = html;
          } else {
            const dir = join(DIST, route.replace(/^\//, ""));
            await mkdir(dir, { recursive: true });
            await writeFile(join(dir, "index.html"), html, "utf8");
          }
          done += 1;
          if (done % 10 === 0) console.log(`[prerender] ${done}/${routes.length}…`);
        } catch (err) {
          failed.push(route);
          console.warn(`[prerender] ÉCHEC ${route} : ${err.message}`);
          // Diagnostic : où en était la page (contenu monté ? meta flushées ?).
          try {
            const st = await page.evaluate(() => ({
              main: document.querySelector("#main-content")?.children.length ?? -1,
              rh: document.head.querySelectorAll("[data-rh]").length,
              ready: document.readyState,
            }));
            console.warn(`[prerender] état ${route} : ${JSON.stringify(st)}`);
          } catch {}
        } finally {
          await page.close().catch(() => {});
        }
      }
    }),
  );

  await browser.close();
  server.close();

  if (homeHtml) await writeFile(join(DIST, "index.html"), homeHtml, "utf8");

  if (failed.length > 0) {
    console.warn(`[prerender] terminé avec ${failed.length} échec(s) : ${failed.join(", ")}`);
    console.warn(
      "[prerender] les routes en échec restent servies en SPA (fallback) — pas bloquant.",
    );
  } else {
    console.log(`[prerender] ✓ ${done} pages prérendues dans dist/.`);
  }
}

main().catch((err) => {
  console.error("[prerender] erreur fatale :", err);
  process.exit(1);
});
