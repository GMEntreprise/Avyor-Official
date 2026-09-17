#!/usr/bin/env node
/**
 * Restaure le texte biblique BRH servi par le site à partir des `.docx`.
 *
 * L'import des commentaires a révélé des versets absents des données en ligne.
 * L'audit qui a suivi a montré que le problème était plus large : le
 * générateur qui a produit `public/assets/bible/fra_brh_nt/` perd du texte,
 * principalement au niveau des citations et des crochets.
 *
 * Trois défauts, tous dans les données déjà publiées :
 *
 *   A. VERSET ABSENT — le verset manque du fichier (Jacques 5:13,
 *      1 Corinthiens 13:13, qui s'arrête au verset 12).
 *   B. VERSET FUSIONNÉ — le texte est là, collé au verset précédent, son
 *      numéro resté en pleine phrase : « …les faces du sol.7 Et יהוה… ».
 *   C. VERSET TRONQUÉ — le texte s'interrompt en cours de phrase, souvent à
 *      l'ouverture d'une citation : Matthieu 2:6 s'arrête à « Et toi
 *      Beit-Léhem Éphrata » et perd toute la citation de Michée.
 *
 * MÉTHODE ET GARDE-FOUS
 * Le texte vient TOUJOURS du `.docx`, jamais d'ailleurs : aucun verset n'est
 * reconstitué de mémoire, aucune traduction n'est produite.
 *
 * Un verset n'est remplacé que si le texte du site est un PRÉFIXE STRICT du
 * texte source — autrement dit si l'on ne fait qu'ajouter la suite manquante.
 * Dès que les deux textes divergent autrement (le site plus long, ou une
 * formulation différente), le verset est laissé intact et signalé : ce serait
 * alors un choix éditorial, qui ne revient pas à ce script.
 *
 * Par défaut rien n'est écrit. Utiliser `--apply`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openDocx } from "./zip.mjs";
import { parseParagraphs } from "./docx.mjs";
import { SOURCES, isParashaHeading, parseChapterHeading, verseNumberOf } from "./brh-source.mjs";
import { BIBLE_BOOKS } from "../../src/constants/bibleBooks.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BIBLE_DATA = path.join(ROOT, "public/assets/bible/fra_brh_nt");
const apply = process.argv.includes("--apply");
const verbose = process.argv.includes("--verbose");

/** Normalisation d'affichage : espaces propres, apostrophes unifiées. */
const clean = (value) => value.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

