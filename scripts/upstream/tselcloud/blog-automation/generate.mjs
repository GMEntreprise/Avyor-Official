#!/usr/bin/env node
/**
 * generate.mjs — génération automatique d'un article de blog ConnectStar.
 * -------------------------------------------------------------------------
 * Pioche le prochain sujet non publié dans topics.json, génère un article
 * complet avec un LLM Claude (clé via variable d'environnement), applique les
 * garde-fous qualité, puis :
 *   - en mode normal : ajoute l'article à src/data/generated/posts.json,
 *     journalise, et régénère sitemap + RSS ;
 *   - en mode --dry-run : écrit seulement un brouillon dans ./drafts/ sans
 *     rien publier (utilisé pour les tests et la CI de validation).
 *
 * Mode de publication recommandé : la GitHub Action exécute ce script en mode
 * normal sur une BRANCHE et ouvre une Pull Request — la fusion (1 clic) publie.
 * Le garde-fou théologique/factuel (quality-gates) est NON négociable : un
 * article qui échoue n'est jamais écrit dans posts.json.
 *
 * Variables d'environnement :
 *   ANTHROPIC_API_KEY   (requis)  — clé API Claude. Jamais en dur.
 *   BLOG_LLM_MODEL      (option)  — modèle (défaut: claude-opus-4-8).
 *
 * Usage :
 *   bun scripts/blog-automation/generate.mjs            # génère + publie (local/branche)
 *   bun scripts/blog-automation/generate.mjs --dry-run  # brouillon seul, ne publie rien
 *   bun scripts/blog-automation/generate.mjs --topic=<id>
 *
 * Requiert Bun et le paquet @anthropic-ai/sdk (devDependency).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { runQualityGates } from "./quality-gates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

const TOPICS_PATH = resolve(__dirname, "topics.json");
const LOG_PATH = resolve(__dirname, "published-log.json");
const DRAFTS_DIR = resolve(__dirname, "drafts");
const POSTS_PATH = resolve(ROOT, "src/data/generated/posts.json");
const FEEDS_SCRIPT = resolve(ROOT, "scripts/generate-feeds.mjs");
const BLOG_TS = new URL("../../src/data/blog.ts", import.meta.url).href;

const MODEL = process.env.BLOG_LLM_MODEL || "claude-opus-4-8";
const AUTHOR = "Équipe ConnectStar";
const AUTHOR_ROLE = "Rédaction";
const DEFAULT_COVER = "/assets/connectstar-social.webp";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const forcedTopic = args.find((a) => a.startsWith("--topic="))?.split("=")[1];

const readJson = async (p) => JSON.parse(await readFile(p, "utf8"));
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ── Article JSON schema (structured output) ───────────────────────────── */
const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description:
        "Titre (H1) SOUS 60 caractères, contenant le mot-clé principal, PAS en fin de phrase, sans superlatif sensationnaliste.",
    },
    slug: {
      type: "string",
      description:
        "Slug kebab-case minuscule, sans accent, court (sans mots vides le/la/de), dérivé du titre + mot-clé principal.",
    },
    description: {
      type: "string",
      description:
        "Meta description SEO de 150 à 160 caractères, contenant le mot-clé principal + un bénéfice concret + une incitation au clic.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "4 à 7 tags pertinents. Le PREMIER tag doit être le mot-clé principal tel quel.",
    },
    readingTime: {
      type: "integer",
      description: "Temps de lecture estimé en minutes (4–9), ~200 mots/minute.",
    },
    imageAlt: {
      type: "string",
      description:
        "Texte alternatif de l'image de couverture, contenant naturellement le mot-clé principal.",
    },
    content: {
      type: "string",
      description:
        "Corps de l'article en Markdown (## titres, **gras**, listes -, liens [ancre](/blog/slug)). Respecte la structure du pilier ET sa longueur : AU MINIMUM 1000 mots (viser la fourchette haute du pilier), sinon l'article est rejeté.",
    },
  },
  required: ["title", "slug", "description", "tags", "readingTime", "imageAlt", "content"],
};

