/**
 * Le dessin propre à chaque article.
 *
 * Un motif par sujet, pas une image décorative interchangeable : le lecteur
 * doit reconnaître l'article à sa vignette. Les tracés sont fins, sans texte
 * (le titre est rendu par le site, donc traduit et net), et laissent de
 * l'espace libre — une vignette est toujours recadrée quelque part.
 *
 * Tout est en SVG : net à toutes les tailles, identique d'un build à l'autre,
 * et modifiable par un être humain qui lit le fichier.
 */

/** Trait fin doré, pour les tracés principaux. */
const GOLD = "rgba(214, 186, 128, 0.85)";
const GOLD_SOFT = "rgba(214, 186, 128, 0.34)";
/** Bleu clair, pour ce qui relève de la communication. */
const BLUE = "rgba(147, 190, 245, 0.82)";
const BLUE_SOFT = "rgba(147, 190, 245, 0.3)";

/**
 * Chaque motif est dessiné dans un carré de 400×400, centré.
 * L'échelle et le placement sont gérés par le gabarit.
 */

/** Un faisceau de lumière qui descend sur une eau calme — l'adoration. */
const soaking = `
  <g fill="none" stroke-linecap="round">
    ${[0, 1, 2, 3, 4]
      .map((index) => {
        const spread = (index - 2) * 26;
        return `<line x1="${200 + spread * 0.25}" y1="40" x2="${200 + spread}" y2="238"
          stroke="${index === 2 ? GOLD : GOLD_SOFT}" stroke-width="${index === 2 ? 2 : 1}" />`;
      })
      .join("")}
    <circle cx="200" cy="248" r="6" fill="${GOLD}" stroke="none" />
    ${[34, 62, 92, 124]
      .map(
        (radius, index) =>
          `<ellipse cx="200" cy="250" rx="${radius}" ry="${radius * 0.26}"
          stroke="${BLUE_SOFT}" stroke-width="${index === 0 ? 1.6 : 1}" />`,
      )
      .join("")}
  </g>`;

/** Un bouclier de lumière — la sécurité. */
const shield = `
  <g fill="none" stroke-linejoin="round">
    <path d="M200 66 L306 106 V196 C306 262 258 308 200 330 C142 308 94 262 94 196 V106 Z"
      stroke="${BLUE}" stroke-width="2" />
    <path d="M200 96 L278 126 V196 C278 246 242 282 200 300 C158 282 122 246 122 196 V126 Z"
      stroke="${BLUE_SOFT}" stroke-width="1.2" />
    <path d="M166 198 L192 226 L240 166" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round" />
  </g>`;

/** Un bouclier à plusieurs couches — la sécurité expliquée en profondeur. */
const layeredShield = `
  <g fill="none" stroke-linejoin="round">
    ${[0, 1, 2]
      .map((index) => {
        const inset = index * 26;
        const opacity = [0.85, 0.45, 0.25][index];
        return `<path d="M200 ${70 + inset} L${300 - inset} ${108 + inset * 0.6} V${192 - inset * 0.2}
        C${300 - inset} ${252 - inset * 0.4} ${254 - inset * 0.5} ${298 - inset * 0.6} 200 ${320 - inset}
        C${146 + inset * 0.5} ${298 - inset * 0.6} ${100 + inset} ${252 - inset * 0.4} ${100 + inset} ${192 - inset * 0.2}
        V${108 + inset * 0.6} Z"
        stroke="rgba(147, 190, 245, ${opacity})" stroke-width="${2 - index * 0.5}" />`;
      })
      .join("")}
    <circle cx="200" cy="200" r="7" fill="${GOLD}" />
  </g>`;

