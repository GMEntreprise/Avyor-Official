#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITEMAP = join(ROOT, "public/sitemap.xml");
const BASE = "https://connectstar.app";
const writeInventory = process.argv.includes("--write-inventory");
const failures = [];
const warnings = [];

const fail = (url, rule, detail) => failures.push({ url, rule, detail });
const warn = (url, rule, detail) => warnings.push({ url, rule, detail });
const cleanText = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function elementByAttribute(html, tag, attribute, value) {
  const candidates = html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) ?? [];
  return (
    candidates.find((candidate) =>
      new RegExp(`${attribute}=["']${value}["']`, "i").test(candidate),
    ) ?? ""
  );
}

function attributeValue(element, attribute) {
  const match = element.match(new RegExp(`${attribute}="([^"]*)"|${attribute}='([^']*)'`, "i"));
  return match?.[1] ?? match?.[2] ?? "";
}

function countTopLevelSchemaTypes(value, counts = new Map()) {
  if (!value || typeof value !== "object") return counts;
  if (Array.isArray(value)) {
    value.forEach((item) => countTopLevelSchemaTypes(item, counts));
    return counts;
  }
  if (Array.isArray(value["@graph"])) {
    value["@graph"].forEach((item) => countTopLevelSchemaTypes(item, counts));
    return counts;
  }
  if (typeof value["@type"] === "string") {
    counts.set(value["@type"], (counts.get(value["@type"]) ?? 0) + 1);
  }
  return counts;
}

function topLevelSchemas(value) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(topLevelSchemas);
  if (Array.isArray(value["@graph"])) return value["@graph"].flatMap(topLevelSchemas);
  return typeof value["@type"] === "string" ? [value] : [];
}