/* ── PROMPT MASTER (voix de marque, envoyé en system à CHAQUE génération) ── */
const SYSTEM_PROMPT = `Tu es le rédacteur en chef du blog ConnectStar. Tu écris comme quelqu'un qui a vécu la foi, pas comme un assistant qui documente une fonctionnalité.

QUI TU ES
- Tu t'adresses à un chrétien francophone fatigué, distrait, parfois seul dans sa foi, qui a besoin qu'on lui rappelle que Dieu est proche — pas qu'on lui vende une app.
- Le produit (ConnectStar) est toujours SECOND. La vérité biblique, l'émotion et l'utilité concrète passent en premier. L'app arrive comme une réponse naturelle, jamais comme un pitch plaqué.

CE QU'EST CONNECTSTAR (n'invente aucune autre fonctionnalité)
Application chrétienne de messagerie et de communauté centrée sur la VIE PRIVÉE et la PROTECTION (chiffrement de bout en bout, aucune revente de données, aucune publicité). Fonctionnalités : messagerie privée et groupes ; Bible intégrée (plus de 60 versions YouVersion, en ligne et hors ligne) ; Passion du Jour (dévotion : verset, mot hébreu/grec cliquable, question de cœur, prière, streak, journal) ; chaînes de prière/intercession ; Cartes Verset (partage d'un verset en image) ; Parcours de Lecture ; « Soaking & Présence » (audio d'adoration : Parole du jour, ambiances par intention, écoute écran verrouillé). Gratuite. Fondée par Édouard Georges-Michel.

VOIX DE MARQUE — règles strictes
- Phrases courtes, jamais plus de 20-22 mots d'affilée.
- Commence TOUJOURS par une scène, une tension, une question vécue — jamais par une définition ou un contexte générique.
- Chaque section apporte du concret (une action, une prière, un exercice), pas juste de l'inspiration vague.
- Une citation biblique par section MAXIMUM, en **gras**, avec référence exacte ET version entre parenthèses (Louis Segond de préférence). N'invente JAMAIS une citation.
- Jésus doit être nommé (pas seulement « Dieu ») au moins 2 fois : le positionnement est christocentrique.
- Quand c'est pertinent, explique un mot hébreu ou grec avec son sens physique concret (ex : « batach » = s'appuyer de tout son poids) — c'est un signal de légitimité biblique réelle.

INTERDICTIONS ABSOLUES (ces tics sentent l'IA à 10 km — bannis-les)
- « dans le monde d'aujourd'hui / dans notre société actuelle / à l'ère du numérique »
- « il est important de noter / il convient de souligner / force est de constater »
- « en conclusion / pour conclure / en somme / en définitive »
- « que vous soyez X ou Y » (fausse inclusivité creuse)
- « un voyage » pour parler de la vie spirituelle
- « de plus / par ailleurs / en effet » utilisés plus de 2 fois comme béquilles de transition
- toute phrase copiable-collable sur n'importe quel autre blog chrétien sans rien changer
- les tirets cadratins (—) comme béquille de rythme à chaque phrase : un ou deux dans TOUT l'article, pas plus
- les listes creuses (« Simplicité. Rapidité. Efficacité. ») sans développement
- toute fausse promesse technique : « 100% sécurisé », « impossible à pirater », « sécurité absolue », « confidentialité totale garantie »

FORMAT MARKDOWN
- ## pour les sous-titres (H2), **gras** pour l'emphase et les versets, listes avec « - » ou « 1. ».
- Liens internes : format Markdown [ancre descriptive](/blog/slug) — jamais « cliquez ici ».
- Pas de tableau SAUF si le pilier « Comparatif » le demande explicitement. Pas de blockquote « > ». Pas de titre H1 (le titre est fourni à part).

Tu réponds UNIQUEMENT avec l'objet JSON demandé (title, slug, description, tags, readingTime, imageAlt, content). Aucun préambule, pas de \`\`\`json.`;