/** Une bulle de message scellée dans un cristal — le chiffrement. */
const encryption = `
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M138 136 H262 A16 16 0 0 1 278 152 V226 A16 16 0 0 1 262 242 H196 L166 268 V242 H138
      A16 16 0 0 1 122 226 V152 A16 16 0 0 1 138 136 Z" stroke="${BLUE}" stroke-width="2" />
    <path d="M200 84 L302 140 V244 L200 300 L98 244 V140 Z" stroke="${GOLD_SOFT}" stroke-width="1.4" />
    <path d="M200 84 V300 M98 140 L302 244 M302 140 L98 244"
      stroke="rgba(214, 186, 128, 0.14)" stroke-width="1" />
    ${[168, 200, 232].map((x) => `<circle cx="${x}" cy="190" r="4" fill="${GOLD}" />`).join("")}
  </g>`;

/** Un livre ouvert dont les pages se déploient — la Bible en plusieurs versions. */
const bible = `
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    ${[0, 1, 2, 3]
      .map((index) => {
        const lift = index * 13;
        const opacity = 0.5 - index * 0.11;
        return `<path d="M200 ${228 - lift} C168 ${204 - lift} 132 ${196 - lift} 96 ${200 - lift}
        M200 ${228 - lift} C232 ${204 - lift} 268 ${196 - lift} 304 ${200 - lift}"
        stroke="rgba(147, 190, 245, ${opacity})" stroke-width="1.2" />`;
      })
      .join("")}
    <path d="M200 242 C166 216 128 208 92 212 V286 C128 282 166 290 200 314
      C234 290 272 282 308 286 V212 C272 208 234 216 200 242 Z"
      stroke="${GOLD}" stroke-width="2" />
    <line x1="200" y1="242" x2="200" y2="314" stroke="${GOLD_SOFT}" stroke-width="1.4" />
    <circle cx="200" cy="122" r="5" fill="${GOLD}" />
  </g>`;

