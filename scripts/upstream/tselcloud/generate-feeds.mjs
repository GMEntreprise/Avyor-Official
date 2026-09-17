#!/usr/bin/env node
/**
 * generate-feeds.mjs
 * -------------------------------------------------------------------------
 * Régénère, à partir de la source unique `src/data/blog.ts` :
 *   1. Le bloc <!-- BLOG:START --> ... <!-- BLOG:END --> de public/sitemap.xml
 *   2. Le flux RSS complet public/rss.xml
 *   3. Le bloc <!-- ARTICLES:START --> ... <!-- ARTICLES:END --> de
 *      public/llms.txt (les moteurs IA découvrent les articles sans crawler)
 *
 * Sûr par conception : ne touche QUE les blocs balisés (le reste — pages
 * statiques, Bible, SEO, guidance IA — est préservé tel quel). Idempotent.
 *
 * Exécuté avec Bun afin d'importer directement la source TypeScript.
 * Lancé par `bun run generate:feeds`, par `prebuild` (bloquant) et par
 * l'automatisation du blog après ajout d'un article.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE_URL = "https://connectstar.app";

const SITEMAP_PATH = resolve(ROOT, "public/sitemap.xml");
const RSS_PATH = resolve(ROOT, "public/rss.xml");
const LLMS_PATH = resolve(ROOT, "public/llms.txt");

const escapeXml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Priority heuristic: featured & recent posts rank slightly higher. */
function priorityFor(post, isMostRecent) {
  if (isMostRecent) return "0.85";
  if (post.featured) return "0.8";
  return "0.75";
}

async function loadPosts() {
  const mod = await import(new URL("../src/data/blog.ts", import.meta.url).href);
  return mod.BLOG_POSTS;
}

function buildSitemapBlock(posts) {
  const lines = ["  <!-- BLOG:START -->"];
  posts.forEach((post, i) => {
    const lastmod = (post.dateModified || post.datePublished).slice(0, 10);
    lines.push(
      "  <url>",
      `    <loc>${BASE_URL}/blog/${post.slug}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      "    <changefreq>monthly</changefreq>",
      `    <priority>${priorityFor(post, i === 0)}</priority>`,
      "  </url>",
    );
  });
  lines.push("  <!-- BLOG:END -->");
  return lines.join("\n");
}

function buildRss(posts) {
  const latestTimestamp = posts.reduce((latest, post) => {
    const timestamp = new Date(post.dateModified || post.datePublished).getTime();
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest;
  }, 0);
  const lastContentUpdate = new Date(latestTimestamp).toUTCString();
  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.datePublished).toUTCString();
      const categories = (post.tags || [])
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>contact.connectstar@gmail.com (${escapeXml(post.author)})</author>
      <description>${escapeXml(post.description)}</description>
${categories}
      <enclosure url="${BASE_URL}${post.image}" type="image/webp" />
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog ConnectStar — Foi, sécurité &amp; communauté chrétienne</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Articles sur la vie chrétienne connectée, la vie privée, la sécurité et les fonctionnalités de ConnectStar — la messagerie chrétienne qui protège vos données.</description>
    <language>fr-FR</language>
    <lastBuildDate>${lastContentUpdate}</lastBuildDate>
    <ttl>1440</ttl>
    <image>
      <url>${BASE_URL}/assets/official-connectstar.png</url>
      <title>ConnectStar</title>
      <link>${BASE_URL}/blog</link>
    </image>
${items}
  </channel>
</rss>
`;
}

async function updateSitemap(posts) {
  const xml = await readFile(SITEMAP_PATH, "utf8");
  const block = buildSitemapBlock(posts);
  const re = /[ \t]*<!-- BLOG:START -->[\s\S]*?<!-- BLOG:END -->/;
  if (!re.test(xml)) {
    throw new Error(
      "Marqueurs <!-- BLOG:START --> / <!-- BLOG:END --> introuvables dans public/sitemap.xml",
    );
  }
  await writeFile(SITEMAP_PATH, xml.replace(re, block), "utf8");
}

/** Liste des articles pour llms.txt : URL + date + résumé, un par ligne. */
async function updateLlmsTxt(posts) {
  const txt = await readFile(LLMS_PATH, "utf8");
  const re = /<!-- ARTICLES:START -->[\s\S]*?<!-- ARTICLES:END -->/;
  if (!re.test(txt)) {
    throw new Error(
      "Marqueurs <!-- ARTICLES:START --> / <!-- ARTICLES:END --> introuvables dans public/llms.txt",
    );
  }
  const lines = posts.map((post) => {
    const date = (post.dateModified || post.datePublished).slice(0, 10);
    return `- [${date}] ${post.title} — ${post.description}\n  ${BASE_URL}/blog/${post.slug}`;
  });
  const block = `<!-- ARTICLES:START -->\n${lines.join("\n")}\n<!-- ARTICLES:END -->`;
  await writeFile(LLMS_PATH, txt.replace(re, block), "utf8");
}

async function main() {
  const posts = await loadPosts();
  await updateSitemap(posts);
  await writeFile(RSS_PATH, buildRss(posts), "utf8");
  await updateLlmsTxt(posts);
  console.log(`✅ Feeds régénérés — ${posts.length} articles (sitemap.xml + rss.xml + llms.txt)`);
}

main().catch((err) => {
  console.error("❌ generate-feeds:", err.message);
  process.exit(1);
});