/* ── Structures éditoriales par PILIER ─────────────────────────────────── */
const PILLAR_BLOCKS = {
  foi_concrete: `PILIER : Foi concrète (longueur : 1200–1600 mots).
Structure (H2) :
1. Ouverture par une scène vécue et concrète (3-5 phrases) liée à ce que tapent les gens qui cherchent « {KW} ». Termine sur une tension non résolue.
2. Un H2 qui pose la VRAIE question spirituelle derrière la requête (pas « Que dit la Bible sur X » platement).
3. Un H2 avec 1 verset d'ancrage + un mot hébreu/grec clé (sens littéral, physique) + comment ça change concrètement la posture du lecteur aujourd'hui.
4. Un H2 « action concrète » : un exercice précis, faisable en moins de 10 minutes, avant la fin de la journée.
5. Un H2 qui relie ce besoin à une fonctionnalité ConnectStar existante (Passion du Jour / Soaking & Présence / Parcours de Lecture / chaîne de prière) comme un outil pour VIVRE ce qui vient d'être dit, pas comme une pub.
6. Clôture courte (3-4 phrases), sans « en conclusion », une dernière image ou un verset qui reste en tête.`,
  fonctionnalite: `PILIER : Fonctionnalité — {FEATURE} (longueur : 700–1000 mots).
Structure (H2) :
1. Ouverture par le PROBLÈME concret vécu AVANT cette fonctionnalité (pas « voici la fonctionnalité X »).
2. « Pourquoi on l'a construite » : une vraie raison humaine ou biblique, pas un argumentaire marketing.
3. « Comment ça marche, concrètement » : étapes numérotées, précises, utilisables tout de suite.
4. Un H2 reliant la fonctionnalité à un verset ou principe biblique cohérent.
5. « Ce que ça change pour toi » : bénéfices en langage utilisateur.
6. Clôture avec un appel à l'action relié PRÉCISÉMENT à cette fonctionnalité.`,
  comparatif: `PILIER : Comparatif vs {COMPETITOR} (longueur : 1200–1600 mots).
Règles : reste factuel et vérifiable (propriété, modèle économique, fonctionnalités). N'invente aucun chiffre ni accusation. Reste respectueux du concurrent — l'argument gagnant, c'est la mission et la conception, pas l'attaque.
Structure (H2) :
1. Ouverture : pourquoi quelqu'un qui utilise {COMPETITOR} pour sa communauté chrétienne se pose cette question.
2. Le(s) point(s) de friction réel(s) : un H2 par friction majeure (2-3 H2 : modèle économique, confidentialité, absence de fonctions spirituelles).
3. Un TABLEAU Markdown comparatif clair (colonnes : {COMPETITOR} | ConnectStar).
4. « Comment migrer concrètement » : étapes simples, temps estimé réaliste.
5. Clôture qui ramène à la mission (communauté protégée, centrée sur la foi), pas à un argument commercial.`,
  securite: `PILIER : Sécurité / Confiance — {SUJET} (longueur : 1000–1400 mots).
Structure (H2) :
1. Ouverture : pourquoi ce sujet compte pour quelqu'un qui partage des prières intimes — pas pour un développeur.
2. Explication vulgarisée mais précise (ne jamais mentir ni simplifier au point d'être faux) : un H2 par mécanisme.
3. « Ce que tu ne verras jamais » : ce qui est bloqué en coulisses, pour rendre la sécurité tangible.
4. Un H2 reliant ça à un principe biblique de protection / berger / confiance.
5. Clôture sobre, sans grandiloquence commerciale.`,
  communaute: `PILIER : Communauté (longueur : 1000–1400 mots).
Structure (H2) :
1. Ouverture par une situation communautaire vécue (distance, isolement, diaspora, groupe dispersé).
2. Le besoin spirituel réel derrière ce besoin pratique (varie l'ancre biblique, ne répète pas Matthieu 18:20).
3. Comment ConnectStar rend ça possible concrètement (chaînes de prière, groupes, partage de versets).
4. Un exemple d'usage concret, pas à pas.
5. Clôture qui invite à créer ou rejoindre une communauté maintenant.`,
};

