#!/usr/bin/env node
/**
 * lsg-spacing.mjs — les séparateurs perdus de la Louis Segond.
 *
 * LE PROBLÈME, trouvé en vérifiant la description servie par `bible-meta` sur
 * les 42 URLs que Search Console montre réellement vues :
 *
 *     Jean 3:15 → « afin que quiconque croit en luiait la vie éternelle. »
 *     Jean 3:16 → « … son Fils unique,afin que quiconque … »
 *
 * Ce n'est pas la fonction qui abîme le texte : le défaut est dans les données
 * servies, donc aussi dans le lecteur. Sur les onze jeux de données bibliques du
 * site, **seul `fra_lsg` est touché** — et c'est celui qui reçoit la totalité du
 * trafic de recherche (« psaumes 92 louis segond », 34 impressions).
 *
 * 88 % des occurrences tombent dans un segment `wordsOfJesus` : l'import a
 * perdu l'espace à la frontière des segments en lettres rouges.
 *
 * DEUX RÈGLES, ET RIEN D'AUTRE. Ce script n'ajoute qu'un séparateur : aucune
 * lettre n'est modifiée, aucun mot n'est réécrit, rien n'est inventé.
 *
 *   R1 — ponctuation collée : `[,;:!?]` suivi immédiatement d'une lettre.
 *        Jamais correct en typographie française. Les 286 occurrences ont été
 *        relues : aucun faux positif.
 *
 *   R2 — mot soudé : une forme absente des DIX AUTRES versions françaises du
 *        site, et qui se découpe en deux mots dont l'enchaînement est attesté
 *        au moins trois fois dans LSG elle-même.
 *
 *        Les deux conditions sont nécessaires. La seconde seule laisse passer
 *        de vrais mots : `toile` (Job 8:14, « une toile d'araignée »), `tues`
 *        (Luc 13:34, « qui tues les prophètes »), `adonné` (1 Tim 3:3, « non
 *        adonné au vin »). Un vrai mot français existe forcément dans une autre
 *        traduction — la première condition les écarte tous.
 *
 *        Le séparateur est celui que LSG emploie le plus souvent pour cette
 *        paire, espace ou trait d'union. Genèse 12:1 le montre : `Vat’en` se
 *        répare en `Va-t’en` (LSG l'écrit ainsi 4 fois contre 1 avec espace,
 *        et NEG79 comme Darby le confirment), pas en `Va t’en`.
 *
 *   R3 — le verset parallèle. Une forme absente des dix autres versions, dont
 *        le découpage se lit tel quel DANS LE MÊME VERSET d'une traduction
 *        témoin, est prouvée — même si LSG n'enchaîne ces deux mots nulle part
 *        ailleurs.
 *
 *        C'est Jean 3:15, le verset qui a fait découvrir toute l'affaire :
 *        « croit en luiait la vie éternelle ». L'enchaînement « lui ait »
 *        n'apparaît qu'une fois dans LSG, sous le seuil de R2 — mais la
 *        Nouvelle Édition de Genève, qui est une révision de la Segond 1910,
 *        porte le verset identique avec l'espace. Preuve alignée sur le
 *        verset, dans la même tradition textuelle.
 *
 * Usage :
 *   bun run audit:lsg-spacing         # constate, ne modifie rien — doit rester à 0
 *   bun run fix:lsg-spacing           # applique sur place
 *   … --fix --out <dossier>           # écrit la version réparée à côté, pour relecture
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BIBLE = join(ROOT, "public/assets/bible");
const CIBLE = "fra_lsg";

/** Les autres traductions françaises servent de dictionnaire. */
const TEMOINS = [
  "fra_bds",
  "fra_brh_nt",
  "fra_fc",
  "fra_jnd",
  "fra_nbs",
  "fra_ncl",
  "fra_neg79",
  "fra_pdv",
  "fra_s21",
];

/** Un enchaînement vu moins de trois fois n'est pas une preuve. */
const SEUIL_BIGRAMME = 3;

