/**
 * quality-gates.mjs — garde-fous QUALITÉ du blog automatique.
 * -------------------------------------------------------------------------
 * Contrôles NON NÉGOCIABLES avant qu'un article soit considéré publiable :
 *   1. Longueur minimale (corps + titre + description)
 *   2. Présence d'au moins un verset avec référence ET version valides
 *   3. Aucune promesse technique fausse (sécurité absolue, etc.)
 *   4. Ton conforme (pas de sensationnalisme)
 *   5. Slug unique (pas déjà utilisé par un article existant)
 *   6. Sujet non déjà publié (anti-doublon via published-log)
 *   7. Champs obligatoires présents et bien formés
 *
 * Renvoie { ok: boolean, errors: string[], warnings: string[] }.
 * Aucune dépendance externe — exécutable partout.
 */

const MIN_WORDS = 900;
const MAX_WORDS = 1800;
const VALID_CATEGORIES = ["foi", "fonctionnalites", "nouveautes", "communaute", "securite"];

// Tics rédactionnels « IA » interdits par la charte éditoriale (voix humaine).
const ROBOTIC_PHRASES = [
  /dans\s+(le\s+monde\s+d'aujourd'hui|notre\s+soci[ée]t[ée]\s+actuelle)/i,
  /[àa]\s+l'[èe]re\s+du\s+num[ée]rique/i,
  /il\s+est\s+important\s+de\s+noter/i,
  /il\s+convient\s+de\s+souligner/i,
  /force\s+est\s+de\s+constater/i,
  /\ben\s+conclusion\b/i,
  /\bpour\s+conclure\b/i,
  /\ben\s+somme\b/i,
  /\ben\s+d[ée]finitive\b/i,
  /que\s+vous\s+soyez\s+\w+\s+ou\s+\w+/i,
];

// Versions bibliques reconnues (référence + version exigées par la charte éditoriale)
const BIBLE_VERSIONS = [
  "Louis Segond",
  "Segond 21",
  "LSG",
  "LSG21",
  "S21",
  "NEG",
  "NBS",
  "BDS",
  "Semeur",
  "TOB",
  "Parole de Vie",
  "PDV",
  "Darby",
  "JND",
  "King James",
  "KJV",
  "BFC",
  "NFC",
];

// Promesses techniques fausses / dangereuses — interdites (anti-tromperie).
const FORBIDDEN_CLAIMS = [
  /100\s*%\s*(s[ûu]r|s[ée]curis|ind[ée]tectable|anonyme|infaillible|garanti)/i,
  /s[ée]curit[ée]\s+(absolue|totale|parfaite|inviolable)/i,
  /impossible\s+[àa]\s+(pirater|hacker|intercepter|cracker)/i,
  /aucun\s+risque/i,
  /jamais\s+piratable/i,
  /confidentialit[ée]\s+(absolue|totale|garantie\s+[àa]\s+100)/i,
  /prot[ée]g[ée]\s+[àa]\s+100\s*%/i,
];

// Sensationnalisme / ton non conforme à la charte (bienveillant, sobre).
const SENSATIONAL_TERMS = [
  /\bchoquant\b/i,
  /\bincroyable\b/i,
  /vous\s+n'?en\s+reviendrez\s+pas/i,
  /\bmiraculeux\b/i,
  /\brévolutionnaire\b/i,
  /le\s+secret\s+que\s+(personne|les\s+autres)/i,
  /astuce\s+qui\s+va\s+(tout\s+)?changer/i,
];

const SCRIPTURE_REF = /\b([1-3]\s?)?[A-ZÉÈÀ][\wÀ-ÿ]+(?:\s[A-ZÉÈÀ][\wÀ-ÿ]+)?\s\d+\s?:\s?\d+/;

function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

const STOPWORDS = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "de",
  "du",
  "des",
  "et",
  "ou",
  "on",
  "que",
  "qui",
  "quoi",
  "quand",
  "comment",
  "pour",
  "par",
  "sur",
  "dans",
  "en",
  "à",
  "au",
  "aux",
  "ne",
  "pas",
  "plus",
  "se",
  "sa",
  "son",
  "ses",
  "ma",
  "mon",
  "ton",
  "ta",
  "avec",
  "sans",
  "est",
  "sont",
  "y",
  "n",
  "l",
  "d",
  "c",
  "s",
]);