function localPublicAssetExists(rawUrl) {
  try {
    const url = new URL(rawUrl, BASE);
    if (url.origin !== BASE) return true;
    const pathname = decodeURIComponent(url.pathname).replace(/^\//, "");
    return existsSync(join(ROOT, "public", pathname));
  } catch {
    return false;
  }
}

const sitemapXml = await readFile(SITEMAP, "utf8");
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
const sitemapLastmod = new Map(
  [
    ...sitemapXml.matchAll(
      /<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g,
    ),
  ].map((match) => [match[1].trim(), match[2].trim()]),
);
const uniqueUrls = new Set(urls);
if (uniqueUrls.size !== urls.length)
  fail("sitemap.xml", "unique URLs", `${urls.length - uniqueUrls.size} doublon(s)`);

const forbidden = [
  /\/admin(?:\/|$)/,
  /\/auth(?:\/|$)/,
  /\/lab(?:\/|$)/,
  /\/preview(?:\/|$)/,
  /[?&](?:sort|session|preview)=/,
];
for (const url of urls) {
  if (!url.startsWith(`${BASE}/`) && url !== `${BASE}/`)
    fail(url, "canonical host", "host/protocole non canonique");
  if (forbidden.some((pattern) => pattern.test(url)))
    fail(url, "private URL", "URL privée/filtrée dans le sitemap");
}

const rows = [];
const titles = new Map();
const descriptions = new Map();
const inbound = new Map(urls.map((url) => [new URL(url).pathname, 0]));
const linkGraph = new Map();
const imageReferences = new Map();
const imagesWithoutDimensions = new Set();
const internalLinkTargets = new Map();
/** Le HTML prérendu, gardé pour les contrôles qui portent sur son contenu. */
const snapshotsHtml = [];

for (const url of urls) {
  const pathname = new URL(url).pathname;
  const file =
    pathname === "/" ? join(DIST, "index.html") : join(DIST, pathname.slice(1), "index.html");
  if (!existsSync(file)) {
    fail(url, "snapshot", `absent: ${file}`);
    continue;
  }
  const html = await readFile(file, "utf8");
  snapshotsHtml.push([pathname, html]);
  linkGraph.set(pathname, new Set());
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const description = attributeValue(
    elementByAttribute(html, "meta", "name", "description"),
    "content",
  );
  const canonical = attributeValue(elementByAttribute(html, "link", "rel", "canonical"), "href");
  const robots = attributeValue(elementByAttribute(html, "meta", "name", "robots"), "content");
  const ogType = attributeValue(elementByAttribute(html, "meta", "property", "og:type"), "content");
  const ogImage = attributeValue(
    elementByAttribute(html, "meta", "property", "og:image"),
    "content",
  );
  const language = attributeValue(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang");
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) =>
    cleanText(match[1]),
  );
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"'#?]+)["']/gi)].map((match) => match[1]);
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const jsonScripts = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  const typeCounts = new Map();
  const schemas = [];
  let jsonValid = true;

  if (!title) fail(url, "title", "absent ou vide");
  if (!description || description.length < 70)
    fail(url, "description", "absente ou insuffisamment descriptive");
  if (canonical !== url) fail(url, "canonical", `attendu ${url}, reçu ${canonical || "absent"}`);
  if (/noindex/i.test(robots)) fail(url, "indexation", "URL sitemap déclarée noindex");
  if (h1s.length !== 1 || !h1s[0]) fail(url, "H1", `attendu 1 H1 non vide, reçu ${h1s.length}`);
  if (language !== "fr") fail(url, "langue HTML", `attendu fr, reçu ${language || "absent"}`);
  if (!/^https:\/\//.test(ogImage))
    fail(url, "Open Graph image", `URL absolue HTTPS attendue, reçu ${ogImage || "absent"}`);
  if (ogImage && !localPublicAssetExists(ogImage))
    fail(url, "Open Graph image", `fichier local absent: ${ogImage}`);

  for (const imageTag of imageTags) {
    const src = attributeValue(imageTag, "src");
    if (!src || src.startsWith("data:")) continue;
    const imageUrl = new URL(src, BASE);
    if (imageUrl.origin === BASE) {
      if (!imageReferences.has(imageUrl.pathname))
        imageReferences.set(imageUrl.pathname, new Set());
      imageReferences.get(imageUrl.pathname).add(url);
      const imageClass = attributeValue(imageTag, "class");
      const imageStyle = attributeValue(imageTag, "style");
      const hasHtmlDimensions = /\bwidth=["']/i.test(imageTag) && /\bheight=["']/i.test(imageTag);
      const hasUtilityDimensions =
        /(?:^|\s)w-[^\s]+/.test(imageClass) && /(?:^|\s)h-[^\s]+/.test(imageClass);
      const hasInlineDimensions =
        /(?:^|;)\s*width\s*:/.test(imageStyle) && /(?:^|;)\s*height\s*:/.test(imageStyle);
      if (!hasHtmlDimensions && !hasUtilityDimensions && !hasInlineDimensions) {
        imagesWithoutDimensions.add(imageUrl.pathname);
      }
    }
  }

  for (const script of jsonScripts) {
    try {
      const parsed = JSON.parse(script[1]);
      countTopLevelSchemaTypes(parsed, typeCounts);
      schemas.push(...topLevelSchemas(parsed));
    } catch (error) {
      jsonValid = false;
      fail(url, "JSON-LD", error instanceof Error ? error.message : "JSON invalide");
    }
  }
  for (const globalType of ["Organization", "WebSite", "MobileApplication"]) {
    if ((typeCounts.get(globalType) ?? 0) !== 1) {
      fail(url, "global schema", `${globalType}: ${typeCounts.get(globalType) ?? 0}, attendu 1`);
    }
  }

  if (pathname.startsWith("/blog/")) {
    const articles = schemas.filter((schema) =>
      ["Article", "BlogPosting"].includes(schema["@type"]),
    );
    if (ogType !== "article")
      fail(url, "article Open Graph", `og:type article attendu, reçu ${ogType || "absent"}`);
    if (articles.length !== 1) fail(url, "Article schema", `attendu 1, reçu ${articles.length}`);
    if ((html.match(/<article\b/gi) ?? []).length !== 1)
      fail(url, "article landmark", "un élément <article> est attendu");
    if (!/<time\b[^>]*datetime=["'][^"']+["']/i.test(html))
      fail(url, "article date", "élément <time datetime> absent");
    const article = articles[0];
    if (article) {
      if (cleanText(article.headline) !== h1s[0])
        fail(url, "Article headline", "headline JSON-LD différent du H1");
      if (!article.datePublished || !article.dateModified)
        fail(url, "Article dates", "datePublished/dateModified absente");
      const publishedAt = new Date(article.datePublished).getTime();
      const modifiedAt = new Date(article.dateModified).getTime();
      if (!Number.isFinite(publishedAt) || !Number.isFinite(modifiedAt))
        fail(url, "Article dates", "date invalide");
      else {
        if (publishedAt > Date.now() || modifiedAt > Date.now())
          fail(url, "Article dates", "date future interdite");
        if (modifiedAt < publishedAt)
          fail(url, "Article dates", "dateModified antérieure à datePublished");
      }
      if (
        article.dateModified &&
        sitemapLastmod.get(url) !== String(article.dateModified).slice(0, 10)
      ) {
        fail(
          url,
          "Article lastmod",
          `sitemap ${sitemapLastmod.get(url) || "absent"}, schema ${article.dateModified}`,
        );
      }
      if (Number(article.wordCount ?? 0) < 250)
        warn(url, "article depth", `${article.wordCount ?? 0} mots; vérifier l'utilité éditoriale`);
      const schemaImages = Array.isArray(article.image)
        ? article.image
        : article.image
          ? [article.image]
          : [];
      if (schemaImages.length === 0) fail(url, "Article image", "image JSON-LD absente");
      schemaImages.forEach((image) => {
        if (!/^https:\/\//.test(image))
          fail(url, "Article image", `URL absolue HTTPS attendue: ${image}`);
        else if (!localPublicAssetExists(image))
          fail(url, "Article image", `fichier local absent: ${image}`);
      });
    }
  }
  if (pathname === "/blog") {
    if ((typeCounts.get("CollectionPage") ?? 0) !== 1)
      fail(url, "blog collection schema", "CollectionPage attendu");
  }

  for (const href of hrefs) {
    try {
      const linked = new URL(href, BASE);
      if (linked.origin === BASE) {
        if (!internalLinkTargets.has(linked.pathname))
          internalLinkTargets.set(linked.pathname, new Set());
        internalLinkTargets.get(linked.pathname).add(url);
      }
      if (linked.origin === BASE && inbound.has(linked.pathname) && linked.pathname !== pathname) {
        inbound.set(linked.pathname, (inbound.get(linked.pathname) ?? 0) + 1);
        linkGraph.get(pathname).add(linked.pathname);
      }
    } catch {
      warn(url, "link", `URL illisible: ${href}`);
    }
  }

  titles.set(title, [...(titles.get(title) ?? []), url]);
  descriptions.set(description, [...(descriptions.get(description) ?? []), url]);
  rows.push({
    url,
    template: pathname.startsWith("/blog/")
      ? "article"
      : pathname.startsWith("/bible/")
        ? "bible"
        : "page",
    status: "200 snapshot",
    indexable: "INDEX",
    canonical,
    robots,
    inSitemap: "yes",
    httpStatus: "N/M production",
    depth: "N/M",
    title,
    h1: h1s.join(" | "),
    jsonLd: jsonValid ? [...typeCounts.keys()].join("|") : "INVALID",
  });
}

for (const [title, titleUrls] of titles) {
  if (title && titleUrls.length > 1)
    titleUrls.forEach((url) =>
      fail(url, "unique title", `${titleUrls.length} URL partagent « ${title} »`),
    );
}
for (const [description, descriptionUrls] of descriptions) {
  if (description && descriptionUrls.length > 1)
    descriptionUrls.forEach((url) =>
      fail(
        url,
        "unique description",
        `${descriptionUrls.length} URL partagent la même description`,
      ),
    );
}
for (const [pathname, count] of inbound) {
  if (pathname !== "/" && count === 0)
    warn(`${BASE}${pathname}`, "internal links", "aucun lien entrant depuis une autre URL sitemap");
}
const depths = new Map([["/", 0]]);
const queue = ["/"];
while (queue.length > 0) {
  const current = queue.shift();
  const nextDepth = (depths.get(current) ?? 0) + 1;
  for (const linked of linkGraph.get(current) ?? []) {
    if (!depths.has(linked)) {
      depths.set(linked, nextDepth);
      queue.push(linked);
    }
  }
}
for (const row of rows) {
  const pathname = new URL(row.url).pathname;
  const depth = depths.get(pathname);
  row.depth = depth ?? "orphan";
  if (depth === undefined)
    warn(row.url, "click depth", "URL inaccessible depuis l'accueil dans le graphe prérendu");
  else if (depth > 3) warn(row.url, "click depth", `${depth} clics depuis l'accueil`);
}
for (const [imagePath, pageUrls] of imageReferences) {
  if (!localPublicAssetExists(imagePath)) {
    fail(imagePath, "image asset", `fichier absent, référencé sur ${pageUrls.size} page(s)`);
  }
}
for (const imagePath of imagesWithoutDimensions) {
  warn(imagePath, "image dimensions", "au moins une occurrence sans attributs width/height HTML");
}

const robotsTxt = await readFile(join(ROOT, "public/robots.txt"), "utf8");
if (!robotsTxt.includes(`Sitemap: ${BASE}/sitemap.xml`))
  fail("robots.txt", "sitemap discovery", "directive Sitemap absente");
if (!/User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i.test(robotsTxt))
  fail("robots.txt", "AI search", "politique OAI-SearchBot absente");

const rssXml = await readFile(join(ROOT, "public/rss.xml"), "utf8");
const rssItems = [...rssXml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
const rssLinks = rssItems.map((item) => cleanText(item.match(/<link>([^<]+)<\/link>/)?.[1]));
const blogUrls = urls.filter((url) => new URL(url).pathname.startsWith("/blog/"));
if (rssLinks.length !== blogUrls.length)
  fail(
    "rss.xml",
    "article coverage",
    `${rssLinks.length} items pour ${blogUrls.length} articles sitemap`,
  );
for (const blogUrl of blogUrls) {
  if (!rssLinks.includes(blogUrl))
    fail("rss.xml", "article coverage", `article absent: ${blogUrl}`);
}
for (const item of rssItems) {
  const itemUrl = cleanText(item.match(/<link>([^<]+)<\/link>/)?.[1]) || "rss.xml";
  const enclosure = attributeValue(item.match(/<enclosure\b[^>]*>/i)?.[0] ?? "", "url");
  if (!enclosure || !localPublicAssetExists(enclosure))
    fail(itemUrl, "RSS enclosure", `fichier absent: ${enclosure || "URL absente"}`);
}

const redirects = await readFile(join(ROOT, "public/_redirects"), "utf8");
const redirectRows = redirects
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
const redirectMap = new Map(redirectRows.map((line) => line.split(/\s+/).slice(0, 2)));
for (const [from, to] of redirectMap) {
  if (redirectMap.get(to) === from) fail("public/_redirects", "redirect loop", `${from} ↔ ${to}`);
}
const sitemapPaths = new Set(urls.map((url) => new URL(url).pathname));
const allowedNoindexRoutes = new Set(["/lab/dot-matrix"]);
for (const [target, sourceUrls] of internalLinkTargets) {
  const isPublicFile = existsSync(
    join(ROOT, "public", decodeURIComponent(target).replace(/^\//, "")),
  );
  const isValidBibleRoute = /^\/bible\/[A-Z0-9]+\/[A-Z0-9]+(?:\/\d+(?:\/\d+)?)?$/.test(target);
  if (
    !sitemapPaths.has(target) &&
    !redirectMap.has(target) &&
    !allowedNoindexRoutes.has(target) &&
    !isPublicFile &&
    !isValidBibleRoute
  ) {
    fail(
      target,
      "internal link target",
      `hors sitemap, sans redirection ni ressource publique; lié depuis ${sourceUrls.size} page(s)`,
    );
  }
}

// ── Les commentaires BRH ne doivent JAMAIS atteindre le HTML statique ──────
//
// Le corpus des Éditions Sh'ma n'est ni indexé, ni prérendu, ni injecté dans le
// JSON-LD tant qu'une autorisation écrite n'est pas versionnée (CLAUDE.md).
// Depuis que `/bible-racines-hebraiques` et six passages BRH sont au sitemap,
// le prérendu visite des chapitres qui PORTENT cette couche : seule sa pastille
// doit apparaître, jamais le texte des notes.
{
  const corpus = join(ROOT, "public/assets/bible/commentary/brh/chapters");
  const extraits = [];
  if (existsSync(corpus)) {
    const texteDe = (entree) =>
      (entree.blocks ?? [])
        .flatMap((bloc) => (bloc.spans ?? []).map((span) => span.text ?? ""))
        .join("");
    const parcourir = (dossier) => {
      for (const entree of readdirSync(dossier)) {
        const complet = join(dossier, entree);
        if (statSync(complet).isDirectory()) {
          parcourir(complet);
          continue;
        }
        if (!entree.endsWith(".json")) continue;
        const donnees = JSON.parse(readFileSync(complet, "utf8"));
        for (const commentaire of donnees.commentaries ?? []) {
          const texte = texteDe(commentaire);
          // Une tranche prise au milieu : ni la citation du verset qui ouvre la
          // note, ni sa référence finale — du commentaire, et rien d'autre.
          if (texte.length > 90) {
            extraits.push({
              reference: `${donnees.bookId} ${donnees.chapter}`,
              texte: texte.slice(30, 90),
            });
          }
        }
      }
    };
    parcourir(corpus);
  }

  if (extraits.length === 0) {
    fail(
      "public/assets/bible/commentary/brh",
      "corpus BRH",
      "aucun commentaire lisible — le contrôle de fuite n'a rien vérifié",
    );
  } else {
    // Un échantillon réparti sur tout le corpus : le comparer en entier à chaque
    // page coûterait des minutes pour la même garantie.
    const pas = Math.max(1, Math.floor(extraits.length / 300));
    const echantillon = extraits.filter((_, index) => index % pas === 0).slice(0, 300);
    for (const extrait of echantillon) {
      for (const [fichier, contenu] of snapshotsHtml) {
        if (contenu.includes(extrait.texte)) {
          fail(
            fichier,
            "commentaire BRH prérendu",
            `${extrait.reference} — « ${extrait.texte.slice(0, 40)}… »`,
          );
          break;
        }
      }
    }
  }
}

if (writeInventory) {
  const header = [
    "url",
    "template",
    "status",
    "indexable",
    "canonical",
    "robots",
    "in_sitemap",
    "http_status",
    "depth",
    "title",
    "h1",
    "schema",
  ];
  const body = rows.map((row) =>
    [
      row.url,
      row.template,
      row.status,
      row.indexable,
      row.canonical,
      row.robots,
      row.inSitemap,
      row.httpStatus,
      row.depth,
      row.title,
      row.h1,
      row.jsonLd,
    ]
      .map(csv)
      .join(","),
  );
  await writeFile(
    join(ROOT, "docs/seo/URL_INVENTORY.csv"),
    `${header.join(",")}\n${body.join("\n")}\n`,
    "utf8",
  );
}

console.log(`[seo-audit] ${rows.length}/${urls.length} snapshots contrôlés`);
console.log(`[seo-audit] ${failures.length} échec(s), ${warnings.length} avertissement(s)`);
warnings.forEach((item) => console.warn(`WARNING ${item.rule} ${item.url}: ${item.detail}`));
failures.forEach((item) => console.error(`FAIL ${item.rule} ${item.url}: ${item.detail}`));
if (failures.length > 0) process.exit(1);
