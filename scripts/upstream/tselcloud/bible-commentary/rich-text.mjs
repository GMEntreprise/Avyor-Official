/**
 * Runs Word → blocs de texte riche sûrs.
 *
 * Liste blanche stricte : paragraphe, liste, gras, italique, référence
 * biblique. C'est exactement — et uniquement — ce que les sources contiennent
 * (cf. `docs/bible/BRH_COMMENTARY_CONTENT_MAP.md` §8.2). Aucun HTML n'est
 * produit ici : le rendu se fait côté React à partir de ces blocs, donc rien
 * n'est jamais injecté sans passer par ce modèle.
 *
 * Fidélité : chaque item de liste conserve son marqueur d'origine, ce qui
 * permet de RECONSTRUIRE le texte source et donc de prouver l'absence de perte
 * plutôt que de l'affirmer (voir `tests/unit/rich-text.test.ts`).
 */
import { findBibleReferences } from "../../src/utils/bible/reference.ts";

/** « - texte », « – texte », « • texte » */
const UNORDERED_RE = /^([-–—•])\s+/;
/** « 1) texte », « 2. texte » */
const ORDERED_RE = /^(\d{1,2}[).])\s+/;

/**
 * Texte du paragraphe et style de CHAQUE caractère, alignés par construction.
 * C'est ce qui garantit qu'un passage en italique reste exactement sur les
 * mêmes caractères après normalisation des espaces.
 */
function charactersOf(runs) {
  const characters = [];
  for (const run of runs) {
    for (const char of run.text) {
      characters.push({ char, bold: run.bold, italic: run.italic });
    }
  }
  return characters;
}

/** Normalise les espaces en gardant le style aligné caractère par caractère. */
function normalizeCharacters(characters, { trimStart }) {
  const output = [];
  let index = 0;

  if (trimStart) {
    while (index < characters.length && /[\s  ]/.test(characters[index].char)) index++;
  }

  for (; index < characters.length; index++) {
    const entry = characters[index];
    const char = /[  ]/.test(entry.char) ? " " : entry.char;
    const previous = output[output.length - 1];
    // Espaces multiples réduits à un seul (la source en contient beaucoup,
    // hérités de la mise en page imprimée).
    if (char === " " && previous && previous.char === " ") continue;
    output.push({ ...entry, char });
  }

  while (output.length && output[output.length - 1].char === " ") output.pop();
  return output;
}

/**
 * Découpe en spans typés : les références priment sur le style (une référence
 * reste une unité cliquable), le style s'applique au reste.
 */
function buildSpans(characters) {
  const text = characters.map((entry) => entry.char).join("");
  if (!text) return [];

  const references = findBibleReferences(text);
  const spans = [];
  let cursor = 0;

  const pushStyled = (from, to) => {
    let index = from;
    while (index < to) {
      const { bold, italic } = characters[index];
      let end = index + 1;
      while (end < to && characters[end].bold === bold && characters[end].italic === italic) end++;
      const chunk = text.slice(index, end);
      if (bold) spans.push({ type: "strong", text: chunk });
      else if (italic) spans.push({ type: "emphasis", text: chunk });
      else spans.push({ type: "text", text: chunk });
      index = end;
    }
  };

  for (const reference of references) {
    if (reference.start > cursor) pushStyled(cursor, reference.start);
    spans.push({ type: "reference", text: reference.text, ref: reference.ref });
    cursor = reference.end;
  }
  if (cursor < text.length) pushStyled(cursor, text.length);

  // Fusion des spans adjacents de même type : évite des milliers de fragments
  // d'un caractère dans le JSON livré.
  const merged = [];
  for (const span of spans) {
    const previous = merged[merged.length - 1];
    if (previous && previous.type === span.type && span.type !== "reference") {
      previous.text += span.text;
    } else {
      merged.push({ ...span });
    }
  }
  return merged;
}

/**
 * Convertit les paragraphes d'une note en blocs.
 * @returns {{ blocks: object[], plainText: string }}
 */
export function buildBlocks(paragraphs) {
  const blocks = [];
  let isFirst = true;

  for (const paragraph of paragraphs) {
    // Word laisse une espace après le renvoi numéroté, en tête de note.
    const characters = normalizeCharacters(charactersOf(paragraph.runs), { trimStart: isFirst });
    isFirst = false;

    const text = characters.map((entry) => entry.char).join("");
    if (!text.trim()) continue;

    const unordered = UNORDERED_RE.exec(text);
    const ordered = unordered ? null : ORDERED_RE.exec(text);
    const match = unordered ?? ordered;

    if (match) {
      const item = {
        marker: match[1],
        spans: buildSpans(characters.slice(match[0].length)),
      };
      const isOrdered = Boolean(ordered);
      const previous = blocks[blocks.length - 1];
      if (previous && previous.type === "list" && previous.ordered === isOrdered) {
        previous.items.push(item);
      } else {
        blocks.push({ type: "list", ordered: isOrdered, items: [item] });
      }
      continue;
    }

    blocks.push({ type: "paragraph", spans: buildSpans(characters) });
  }

  return { blocks, plainText: blocksToPlainText(blocks) };
}

/** Texte brut des blocs, marqueurs de liste inclus : le rendu est réversible. */
export function blocksToPlainText(blocks) {
  const lines = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      lines.push(block.spans.map((span) => span.text).join(""));
    } else {
      for (const item of block.items) {
        lines.push(`${item.marker} ${item.spans.map((span) => span.text).join("")}`);
      }
    }
  }
  return lines.join("\n");
}

/** Texte destiné à la recherche : sans marqueur ni structure, accents conservés. */
export function blocksToSearchText(blocks) {
  return blocksToPlainText(blocks)
    .replace(/^(?:[-–—•]|\d{1,2}[).])\s/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