/** Mots significatifs (>3 lettres, hors stopwords) du mot-clé principal. */
function keywordTokens(keyword = "") {
  return keyword
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9']+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

/** Retire le markdown pour compter des mots « visibles ». */
function stripMarkdown(md = "") {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // liens → ancre
    .replace(/[#*>_`|-]/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * @param {object} post           Article candidat (forme BlogPost partielle).
 * @param {object} ctx            { existingSlugs: Set<string>, publishedTopicIds: Set<string>, topicId?: string }
 */
export function runQualityGates(post, ctx = {}) {
  const errors = [];
  const warnings = [];
  const existingSlugs = ctx.existingSlugs || new Set();
  const publishedTopicIds = ctx.publishedTopicIds || new Set();

  // 7. Champs obligatoires
  for (const field of ["slug", "title", "description", "category", "content", "imageAlt"]) {
    if (!post?.[field] || typeof post[field] !== "string" || !post[field].trim()) {
      errors.push(`Champ obligatoire manquant ou vide : "${field}"`);
    }
  }
  if (!Array.isArray(post?.tags) || post.tags.length < 2) {
    errors.push("Le champ `tags` doit contenir au moins 2 tags.");
  }
  if (!VALID_CATEGORIES.includes(post?.category)) {
    errors.push(
      `Catégorie invalide : "${post?.category}" (attendu : ${VALID_CATEGORIES.join(", ")}).`,
    );
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post?.slug || "")) {
    errors.push(`Slug invalide : "${post?.slug}" (kebab-case minuscule attendu).`);
  }

  // 1. Longueur
  if (post?.title && (post.title.length < 20 || post.title.length > 120)) {
    errors.push(`Titre hors limites (20–120 car.) : ${post.title.length} car.`);
  }
  if (post?.description && (post.description.length < 70 || post.description.length > 220)) {
    errors.push(`Meta description hors limites (70–220 car.) : ${post.description.length} car.`);
  }
  const words = post?.content ? wordCount(post.content) : 0;
  if (words < MIN_WORDS) {
    errors.push(`Corps trop court : ${words} mots (minimum ${MIN_WORDS}).`);
  }
  if (words > MAX_WORDS) {
    warnings.push(`Corps long : ${words} mots (cible ≤ ${MAX_WORDS}).`);
  }

  // 2. Verset + référence + version
  if (post?.content) {
    const hasRef = SCRIPTURE_REF.test(post.content);
    const hasVersion = BIBLE_VERSIONS.some((v) =>
      new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(post.content),
    );
    if (!hasRef) {
      errors.push("Aucune référence biblique détectée (ex. « Jean 3:16 »).");
    }
    if (!hasVersion) {
      errors.push(
        `Aucune version biblique citée (ex. « (Louis Segond) »). Versions reconnues : ${BIBLE_VERSIONS.slice(0, 6).join(", ")}…`,
      );
    }
  }

  // 3. Promesses techniques fausses
  if (post?.content) {
    for (const re of FORBIDDEN_CLAIMS) {
      const m = post.content.match(re);
      if (m) errors.push(`Promesse technique non vérifiable interdite : « ${m[0]} ».`);
    }
  }

  // 4. Ton / sensationnalisme
  if (post?.content) {
    for (const re of SENSATIONAL_TERMS) {
      const m = post.content.match(re);
      if (m) warnings.push(`Tournure potentiellement sensationnaliste : « ${m[0]} ».`);
    }
  }

  // 5. Slug unique
  if (post?.slug && existingSlugs.has(post.slug)) {
    errors.push(`Le slug « ${post.slug} » existe déjà.`);
  }

  // 6. Sujet non déjà publié
  if (ctx.topicId && publishedTopicIds.has(ctx.topicId)) {
    errors.push(`Le sujet « ${ctx.topicId} » a déjà été publié.`);
  }

  // 8. Titre SEO : cible < 60 caractères (avertissement seulement).
  if (post?.title && post.title.length > 60) {
    warnings.push(
      `Titre > 60 caractères (${post.title.length}) : risque de troncature dans Google.`,
    );
  }
  // Meta description : cible 150–160 caractères.
  if (post?.description && (post.description.length < 140 || post.description.length > 165)) {
    warnings.push(`Meta description hors cible 150–160 car. (${post.description.length}).`);
  }

  // 9. Christocentrisme : Jésus (ou Christ) nommé au moins 2 fois.
  if (post?.content) {
    const jesusCount = (post.content.match(/\b(j[ée]sus|christ)\b/gi) || []).length;
    if (jesusCount < 2) {
      errors.push(
        `Positionnement christocentrique insuffisant : « Jésus »/« Christ » cité ${jesusCount} fois (minimum 2).`,
      );
    }
  }

  // 10. Tics rédactionnels « IA » interdits.
  if (post?.content) {
    for (const re of ROBOTIC_PHRASES) {
      const m = post.content.match(re);
      if (m) errors.push(`Tournure robotique interdite par la charte : « ${m[0]} ».`);
    }
  }

  // 11. Maillage interne : au moins un lien Markdown vers un article existant.
  if (post?.content) {
    const linkSlugs = [...post.content.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
    if (linkSlugs.length === 0) {
      errors.push(
        "Aucun lien interne Markdown vers un article du blog (format [ancre](/blog/slug)).",
      );
    } else if (ctx.internalSlugs && ctx.internalSlugs.size) {
      const broken = linkSlugs.filter((s) => !ctx.internalSlugs.has(s) && s !== post.slug);
      if (broken.length) {
        errors.push(`Lien(s) interne(s) vers un slug inexistant : ${broken.join(", ")}.`);
      }
    }
  }

  // 12. Optimisation mot-clé principal (si fourni via ctx.keyword).
  if (post?.content && ctx.keyword) {
    const tokens = keywordTokens(ctx.keyword);
    const plain = stripMarkdown(post.content);
    const totalWords = (plain.match(/[a-z0-9']+/g) || []).length || 1;

    // a) présence dans les 100 premiers mots
    const first100 = plain.split(/\s+/).slice(0, 100).join(" ");
    const inIntro = tokens.some((tk) => first100.includes(tk));
    if (tokens.length && !inIntro) {
      warnings.push(
        `Le mot-clé principal (« ${ctx.keyword} ») n'apparaît pas dans les 100 premiers mots.`,
      );
    }

    // b) au moins 2 H2 contenant une variante du mot-clé
    const h2s = [...post.content.matchAll(/^##\s+(.+)$/gm)].map((m) =>
      m[1].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
    );
    const h2WithKw = h2s.filter((h) => tokens.some((tk) => h.includes(tk))).length;
    if (tokens.length && h2WithKw < 2) {
      warnings.push(
        `Seulement ${h2WithKw} titre(s) H2 contien(nen)t une variante du mot-clé (cible : ≥ 2).`,
      );
    }

    // Aucune densité artificielle : l'intention, l'introduction et les titres
    // sont contrôlés, mais le texte ne doit jamais répéter un terme pour
    // atteindre un pourcentage arbitraire.
    void totalWords;
  }

  return { ok: errors.length === 0, errors, warnings, words };
}
