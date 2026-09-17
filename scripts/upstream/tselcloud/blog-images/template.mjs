/**
 * Le fond commun à toutes les images d'article.
 *
 * Une seule charte, appliquée à tous : bleu nuit ConnectStar, constellation
 * discrète, une touche dorée. C'est ce qui fait qu'une vignette est
 * reconnaissable avant même d'être lue — et ce qu'une banque d'images ne
 * donnera jamais.
 */
import { motifFor } from "./motifs.mjs";

/**
 * Constellation propre à chaque article.
 *
 * Tirée d'une graine dérivée du slug : chaque article a SA constellation, et
 * la même à chaque build. Un tirage aléatoire donnerait une image différente à
 * chaque génération — donc un diff à chaque build, et une identité qui bouge.
 */
function constellation(slug, width, height) {
  // Générateur congruentiel : court, déterministe, suffisant pour des étoiles.
  let seed = 0;
  for (const character of slug) seed = (seed * 31 + character.charCodeAt(0)) % 2147483647;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  const stars = Array.from({ length: 26 }, () => ({
    x: next() * width,
    y: next() * height,
    r: 0.7 + next() * 1.5,
    o: 0.16 + next() * 0.4,
  }));

  const dots = stars
    .map(
      (star) =>
        `<circle cx="${star.x.toFixed(1)}" cy="${star.y.toFixed(1)}" r="${star.r.toFixed(2)}" fill="rgba(214,186,128,${star.o.toFixed(2)})" />`,
    )
    .join("");

  // Quelques liens entre étoiles proches : une constellation, pas un semis.
  const links = [];
  for (let i = 0; i < stars.length && links.length < 7; i += 1) {
    for (let j = i + 1; j < stars.length; j += 1) {
      const distance = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (distance < width * 0.13) {
        links.push(
          `<line x1="${stars[i].x.toFixed(1)}" y1="${stars[i].y.toFixed(1)}" x2="${stars[j].x.toFixed(1)}" y2="${stars[j].y.toFixed(1)}" stroke="rgba(214,186,128,0.12)" stroke-width="0.7" />`,
        );
        break;
      }
    }
  }

  return links.join("") + dots;
}

/**
 * Compose la page à photographier.
 *
 * @param slug      identifiant de l'article
 * @param category  sa catégorie, pour le motif de repli
 * @param width     largeur en pixels
 * @param height    hauteur en pixels
 */
export function pageFor(slug, category, width, height) {
  // Le motif est dessiné dans un carré de 400 : on le place sur la droite en
  // format large, au centre en format compact. La zone laissée libre est celle
  // où le site écrira son titre.
  const wide = width / height > 1.5;
  const motifSize = Math.round(Math.min(width, height) * (wide ? 0.9 : 0.82));
  const motifX = wide ? width * 0.62 - motifSize / 2 : width / 2 - motifSize / 2;
  const motifY = height / 2 - motifSize / 2;

  return `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  html, body { margin: 0; padding: 0; background: #091428; }
  svg { display: block; }
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="ground" cx="26%" cy="14%" r="118%">
      <stop offset="0%" stop-color="#1f3d72" />
      <stop offset="36%" stop-color="#152c56" />
      <stop offset="72%" stop-color="#0d1c3a" />
      <stop offset="100%" stop-color="#070f20" />
    </radialGradient>

    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(120, 165, 235, 0.30)" />
      <stop offset="55%" stop-color="rgba(120, 165, 235, 0.10)" />
      <stop offset="100%" stop-color="rgba(120, 165, 235, 0)" />
    </radialGradient>

    <radialGradient id="vignette" cx="50%" cy="46%" r="76%">
      <stop offset="0%" stop-color="rgba(7, 15, 32, 0)" />
      <stop offset="68%" stop-color="rgba(7, 15, 32, 0)" />
      <stop offset="100%" stop-color="rgba(7, 15, 32, 0.55)" />
    </radialGradient>

    <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${(Math.min(width, height) * 0.004).toFixed(2)}" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#ground)" />
  ${constellation(slug, width, height)}

  <!-- Halo derrière le motif : il détache le tracé du fond sans l'éclairer. -->
  <circle cx="${(motifX + motifSize / 2).toFixed(0)}" cy="${(motifY + motifSize / 2).toFixed(0)}"
          r="${(motifSize * 0.62).toFixed(0)}" fill="url(#halo)" />

  <g transform="translate(${motifX.toFixed(1)}, ${motifY.toFixed(1)}) scale(${(motifSize / 400).toFixed(4)})"
     filter="url(#soften)" opacity="0.55">
    ${motifFor(slug, category)}
  </g>
  <g transform="translate(${motifX.toFixed(1)}, ${motifY.toFixed(1)}) scale(${(motifSize / 400).toFixed(4)})">
    ${motifFor(slug, category)}
  </g>

  <!-- Vignettage : le regard va au centre, les bords restent calmes. -->
  <rect width="${width}" height="${height}" fill="url(#vignette)" />
</svg>
</body></html>`;
}