function buildPrompt(topic, internalLinks) {
  const pillar = topic.pillar || "foi_concrete";
  const block = (PILLAR_BLOCKS[pillar] || PILLAR_BLOCKS.foi_concrete)
    .replaceAll("{KW}", topic.keyword_principal || topic.title)
    .replaceAll("{FEATURE}", topic.feature || "la fonctionnalité concernée")
    .replaceAll("{COMPETITOR}", topic.competitor || "l'application concurrente")
    .replaceAll("{SUJET}", topic.sujet || topic.title);

  const secondaires = (topic.keywords_secondaires || []).join(", ");
  const traine = (topic.longue_traine || []).join(" · ");
  const linkList = internalLinks.map((l) => `- [${l.title}](/blog/${l.slug})`).join("\n");

  return `Rédige UN article de blog complet en français.

MOT-CLÉ PRINCIPAL (intention de recherche à capter) : « ${topic.keyword_principal || topic.title} »
MOTS-CLÉS SECONDAIRES (à semer naturellement) : ${secondaires}
VARIANTES LONGUE TRAÎNE (inspiration pour le vocabulaire réel des gens) : ${traine}
ANGLE ÉDITORIAL : ${topic.angle}

${block}

CONTRAINTES SEO NON NÉGOCIABLES
- LONGUEUR IMPÉRATIVE : respecte la fourchette de mots du pilier ci-dessus. Un article de MOINS DE 1000 mots est automatiquement REJETÉ et non publié — développe chaque section (exemple concret, nuance, application vécue), sans jamais délayer ni répéter. Vise la fourchette HAUTE du pilier.
- Le mot-clé principal apparaît dans le PREMIER paragraphe (100 premiers mots), naturellement.
- Au moins 2 titres H2 contiennent une variante du mot-clé principal ou secondaire (ex. « prière », « prier », « sécheresse »… selon le sujet).
- Densité du mot-clé principal + variantes entre 1% et 3%. Ne répète jamais le mot-clé identique plus de 4 fois : utilise des synonymes et reformulations.
- Insère 1 à 2 liens internes Markdown vers des articles existants pertinents, avec une ancre descriptive. Choisis parmi :
${linkList}
- Termine par un appel à l'action naturel relié au thème (télécharger l'app ou utiliser une fonctionnalité précise), jamais générique.

Réponds UNIQUEMENT avec l'objet JSON demandé (title, slug, description, tags, readingTime, imageAlt, content).`;
}

async function callLLM(topic, internalLinks) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY manquant. Définissez-le via variable d'environnement (jamais en dur).",
    );
  }
  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    throw new Error(
      "Paquet @anthropic-ai/sdk introuvable. Installez-le : bun add -d @anthropic-ai/sdk",
    );
  }
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: ARTICLE_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(topic, internalLinks) }],
  });
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new Error("Réponse LLM vide.");
  return JSON.parse(text);
}

/** Charge les articles existants (slug + titre + catégorie) pour le maillage interne. */
async function loadExistingPosts() {
  try {
    const mod = await import(BLOG_TS);
    return mod.BLOG_POSTS.map((p) => ({ slug: p.slug, title: p.title, category: p.category }));
  } catch (e) {
    console.warn("⚠️  Impossible de charger blog.ts pour le maillage interne:", e.message);
    return [];
  }
}

/** Sélectionne jusqu'à 6 articles pertinents à proposer pour le maillage interne (même catégorie d'abord). */
function pickInternalLinks(posts, topic, max = 6) {
  const sameCat = posts.filter((p) => p.category === topic.category);
  const others = posts.filter((p) => p.category !== topic.category);
  return [...sameCat, ...others].slice(0, max);
}

function assemblePost(generated, topic) {
  const date = todayISO();
  return {
    slug: generated.slug,
    title: generated.title,
    description: generated.description,
    category: topic.category,
    tags: generated.tags,
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    datePublished: date,
    dateModified: date,
    readingTime: Math.min(9, Math.max(4, Number(generated.readingTime) || 6)),
    // Couverture existante et vérifiée. Une image propre à l'article peut la
    // remplacer dans la PR uniquement après ajout du fichier correspondant.
    image: DEFAULT_COVER,
    imageAlt: generated.imageAlt,
    featured: false,
    content: `\n${generated.content.trim()}\n`,
  };
}