/** Une aube qui se lève — la dévotion quotidienne. */
const sunrise = `
  <g fill="none" stroke-linecap="round">
    <line x1="84" y1="266" x2="316" y2="266" stroke="${GOLD_SOFT}" stroke-width="1.4" />
    <path d="M126 266 A74 74 0 0 1 274 266" stroke="${GOLD}" stroke-width="2.4" />
    ${[-72, -48, -24, 0, 24, 48, 72]
      .map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = 200 + Math.cos(rad) * 96;
        const y1 = 266 + Math.sin(rad) * 96;
        const x2 = 200 + Math.cos(rad) * 128;
        const y2 = 266 + Math.sin(rad) * 128;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
        stroke="${GOLD_SOFT}" stroke-width="${angle === 0 ? 1.8 : 1}" />`;
      })
      .join("")}
  </g>`;

/** Un chemin de lumière jalonné — le parcours de lecture. */
const journey = `
  <g fill="none" stroke-linecap="round">
    <path d="M92 292 C142 292 148 216 200 216 C252 216 258 128 308 128"
      stroke="${GOLD_SOFT}" stroke-width="1.6" stroke-dasharray="1 9" />
    ${[
      [92, 292, 5],
      [146, 254, 4],
      [200, 216, 7],
      [254, 172, 4],
      [308, 128, 5],
    ]
      .map(
        ([x, y, r], index) =>
          `<circle cx="${x}" cy="${y}" r="${r}" fill="${index === 2 ? GOLD : GOLD_SOFT}" />`,
      )
      .join("")}
    <circle cx="200" cy="216" r="17" stroke="${GOLD_SOFT}" stroke-width="1.2" />
  </g>`;

/** Une carte de verset que l'on tend — le partage. */
const verseCard = `
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <rect x="118" y="126" width="164" height="112" rx="14" stroke="${GOLD_SOFT}" stroke-width="1.2"
      transform="rotate(-9 200 182)" />
    <rect x="130" y="150" width="164" height="112" rx="14" stroke="${GOLD}" stroke-width="2"
      transform="rotate(5 212 206)" />
    ${[182, 202, 222]
      .map(
        (y, index) =>
          `<line x1="${152 + index * 2}" y1="${y}" x2="${index === 2 ? 232 : 268}" y2="${y + index * 2}"
        stroke="${BLUE_SOFT}" stroke-width="2" transform="rotate(5 212 206)" />`,
      )
      .join("")}
    ${[
      [308, 118],
      [96, 262],
      [320, 268],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${GOLD_SOFT}" />`)
      .join("")}
  </g>`;

/** Des étincelles qui montent — une nouveauté. */
const sparks = `
  <g fill="none" stroke-linecap="round">
    ${[
      [140, 300, 152, 208],
      [176, 316, 186, 176],
      [212, 310, 218, 150],
      [248, 320, 252, 196],
      [284, 302, 274, 224],
    ]
      .map(
        ([x1, y1, x2, y2], index) =>
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="rgba(214, 186, 128, ${0.16 + index * 0.05})" stroke-width="1.2" />`,
      )
      .join("")}
    ${[
      [152, 200, 5],
      [186, 166, 3.5],
      [218, 138, 7],
      [252, 186, 3.5],
      [274, 214, 4.5],
      [200, 96, 3],
      [166, 116, 2.4],
      [236, 108, 2.4],
    ]
      .map(
        ([x, y, r], index) =>
          `<circle cx="${x}" cy="${y}" r="${r}" fill="${index === 2 ? GOLD : GOLD_SOFT}" />`,
      )
      .join("")}
  </g>`;

/** Deux chemins qui divergent — le comparatif. */
const twoPaths = `
  <g fill="none" stroke-linecap="round">
    <path d="M200 320 C200 270 160 248 126 226 C102 210 92 186 92 160"
      stroke="rgba(147, 190, 245, 0.26)" stroke-width="1.6" stroke-dasharray="6 8" />
    <path d="M200 320 C200 268 244 248 278 224 C304 206 314 178 314 148"
      stroke="${GOLD}" stroke-width="2.2" />
    <circle cx="200" cy="320" r="6" fill="${GOLD_SOFT}" />
    <circle cx="92" cy="160" r="5" fill="rgba(147, 190, 245, 0.3)" />
    <circle cx="314" cy="148" r="9" fill="${GOLD}" />
    <circle cx="314" cy="148" r="20" stroke="${GOLD_SOFT}" stroke-width="1.2" />
  </g>`;

/** Des points reliés en chaîne — la chaîne de prière. */
const prayerChain = `
  <g fill="none">
    ${Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * Math.PI * 2 - Math.PI / 2;
      const next = ((index + 1) / 7) * Math.PI * 2 - Math.PI / 2;
      const x1 = 200 + Math.cos(angle) * 104;
      const y1 = 200 + Math.sin(angle) * 104;
      const x2 = 200 + Math.cos(next) * 104;
      const y2 = 200 + Math.sin(next) * 104;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
        stroke="${GOLD_SOFT}" stroke-width="1.1" />`;
    }).join("")}
    ${Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * Math.PI * 2 - Math.PI / 2;
      const x = 200 + Math.cos(angle) * 104;
      const y = 200 + Math.sin(angle) * 104;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${index === 0 ? 7 : 5}"
        fill="${index === 0 ? GOLD : GOLD_SOFT}" />`;
    }).join("")}
    <circle cx="200" cy="200" r="15" stroke="${BLUE_SOFT}" stroke-width="1.4" />
    <circle cx="200" cy="200" r="4" fill="${BLUE}" />
  </g>`;

/** Des points de lumière reliés — la communauté. */
const community = `
  <g fill="none">
    ${[
      [200, 122, 148, 200],
      [200, 122, 252, 200],
      [148, 200, 200, 278],
      [252, 200, 200, 278],
      [148, 200, 252, 200],
      [200, 122, 200, 278],
    ]
      .map(
        ([x1, y1, x2, y2]) =>
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GOLD_SOFT}" stroke-width="1.1" />`,
      )
      .join("")}
    ${[
      [200, 122, 7],
      [148, 200, 5],
      [252, 200, 5],
      [200, 278, 5],
    ]
      .map(
        ([x, y, r], index) =>
          `<circle cx="${x}" cy="${y}" r="${r}" fill="${index === 0 ? GOLD : GOLD_SOFT}" />`,
      )
      .join("")}
  </g>`;

/**
 * Deux conversations reliées, traversées par une couche d'analyse.
 *
 * Le concept posé par le brief : une conversation privée qu'une couche
 * d'inspection traverse SANS en révéler le contenu. Pas de caméra, pas d'œil
 * géant, pas de cadenas énorme — l'image pose une question, elle ne fabrique
 * pas de peur.
 */
const scannedConversation = `
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M60 150 H150 A13 13 0 0 1 163 163 V211 A13 13 0 0 1 150 224 H104 L82 244 V224 H60
      A13 13 0 0 1 47 211 V163 A13 13 0 0 1 60 150 Z" stroke="${BLUE}" stroke-width="2" />
    <path d="M250 176 H340 A13 13 0 0 1 353 189 V237 A13 13 0 0 1 340 250 H318 V270 L296 250 H250
      A13 13 0 0 1 237 237 V189 A13 13 0 0 1 250 176 Z" stroke="${BLUE}" stroke-width="2" />

    <path d="M163 190 C190 190 210 212 237 212" stroke="${GOLD}" stroke-width="2.2" />

    ${[0, 1, 2, 3, 4, 5, 6]
      .map((index) => {
        const x = 178 + index * 7.5;
        return `<line x1="${x}" y1="140" x2="${x}" y2="264"
        stroke="rgba(214, 186, 128, ${index === 3 ? 0.26 : 0.13})" stroke-width="0.9" />`;
      })
      .join("")}
    <rect x="172" y="140" width="56" height="124" rx="6"
      stroke="rgba(214, 186, 128, 0.3)" stroke-width="1.1" />

    ${[
      [74, 178],
      [96, 178],
      [118, 178],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${BLUE_SOFT}" />`)
      .join("")}
    ${[
      [264, 204],
      [286, 204],
      [308, 204],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${BLUE_SOFT}" />`)
      .join("")}

    <circle cx="200" cy="202" r="5" fill="${GOLD}" />
  </g>`;

/** Un livre ouvert simple — repli de la catégorie « foi ». */
const faith = bible;

/**
 * Le motif de chaque article.
 *
 * Une entrée par article publié : la vignette doit se rapporter au sujet, pas
 * à une ambiance générale.
 */
export const MOTIFS = {
  "soaking-presence-entrer-dans-sa-presence": soaking,
  "securite-authentification-connectstar": shield,
  "passion-du-jour-devotion-quotidienne": sunrise,
  "parcours-lecture-biblique-connectstar": journey,
  "cartes-verset-partager-sa-foi": verseCard,
  "mise-a-jour-version-2-fonctionnalites": sparks,
  "pourquoi-connectstar-plutot-que-whatsapp": twoPaths,
  "bible-integree-11-versions": bible,
  "chaines-priere-fonctionnalite": prayerChain,
  "pourquoi-la-securite-de-connectstar-est-differente": layeredShield,
  "chiffrement-e2e-connectstar": encryption,
  "chat-control-confidentialite-messages-2026": scannedConversation,
};

/**
 * Repli par catégorie.
 *
 * Le blog publie un article tous les quinze jours par automatisation : un
 * article nouveau doit avoir une image tout de suite, sans attendre qu'un
 * motif lui soit dessiné.
 */
export const CATEGORY_MOTIFS = {
  foi: faith,
  fonctionnalites: journey,
  securite: shield,
  communaute: community,
  nouveautes: sparks,
};

/** Motif d'un article : le sien, sinon celui de sa catégorie. */
export function motifFor(slug, category) {
  return MOTIFS[slug] ?? CATEGORY_MOTIFS[category] ?? community;
}