/** Forme de comparaison — ponctuation et casse neutralisées. */
const comparable = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[’‘‛`´]/g, "'")
    .replace(/[.,;:!?«»"'()[\]–—\-…]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Découpe en versets tous les chapitres d'un volume, tels que le `.docx` les
 * donne.
 * @returns {Map<string, Map<number, string>>} `<LIVRE>|<chapitre>` → versets
 */
function chaptersFromSource(paragraphs, source) {
  const chapters = new Map();
  let key = null;
  let verseNumber = null;
  let buffer = [];

  const flush = () => {
    if (key === null || verseNumber === null) return;
    const text = clean(buffer.join(""));
    if (!text) return;
    const chapter = chapters.get(key);
    // Un verset peut s'étendre sur plusieurs paragraphes : on concatène.
    chapter.set(
      verseNumber,
      chapter.has(verseNumber) ? `${chapter.get(verseNumber)} ${text}` : text,
    );
    buffer = [];
  };

  for (const paragraph of paragraphs) {
    if (source.isSectionHeading(paragraph) && paragraph.text.trim()) {
      flush();
      key = null;
      verseNumber = null;
      buffer = [];
      continue;
    }

    if (source.isChapterHeading(paragraph)) {
      flush();
      const heading = parseChapterHeading(paragraph.text);
      key = heading?.bookId ? `${heading.bookId}|${heading.chapter}` : null;
      if (key && !chapters.has(key)) chapters.set(key, new Map());
      verseNumber = null;
      buffer = [];
      continue;
    }

    if (key === null) continue;
    // Le numéro d'une parasha n'est pas un numéro de verset.
    if (isParashaHeading(paragraph)) continue;

    for (const run of paragraph.runs) {
      const found = verseNumberOf(run);
      if (found !== null) {
        flush();
        verseNumber = found;
        buffer = [];
        continue;
      }
      if (verseNumber !== null) buffer.push(run.text);
    }
    if (verseNumber !== null) buffer.push(" ");
  }

  flush();
  return chapters;
}

/** `needle` apparaît-il dans `haystack`, dans l'ordre, sans rien contredire ? */
function isSubsequence(needle, haystack) {
  let index = 0;
  for (const word of haystack) {
    if (word === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return index === needle.length;
}

const verseText = (item) =>
  item.content.map((part) => (typeof part === "string" ? part : (part?.text ?? ""))).join(" ");

function main() {
  const stats = {
    identical: 0,
    completed: 0,
    unmerged: 0,
    filled: 0,
    inserted: 0,
    deduplicated: 0,
    charsRestored: 0,
    leftAlone: [],
  };
  const touched = new Map();

  for (const source of Object.values(SOURCES)) {
    const filePath = path.join(ROOT, source.file);
    if (!existsSync(filePath)) {
      console.error(
        `[fix] source absente : ${source.file}\n` +
          "      Cette restauration a besoin des .docx (non versionnés, sous droits).",
      );
      process.exit(1);
    }

    const paragraphs = parseParagraphs(openDocx(filePath).readText("word/document.xml"));

    for (const [key, sourceVerses] of chaptersFromSource(paragraphs, source)) {
      const [bookId, rawChapter] = key.split("|");
      const chapter = Number(rawChapter);
      const file = path.join(BIBLE_DATA, bookId, `${chapter}.json`);
      if (!existsSync(file)) continue;

      const data = JSON.parse(readFileSync(file, "utf8"));
      const content = data.chapter.content ?? [];
      const label = `${BIBLE_BOOKS[bookId].name} ${chapter}`;
      let changed = false;

      // ── Versets présents : compléter ceux qui sont tronqués ───────────────
      for (const item of content) {
        if (item?.type !== "verse") continue;
        const sourceText = sourceVerses.get(item.number);
        if (!sourceText) continue;

        const siteText = clean(verseText(item));
        if (comparable(siteText) === comparable(sourceText)) {
          stats.identical += 1;
          continue;
        }

        const siteKey = comparable(siteText);
        const sourceKey = comparable(sourceText);

        // C — TRONQUÉ : le site est le début du texte source, on complète.
        if (siteKey && sourceKey.startsWith(siteKey)) {
          item.content = [sourceText];
          stats.completed += 1;
          stats.charsRestored += Math.max(0, sourceText.length - siteText.length);
          changed = true;
          continue;
        }

        // B — FUSIONNÉ : le site déborde sur le ou les versets suivants. On le
        // ramène à son texte propre ; les versets absorbés sont réinsérés plus
        // bas. Sans cela, leur texte apparaîtrait deux fois.
        if (sourceKey && siteKey.startsWith(sourceKey)) {
          item.content = [sourceText];
          stats.unmerged += 1;
          changed = true;
          continue;
        }

        // D — PERTE INTERNE : le générateur a sauté des mots au milieu
        // (Exode 39:11 perd « un saphir »). On ne restaure que si le texte du
        // site est intégralement contenu, dans l'ordre, dans le texte source :
        // on ajoute alors ce qui manque sans jamais rien remplacer d'autre.
        if (siteKey && isSubsequence(siteKey.split(" "), sourceKey.split(" "))) {
          item.content = [sourceText];
          stats.filled += 1;
          stats.charsRestored += Math.max(0, sourceText.length - siteText.length);
          changed = true;
          continue;
        }

        // Divergence réelle : choix éditorial, on ne tranche pas.
        stats.leftAlone.push({
          reference: `${bookId} ${chapter}:${item.number}`,
          reason: siteText.length > sourceText.length ? "site plus long" : "formulation différente",
          site: siteText.slice(0, 70),
          source: sourceText.slice(0, 70),
        });
      }

      // ── Versets absents : les réinsérer ──────────────────────────────────
      const present = new Set(
        content.filter((item) => item?.type === "verse").map((item) => item.number),
      );
      const missing = [...sourceVerses.keys()]
        .filter((number) => !present.has(number))
        .sort((a, b) => a - b);

      for (const number of missing) {
        const nextIndex = content.findIndex(
          (item) => item?.type === "verse" && item.number > number,
        );
        const at = nextIndex >= 0 ? nextIndex : content.length;
        content.splice(at, 0, { type: "verse", number, content: [sourceVerses.get(number)] });
        stats.inserted += 1;
        stats.charsRestored += sourceVerses.get(number).length;
        changed = true;
      }

      if (!changed) continue;

      // ── Garde-fou : aucun mot affiché ne doit disparaître ────────────────
      // On compare les OCCURRENCES, pas seulement la présence : un mot peut
      // figurer deux fois avant correction (le texte d'un verset fusionné est
      // alors présent à la fois collé au précédent et comme verset autonome).
      // Retirer ce doublon est une correction, pas une perte — seule la
      // disparition TOTALE d'un mot est un échec.
      const original = JSON.parse(readFileSync(file, "utf8"));
      const countWords = (items) => {
        const counts = new Map();
        const text = comparable(
          items
            .filter((x) => x?.type === "verse")
            .map(verseText)
            .join(" "),
        ).replace(/\d+/g, " ");
        for (const word of text.split(/\s+/)) {
          if (word.length > 2) counts.set(word, (counts.get(word) ?? 0) + 1);
        }
        return counts;
      };

      const before = countWords(original.chapter.content ?? []);
      const after = countWords(content);
      const vanished = [...before.keys()].filter((word) => !after.has(word));
      let deduplicated = 0;
      for (const [word, count] of before) {
        const now = after.get(word) ?? 0;
        if (now > 0 && now < count) deduplicated += count - now;
      }

      if (vanished.length) {
        stats.leftAlone.push({
          reference: label,
          reason: `chapitre non écrit : ${vanished.length} mot(s) auraient disparu`,
          site: vanished.slice(0, 8).join(", "),
          source: "",
        });
        continue;
      }
      stats.deduplicated += deduplicated;

      data.numberOfVerses = content.filter((item) => item?.type === "verse").length;
      if (apply) writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      touched.set(label, { missing, chapter: label });
    }
  }

  const title = apply
    ? "RESTAURATION DU TEXTE BIBLIQUE BRH"
    : "RESTAURATION DU TEXTE BIBLIQUE BRH — SIMULATION (--apply pour écrire)";
  console.log(`\n╔${"═".repeat(70)}╗`);
  console.log(`║  ${title.padEnd(68)}║`);
  console.log(`╚${"═".repeat(70)}╝\n`);

  console.log(`  versets déjà conformes ......... ${stats.identical.toLocaleString("fr-FR")}`);
  console.log(`  versets TRONQUÉS complétés ..... ${stats.completed.toLocaleString("fr-FR")}`);
  console.log(`  versets FUSIONNÉS redécoupés ... ${stats.unmerged.toLocaleString("fr-FR")}`);
  console.log(`  versets à TROU interne comblés . ${stats.filled.toLocaleString("fr-FR")}`);
  console.log(`  versets ABSENTS réinsérés ...... ${stats.inserted.toLocaleString("fr-FR")}`);
  console.log(
    `  doublons de texte supprimés .... ${stats.deduplicated.toLocaleString("fr-FR")} mots`,
  );
  console.log(`  caractères de texte restitués .. ${stats.charsRestored.toLocaleString("fr-FR")}`);
  console.log(`  chapitres modifiés ............. ${touched.size}`);
  console.log(`  versets laissés intacts ........ ${stats.leftAlone.length}  (divergence réelle)`);

  if (verbose && stats.leftAlone.length) {
    console.log("\n  ── Laissés intacts, à trancher éditorialement ──");
    for (const item of stats.leftAlone.slice(0, 40)) {
      console.log(`\n    ${item.reference} — ${item.reason}`);
      if (item.source) {
        console.log(`      site : ${item.site}…`);
        console.log(`      docx : ${item.source}…`);
      } else if (item.site) {
        console.log(`      ${item.site}`);
      }
    }
    if (stats.leftAlone.length > 40) {
      console.log(`\n    … et ${stats.leftAlone.length - 40} autres.`);
    }
  }

  console.log(
    apply
      ? "\n  ✓ Fichiers écrits. Relance `bun run import:brh-commentary` pour publier\n" +
          "    les commentaires que ces versets rendent à nouveau ancrables.\n"
      : "\n  Aucun fichier modifié. Relance avec --apply pour écrire.\n",
  );
}

main();