async function writeDraft(post, gate, topic) {
  await mkdir(DRAFTS_DIR, { recursive: true });
  const base = resolve(DRAFTS_DIR, post.slug || `draft-${Date.now()}`);
  await writeFile(
    `${base}.json`,
    JSON.stringify({ topicId: topic.id, gate, post }, null, 2),
    "utf8",
  );
  await writeFile(
    `${base}.md`,
    `# ${post.title}\n\n> ${post.description}\n\n_Sujet: ${topic.id} · Catégorie: ${post.category} · ${gate.words} mots_\n\n${post.content}`,
    "utf8",
  );
  return `${base}.json`;
}

async function appendToLog(entry) {
  const log = await readJson(LOG_PATH);
  log.entries.push(entry);
  await writeFile(LOG_PATH, JSON.stringify(log, null, 2) + "\n", "utf8");
}

async function publishPost(post) {
  const posts = await readJson(POSTS_PATH);
  posts.push(post);
  await writeFile(POSTS_PATH, JSON.stringify(posts, null, 2) + "\n", "utf8");
  // Régénère sitemap + RSS à partir de la source unique blog.ts.
  execFileSync("bun", [FEEDS_SCRIPT], { stdio: "inherit" });
}

async function main() {
  const { topics } = await readJson(TOPICS_PATH);
  const log = await readJson(LOG_PATH);
  const publishedTopicIds = new Set(
    log.entries.filter((e) => e.status === "published").map((e) => e.topicId),
  );

  const topic = forcedTopic
    ? topics.find((t) => t.id === forcedTopic)
    : topics.find((t) => !publishedTopicIds.has(t.id));

  if (!topic) {
    console.error(
      forcedTopic
        ? `❌ Sujet introuvable : ${forcedTopic}`
        : "✅ Tous les sujets de la banque ont été publiés. Ajoutez-en dans topics.json.",
    );
    process.exit(forcedTopic ? 1 : 0);
  }

  console.log(
    `📝 Sujet sélectionné : ${topic.id} — « ${topic.title} » (pilier: ${topic.pillar || "foi_concrete"})`,
  );
  console.log(`🤖 Modèle : ${MODEL}${DRY_RUN ? " · mode DRY-RUN (aucune publication)" : ""}`);

  const existingPosts = await loadExistingPosts();
  const internalLinks = pickInternalLinks(existingPosts, topic);
  const existingSlugs = new Set(existingPosts.map((p) => p.slug));

  const generated = await callLLM(topic, internalLinks);
  const post = assemblePost(generated, topic);

  const gate = runQualityGates(post, {
    existingSlugs,
    publishedTopicIds,
    topicId: topic.id,
    keyword: topic.keyword_principal,
    internalSlugs: existingSlugs,
  });

  if (gate.warnings.length) {
    console.warn("⚠️  Avertissements :\n  - " + gate.warnings.join("\n  - "));
  }

  if (!gate.ok) {
    const draftPath = await writeDraft(post, gate, topic);
    console.error(
      `❌ Garde-fous qualité ÉCHOUÉS — article NON publié.\n  - ${gate.errors.join("\n  - ")}\n📄 Brouillon écrit pour inspection : ${draftPath}`,
    );
    process.exit(1);
  }

  if (DRY_RUN) {
    const draftPath = await writeDraft(post, gate, topic);
    console.log(`✅ Garde-fous OK (${gate.words} mots). Brouillon (non publié) : ${draftPath}`);
    return;
  }

  await publishPost(post);
  await appendToLog({
    topicId: topic.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    date: post.datePublished,
    model: MODEL,
    words: gate.words,
    status: "published",
  });
  console.log(`✅ Publié : /blog/${post.slug} (${gate.words} mots). Sitemap + RSS régénérés.`);
  console.log(
    `ℹ️  Couverture par défaut utilisée : public${post.image}. Une couverture dédiée reste recommandée dans la PR.`,
  );
}

main().catch((err) => {
  console.error("❌ generate:", err.message);
  process.exit(1);
});