/** Ponctuation collée à la lettre suivante. */
const PONCTUATION_COLLEE = /([,;:!?])(\p{L})/gu;

/** Un mot, apostrophes comprises — `maisc’est`, `del’arbre`, `j’étaisen`. */
const MOT = /[\p{L}][\p{L}'’]*/gu;

/** L'apostrophe typographique et l'apostrophe droite sont le même signe. */
const normaliser = (texte) => texte.toLowerCase().replace(/’/g, "'");

/** Le texte d'un verset mêle chaînes et objets `{ text, wordsOfJesus }`. */
function texteDe(morceaux) {
  return morceaux
    .map((morceau) => (typeof morceau === "string" ? morceau : (morceau?.text ?? "")))
    .join(" ");
}

function fichiersDe(dataset) {
  const out = [];
  const parcourir = (chemin) => {
    for (const entree of readdirSync(chemin)) {
      const complet = join(chemin, entree);
      if (statSync(complet).isDirectory()) {
        parcourir(complet);
      } else if (entree.endsWith(".json") && entree !== "books.json") {
        out.push(complet);
      }
    }
  };
  parcourir(join(BIBLE, dataset));
  return out.sort();
}

function versetsDe(dataset) {
  const out = [];
  for (const fichier of fichiersDe(dataset)) {
    let donnees;
    try {
      donnees = JSON.parse(readFileSync(fichier, "utf8"));
    } catch {
      continue;
    }
    for (const item of donnees?.chapter?.content ?? []) {
      if (item?.type !== "verse" || !Array.isArray(item.content)) continue;
      out.push({
        fichier,
        reference: `${relative(join(BIBLE, dataset), fichier).replace(/\.json$/, "")}:${item.number}`,
        texte: texteDe(item.content),
      });
    }
  }
  return out;
}

/**
 * Ce que disent les traductions témoins : leur vocabulaire, et leur texte
 * verset par verset.
 */
function temoignages() {
  const formes = new Set();
  const paralleles = new Map();
  for (const dataset of TEMOINS) {
    for (const verset of versetsDe(dataset)) {
      const texte = normaliser(verset.texte);
      const mots = texte.match(MOT) ?? [];
      for (const mot of mots) formes.add(mot);

      // On retient les COUPLES DE MOTS ADJACENTS, pas le texte brut : chercher
      // « et le » comme sous-chaîne le trouverait à l'intérieur de « et lever »
      // et validerait une coupe fausse.
      let couples = paralleles.get(verset.reference);
      if (!couples) {
        couples = new Set();
        paralleles.set(verset.reference, couples);
      }
      for (let i = 0; i + 1 < mots.length; i += 1) couples.add(`${mots[i]} ${mots[i + 1]}`);
    }
  }
  return { formes, paralleles };
}

/**
 * Ce que LSG enchaîne elle-même.
 *
 * Deux statistiques distinctes, et les confondre coûte des corrections :
 *
 *   `total` — combien de fois `a` précède `b`, QUELLE QUE SOIT la ponctuation
 *             intercalée. C'est la preuve que l'enchaînement existe. Ne compter
 *             que l'espace nu faisait tomber « cela parce » sous le seuil parce
 *             que LSG écrit surtout « cela, parce » — et Jean 10:36 restait
 *             cassé.
 *
 *   ` ` / `-` — parmi les seuls cas où le séparateur est nu, lequel domine.
 *             C'est ce qui donne « Va-t’en » et non « Va t’en » en Genèse 12:1.
 */
function enchainementsDe(versets) {
  const paires = new Map();
  for (const verset of versets) {
    const brut = normaliser(verset.texte);
    const trouves = [...brut.matchAll(MOT)];
    for (let i = 0; i + 1 < trouves.length; i += 1) {
      const gauche = trouves[i];
      const droite = trouves[i + 1];
      const cle = `${gauche[0]} ${droite[0]}`;
      const compte = paires.get(cle) ?? { total: 0, " ": 0, "-": 0 };
      compte.total += 1;
      const entre = brut.slice(gauche.index + gauche[0].length, droite.index);
      if (entre === " " || entre === "-") compte[entre] += 1;
      paires.set(cle, compte);
    }
  }
  return paires;
}

/**
 * Le découpage prouvé d'une forme, ou `null`.
 *
 * On retient la coupe dont l'enchaînement est le plus attesté ; à égalité, la
 * plus à gauche, pour rester déterministe.
 */
function decouper(forme, preuves, paralleles) {
  if (forme.length < 4) return null;
  if (preuves.formes.has(forme)) return null; // un vrai mot français existe ailleurs

  let meilleur = null;
  for (let i = 1; i < forme.length; i += 1) {
    const gauche = forme.slice(0, i);
    const droite = forme.slice(i);
    // « l'audience », « lorsqu'Élisée » : l'élision est correcte, pas une soudure.
    if (gauche.endsWith("'")) continue;

    const compte = preuves.enchainements.get(`${gauche} ${droite}`) ?? { total: 0, " ": 0, "-": 0 };

    // R3 — le même verset, chez un témoin, enchaîne-t-il déjà ces deux mots ?
    const atteste = paralleles?.has(`${gauche} ${droite}`) ?? false;
    if (!atteste && compte.total < SEUIL_BIGRAMME) continue;

    const force = atteste ? Number.MAX_SAFE_INTEGER - i : compte.total;
    if (meilleur && force <= meilleur.total) continue;

    // L'espace est la norme ; le trait d'union ne l'emporte que s'il domine.
    meilleur = {
      index: i,
      total: force,
      vu: compte.total,
      parallele: atteste,
      separateur: compte["-"] > compte[" "] ? "-" : " ",
    };
  }
  return meilleur;
}

/** Les corrections que ce verset appelle, dans l'ordre du texte. */
function corriger(texte, preuves, paralleles) {
  const apres = texte.replace(PONCTUATION_COLLEE, "$1 $2");

  let resultat = "";
  let curseur = 0;
  const soudures = [];

  for (const trouve of apres.matchAll(MOT)) {
    const coupe = decouper(normaliser(trouve[0]), preuves, paralleles);
    if (!coupe) continue;
    const brut = trouve[0];
    const repare = brut.slice(0, coupe.index) + coupe.separateur + brut.slice(coupe.index);
    soudures.push({ avant: brut, apres: repare, vu: coupe.vu, parallele: coupe.parallele });
    resultat += apres.slice(curseur, trouve.index) + repare;
    curseur = trouve.index + brut.length;
  }
  resultat += apres.slice(curseur);

  return {
    texte: resultat,
    ponctuation: [...texte.matchAll(PONCTUATION_COLLEE)].length,
    soudures,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const appliquer = process.argv.includes("--fix");
/** `--out <dossier>` : écrire ailleurs, pour relire le résultat avant de l'adopter. */
const sortie = (() => {
  const i = process.argv.indexOf("--out");
  return i === -1 ? null : resolve(process.argv[i + 1]);
})();

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log(
  `║  LOUIS SEGOND — SÉPARATEURS PERDUS ${appliquer ? "(correction)  " : "(constat)     "}           ║`,
);
console.log("╚════════════════════════════════════════════════════════════╝\n");

const { formes, paralleles } = temoignages();
const versets = versetsDe(CIBLE);
const preuves = { formes, enchainements: enchainementsDe(versets) };
console.log(`  dictionnaire : ${formes.size} formes, ${TEMOINS.length} traductions témoins`);
console.log(
  `  corpus LSG   : ${versets.length} versets, ${preuves.enchainements.size} enchaînements\n`,
);

let ponctuation = 0;
const soudures = new Map();
const touches = new Map();

for (const verset of versets) {
  const bilan = corriger(verset.texte, preuves, paralleles.get(verset.reference));
  if (bilan.texte === verset.texte) continue;

  ponctuation += bilan.ponctuation;
  for (const soudure of bilan.soudures) {
    const cle = `${soudure.avant} → ${soudure.apres}`;
    if (!soudures.has(cle)) {
      soudures.set(cle, { vu: soudure.vu, parallele: soudure.parallele, lieux: [] });
    }
    soudures.get(cle).lieux.push(verset.reference);
  }
  if (!touches.has(verset.fichier)) touches.set(verset.fichier, []);
  touches.get(verset.fichier).push(verset.reference);
}

const occurrences = [...soudures.values()].reduce((somme, s) => somme + s.lieux.length, 0);
console.log(`■ R1 — ponctuation collée   : ${ponctuation} occurrence(s)`);
console.log(
  `■ R2 — mots soudés          : ${soudures.size} forme(s), ${occurrences} occurrence(s)\n`,
);

if (soudures.size) {
  const triees = [...soudures].sort((a, b) => b[1].vu - a[1].vu);
  for (const [cle, detail] of triees.slice(0, Number(process.env.TOUT ?? 12))) {
    const preuve = detail.parallele
      ? "verset parallèle    "
      : `enchaînement vu ${String(detail.vu).padStart(4)}×`;
    console.log(`    ${cle.padEnd(38)} ${preuve}   ${detail.lieux[0]}`);
  }
  if (triees.length > Number(process.env.TOUT ?? 12))
    console.log(`    … et ${triees.length - 12} autres formes`);
  console.log("");
}

if (!appliquer) {
  const total = ponctuation + occurrences;
  console.log(
    total
      ? `✗ ${total} séparateur(s) manquant(s) dans ${touches.size} chapitre(s) — lancer \`bun run fix:lsg-spacing\`\n`
      : "✓ Louis Segond : aucun séparateur manquant\n",
  );
  process.exit(total ? 1 : 0);
}

// La correction ne réécrit QUE les champs de texte, morceau par morceau : la
// structure du JSON, les numéros de verset et les marqueurs `wordsOfJesus`
// restent intacts.
let chapitres = 0;
for (const fichier of touches.keys()) {
  const source = readFileSync(fichier, "utf8");
  const donnees = JSON.parse(source);
  let modifie = false;

  // Le dossier mêle les deux mises en forme — 988 fichiers indentés de deux
  // espaces, 202 compacts, avec ou sans saut de ligne final. Réécrire tout
  // dans un seul format noierait la correction sous un diff de 273 lignes par
  // chapitre. On rend donc à chaque fichier exactement la sienne.
  const indentation = /\n(\s+)"/.exec(source)?.[1].length ?? 0;
  const finDeLigne = source.endsWith("\n") ? "\n" : "";

  const livre = relative(join(BIBLE, CIBLE), fichier).replace(/\.json$/, "");
  for (const item of donnees?.chapter?.content ?? []) {
    if (item?.type !== "verse" || !Array.isArray(item.content)) continue;
    const temoins = paralleles.get(`${livre}:${item.number}`);
    // Parcours par indice : deux morceaux d'un même verset peuvent porter le
    // même texte, et `indexOf` viserait alors le premier des deux.
    for (let i = 0; i < item.content.length; i += 1) {
      const morceau = item.content[i];
      const avant = typeof morceau === "string" ? morceau : morceau?.text;
      if (typeof avant !== "string") continue;
      const repare = corriger(avant, preuves, temoins).texte;
      if (repare === avant) continue;
      if (typeof morceau === "string") item.content[i] = repare;
      else morceau.text = repare;
      modifie = true;
    }
  }

  if (!modifie) continue;
  const destination = sortie ? join(sortie, relative(join(BIBLE, CIBLE), fichier)) : fichier;
  if (sortie) mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(donnees, null, indentation) + finDeLigne, "utf8");
  chapitres += 1;
}

console.log(
  `✓ ${ponctuation + occurrences} séparateur(s) rétabli(s) dans ${chapitres} chapitre(s)` +
    (sortie ? `\n  écrits dans ${sortie} — les fichiers du dépôt sont intacts\n` : "\n"),
);
